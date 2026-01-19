const P5_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.3/p5.min.js';

const GAME_SCREEN_BRIDGE = `
<script>
  // AirCade Runtime API — Game Screen (Host)
  const AirCade = {
    _players: [],
    _sessionInfo: {},
    _onPlayerInputCallbacks: [],
    _onPlayerJoinCallbacks: [],
    _onPlayerLeaveCallbacks: [],

    getPlayers() { return [...this._players]; },
    getSessionInfo() { return { ...this._sessionInfo }; },

    onPlayerInput(callback) {
      this._onPlayerInputCallbacks.push(callback);
    },

    onPlayerJoin(callback) {
      this._onPlayerJoinCallbacks.push(callback);
    },

    onPlayerLeave(callback) {
      this._onPlayerLeaveCallbacks.push(callback);
    },

    broadcastState(state) {
      parent.postMessage({ type: 'aircade:broadcast_state', payload: { state } }, '*');
    },
  };

  window.addEventListener('message', function(event) {
    var msg = event.data;
    if (!msg || typeof msg.type !== 'string' || !msg.type.startsWith('aircade:')) return;

    switch (msg.type) {
      case 'aircade:init':
        AirCade._players = msg.payload.players || [];
        AirCade._sessionInfo = msg.payload.sessionInfo || {};
        parent.postMessage({ type: 'aircade:ready', payload: {} }, '*');
        break;
      case 'aircade:player_input':
        AirCade._onPlayerInputCallbacks.forEach(function(cb) { cb(msg.payload); });
        break;
      case 'aircade:player_joined':
        AirCade._players.push(msg.payload.player);
        AirCade._onPlayerJoinCallbacks.forEach(function(cb) { cb(msg.payload.player); });
        break;
      case 'aircade:player_left':
        AirCade._players = AirCade._players.filter(function(p) { return p.id !== msg.payload.playerId; });
        AirCade._onPlayerLeaveCallbacks.forEach(function(cb) { cb(msg.payload.playerId); });
        break;
    }
  });
<\/script>`;

const CONTROLLER_SCREEN_BRIDGE = `
<script>
  // AirCade Runtime API — Controller Screen (Player)
  const AirCade = {
    _player: null,
    _sessionInfo: {},
    _onStateUpdateCallbacks: [],

    getPlayer() { return this._player ? { ...this._player } : null; },
    getSessionInfo() { return { ...this._sessionInfo }; },

    sendInput(inputType, data) {
      parent.postMessage({ type: 'aircade:send_input', payload: { inputType, data } }, '*');
    },

    onStateUpdate(callback) {
      this._onStateUpdateCallbacks.push(callback);
    },
  };

  window.addEventListener('message', function(event) {
    var msg = event.data;
    if (!msg || typeof msg.type !== 'string' || !msg.type.startsWith('aircade:')) return;

    switch (msg.type) {
      case 'aircade:init':
        AirCade._player = msg.payload.player || null;
        AirCade._sessionInfo = msg.payload.sessionInfo || {};
        parent.postMessage({ type: 'aircade:ready', payload: {} }, '*');
        break;
      case 'aircade:state_update':
        AirCade._onStateUpdateCallbacks.forEach(function(cb) { cb(msg.payload.state); });
        break;
    }
  });
<\/script>`;

function buildSrcdoc(bridge: string, gameCode: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #141414; touch-action: none; }
    canvas { display: block; }
  </style>
</head>
<body>
  ${bridge}
  <script src="${P5_CDN}"><\/script>
  <script>${gameCode}<\/script>
</body>
</html>`;
}

export function buildGameScreenSrcdoc(gameCode: string): string {
  return buildSrcdoc(GAME_SCREEN_BRIDGE, gameCode);
}

export function buildControllerScreenSrcdoc(controllerCode: string): string {
  return buildSrcdoc(CONTROLLER_SCREEN_BRIDGE, controllerCode);
}
