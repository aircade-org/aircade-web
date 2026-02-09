type WsMessageHandler = (payload: Record<string, unknown>) => void;

function buildWsUrl(sessionId: string, params: Record<string, string>): string {
  const apiUrl = process.env.API ?? '';
  const wsBase = apiUrl.replace(/^http/, 'ws');
  const query = new URLSearchParams(params).toString();
  return `${wsBase}/api/v1/sessions/${sessionId}/ws?${query}`;
}

export class WsClient {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, Set<WsMessageHandler>>();
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private shouldReconnect = true;
  private url: string;

  private onOpenCallback: (() => void) | null = null;
  private onCloseCallback: ((code: number) => void) | null = null;

  constructor(sessionId: string, params: Record<string, string>) {
    this.url = buildWsUrl(sessionId, params);
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.startPing();
      this.onOpenCallback?.();
    };

    this.ws.onclose = (event) => {
      this.stopPing();
      this.onCloseCallback?.(event.code);

      if (
        this.shouldReconnect &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 16000);
        this.reconnectTimer = setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, delay);
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as {
          type: string;
          payload: Record<string, unknown>;
        };
        const handlers = this.handlers.get(msg.type);
        if (handlers) {
          handlers.forEach((handler) => handler(msg.payload));
        }
      } catch {
        // Ignore malformed messages
      }
    };

    this.ws.onerror = () => {
      // onclose will fire after onerror, reconnection handled there
    };
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.stopPing();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000);
      this.ws = null;
    }

    this.handlers.clear();
  }

  send(type: string, payload: Record<string, unknown>): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return;

    this.ws.send(
      JSON.stringify({
        type,
        payload,
        timestamp: new Date().toISOString(),
        messageId: crypto.randomUUID(),
      }),
    );
  }

  on(type: string, handler: WsMessageHandler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)?.add(handler);
  }

  off(type: string, handler: WsMessageHandler): void {
    this.handlers.get(type)?.delete(handler);
  }

  onOpen(callback: () => void): void {
    this.onOpenCallback = callback;
  }

  onClose(callback: (code: number) => void): void {
    this.onCloseCallback = callback;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private startPing(): void {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      this.send('ping', {});
    }, 25000);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}
