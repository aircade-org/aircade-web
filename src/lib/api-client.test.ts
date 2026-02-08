import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from './api-client';

describe('apiClient', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should have the correct base URL', () => {
    expect(apiClient.defaults.baseURL).toBe(`${process.env.API}/api/v1`);
  });

  it('should set Content-Type header to application/json', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('should be an axios instance', () => {
    expect(axios.isAxiosError).toBeDefined();
    expect(apiClient.get).toBeDefined();
    expect(apiClient.post).toBeDefined();
    expect(apiClient.patch).toBeDefined();
    expect(apiClient.delete).toBeDefined();
  });

  it('should inject Authorization header when access_token exists', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');

    const interceptors = apiClient.interceptors.request as unknown as {
      handlers: Array<{ fulfilled: (config: unknown) => unknown }>;
    };
    const requestInterceptor = interceptors.handlers[0].fulfilled;

    const config = {
      headers: {} as Record<string, string>,
    };

    const result = requestInterceptor(config) as {
      headers: { Authorization: string };
    };
    expect(result.headers.Authorization).toBe('Bearer test-token');
  });

  it('should not inject Authorization header when no token exists', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);

    const interceptors = apiClient.interceptors.request as unknown as {
      handlers: Array<{ fulfilled: (config: unknown) => unknown }>;
    };
    const requestInterceptor = interceptors.handlers[0].fulfilled;

    const config = {
      headers: {} as Record<string, string>,
    };

    const result = requestInterceptor(config) as {
      headers: Record<string, string>;
    };
    expect(result.headers.Authorization).toBeUndefined();
  });
});
