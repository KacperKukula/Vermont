import axios, { AxiosError, AxiosHeaders, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, describe, expect, it } from 'vitest';
import { api, ApiError, uploadFile } from './http';

const originalAdapter = axios.defaults.adapter;

function response(config: InternalAxiosRequestConfig, data: unknown, status = 200) {
  return { config, data, status, statusText: '', headers: new AxiosHeaders() };
}

afterEach(() => {
  axios.defaults.adapter = originalAdapter;
});

describe('API transport', () => {
  it('sends JSON requests with the API prefix and session cookies', async () => {
    const credentials = { email: 'listener@example.com', password: 'a-long-password' };
    const adapter: AxiosAdapter = async (config) => {
      expect(config.baseURL).toBe('/api');
      expect(config.url).toBe('/auth/login');
      expect(config.withCredentials).toBe(true);
      expect(config.headers.get('Content-Type')).toBe('application/json');
      expect(JSON.parse(config.data)).toEqual(credentials);
      return response(config, '{"id":"listener"}');
    };

    await expect(api('/auth/login', { method: 'POST', data: credentials, adapter }))
      .resolves.toEqual({ id: 'listener' });
  });

  it('accepts empty successful responses', async () => {
    await expect(api('/auth/logout', {
      method: 'POST',
      adapter: async (config) => response(config, '', 204),
    })).resolves.toBeNull();
  });

  it('preserves API error messages and status codes for session handling', async () => {
    const adapter: AxiosAdapter = async (config) => {
      throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined,
        response(config, { message: 'Invalid credentials' }, 401));
    };

    await expect(api('/auth/me', { adapter })).rejects.toMatchObject({
      message: 'Invalid credentials', status: 401,
    });
    await expect(api('/auth/me', { adapter })).rejects.toBeInstanceOf(ApiError);
  });

  it('uses a fallback message for non-JSON API failures', async () => {
    const adapter: AxiosAdapter = async (config) => {
      throw new AxiosError('Server error', 'ERR_BAD_RESPONSE', config, undefined,
        response(config, '<html>Server error</html>', 502));
    };

    await expect(api('/recordings', { adapter })).rejects.toMatchObject({
      message: 'The operation could not be completed.', status: 502,
    });
  });

  it('keeps network failures distinct from an expired session', async () => {
    const failure = new AxiosError('Network Error', 'ERR_NETWORK');
    await expect(api('/auth/me', { adapter: async () => { throw failure; } }))
      .rejects.toBe(failure);
  });
});

describe('storage uploads', () => {
  const file = new File(['audio'], 'recording.mp3', { type: 'audio/mpeg' });

  it('uploads to the signed URL without API cookies and reports progress', async () => {
    const progress: number[] = [];
    axios.defaults.adapter = async (config) => {
      expect(config.url).toBe('https://storage.example.com/signed-upload');
      expect(config.baseURL).toBeUndefined();
      expect(config.method).toBe('put');
      expect(config.data).toBe(file);
      expect(config.withCredentials).toBe(false);
      expect(config.headers.get('Content-Type')).toBe('audio/mpeg');
      expect(config.headers.get('If-None-Match')).toBe('*');
      expect(config.timeout).toBe(15 * 60 * 1000);
      config.onUploadProgress?.({ loaded: 5, total: 10, bytes: 5, lengthComputable: true, upload: true });
      config.onUploadProgress?.({ loaded: 10, bytes: 5, lengthComputable: false, upload: true });
      return response(config, '', 200);
    };

    await uploadFile('https://storage.example.com/signed-upload', file, (value) => progress.push(value));
    expect(progress).toEqual([50]);
  });

  it('reports upload timeouts', async () => {
    axios.defaults.adapter = async () => {
      throw new AxiosError('Timeout', 'ECONNABORTED');
    };

    await expect(uploadFile('https://storage.example.com/upload', file, () => {}))
      .rejects.toThrow('The file upload timed out.');
  });

  it('reports storage network failures', async () => {
    axios.defaults.adapter = async () => {
      throw new AxiosError('Network Error', 'ERR_NETWORK');
    };

    await expect(uploadFile('https://storage.example.com/upload', file, () => {}))
      .rejects.toThrow('Could not connect to R2.');
  });

  it('rejects unsuccessful storage responses', async () => {
    axios.defaults.adapter = async (config) => {
      throw new AxiosError('Forbidden', 'ERR_BAD_REQUEST', config, undefined,
        response(config, '', 403));
    };

    await expect(uploadFile('https://storage.example.com/upload', file, () => {}))
      .rejects.toThrow('The R2 upload failed.');
  });
});
