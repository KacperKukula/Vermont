// Shared HTTP transport; feature-specific endpoints live in *.service.ts.
export class ApiError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(typeof body?.message === 'string' ? body.message : 'Nie udało się wykonać operacji', response.status);
  return body as T;
}

export function uploadFile(url: string, file: File, progress: (value: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', 'audio/mpeg');
    xhr.setRequestHeader('If-None-Match', '*');
    xhr.timeout = 15 * 60 * 1000;
    xhr.upload.onprogress = (event) => { if (event.lengthComputable) progress(Math.round(event.loaded / event.total * 100)); };
    xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('Upload do R2 nie powiódł się. Sprawdź konfigurację CORS i spróbuj ponownie.'));
    xhr.onerror = () => reject(new Error('Brak połączenia z R2. Sprawdź sieć i konfigurację CORS.'));
    xhr.ontimeout = () => reject(new Error('Przekroczono czas przesyłania pliku.'));
    xhr.send(file);
  });
}
