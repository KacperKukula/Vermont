import axios, { type AxiosRequestConfig } from 'axios';

// Shared HTTP transport; feature-specific endpoints live in *.service.ts.
const http = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export async function api<T>(path: string, options: AxiosRequestConfig = {}): Promise<T> {
  try {
    const response = await http.request<T>({ ...options, url: path });
    return response.data === '' ? null as T : response.data;
  } catch (cause) {
    if (axios.isAxiosError<{ message?: unknown }>(cause) && cause.response) {
      const message = cause.response.data?.message;
      throw new ApiError(
        typeof message === 'string' ? message : 'The operation could not be completed.',
        cause.response.status,
      );
    }
    throw cause;
  }
}

export function get<T>(path: string, options: Omit<AxiosRequestConfig, 'method' | 'data'> = {}): Promise<T> {
  return api<T>(path, { ...options, method: 'GET' });
}

export function post<T>(
  path: string,
  data?: unknown,
  options: Omit<AxiosRequestConfig, 'method' | 'data'> = {},
): Promise<T> {
  return api<T>(path, { ...options, method: 'POST', data });
}

export async function uploadFile(url: string, file: File, progress: (value: number) => void): Promise<void> {
  try {
    // Signed storage uploads do not use the API base URL or session cookies.
    await axios.put(url, file, {
      withCredentials: false,
      headers: { 'Content-Type': 'audio/mpeg', 'If-None-Match': '*' },
      timeout: 15 * 60 * 1000,
      onUploadProgress: ({ loaded, total }) => {
        if (total) progress(Math.round(loaded / total * 100));
      },
    });
  } catch (cause) {
    if (!axios.isAxiosError(cause)) throw cause;
    if (cause.code === 'ECONNABORTED' || cause.code === 'ETIMEDOUT') {
      throw new Error('The file upload timed out.');
    }
    if (!cause.response) {
      throw new Error('Could not connect to R2. Check your network and CORS configuration.');
    }
    throw new Error('The R2 upload failed. Check the CORS configuration and try again.');
  }
}
