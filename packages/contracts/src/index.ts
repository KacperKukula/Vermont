import { z } from 'zod';

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(12).max(128),
});

export const uploadSchema = z.object({
  title: z.string().trim().min(1).max(200),
  filename: z.string().trim().min(1).max(255).regex(/\.mp3$/i, 'Wybierz plik MP3'),
  sizeBytes: z.number().int().positive(),
});

export type Credentials = z.infer<typeof credentialsSchema>;
export type UploadInput = z.infer<typeof uploadSchema>;
export interface User { id: string; email: string }
export interface Recording {
  id: string;
  title: string;
  originalFilename: string;
  sizeBytes: number;
  createdAt: string;
}
export interface UploadTicket { id: string; uploadUrl: string }
