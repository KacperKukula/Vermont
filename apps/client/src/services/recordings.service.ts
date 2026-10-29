import type { Recording, UploadInput, UploadTicket } from '@vermont/contracts';
import { api } from './http';

export const recordingsService = {
  list: (offset = 0) => api<Recording[]>('/recordings', { params: { offset } }),
  initiateUpload: (input: UploadInput) => api<UploadTicket>('/recordings/upload', {
    method: 'POST', data: input,
  }),
  completeUpload: (id: string) => api<Recording>(`/recordings/${id}/complete`, { method: 'POST' }),
  playback: (id: string) => api<{ url: string }>(`/recordings/${id}/playback`),
  remove: (id: string) => api(`/recordings/${id}`, { method: 'DELETE' }),
};
