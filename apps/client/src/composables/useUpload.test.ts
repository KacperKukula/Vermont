import { beforeEach, describe, expect, it, vi } from 'vitest';
import { recordingsService } from '@/services/recordings.service';
import { useUpload } from './useUpload';

const library = vi.hoisted(() => ({ setCategory: vi.fn() }));
vi.mock('@/composables/useListeningLibrary', () => ({ useListeningLibrary: () => library }));
vi.mock('@/services/http', () => ({ uploadFile: vi.fn() }));
vi.mock('@/services/recordings.service', () => ({
  recordingsService: { initiateUpload: vi.fn(), completeUpload: vi.fn(), remove: vi.fn() }
}));

describe('categorized uploads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(recordingsService.initiateUpload).mockResolvedValue({ id: 'upload', uploadUrl: 'https://example.com/upload' });
    vi.mocked(recordingsService.completeUpload).mockResolvedValue({
      id: 'upload', title: 'Chapter', originalFilename: 'chapter.mp3', sizeBytes: 10, createdAt: '2026-01-01'
    });
    vi.mocked(recordingsService.remove).mockResolvedValue(undefined);
  });

  it('assigns the chosen category after upload completion', async () => {
    const upload = useUpload();
    upload.selectFile({ name: 'chapter.mp3', size: 10 } as File);
    upload.category.value = 'books';
    expect(await upload.upload()).toBe(true);
    expect(library.setCategory).toHaveBeenCalledWith('upload', 'books');
    expect(upload.file.value).toBeNull();
  });

  it('does not assign a category when upload completion fails', async () => {
    vi.mocked(recordingsService.completeUpload).mockRejectedValue(new Error('Upload failed'));
    const upload = useUpload();
    upload.selectFile({ name: 'chapter.mp3', size: 10 } as File);
    upload.category.value = 'books';
    expect(await upload.upload()).toBe(false);
    expect(library.setCategory).not.toHaveBeenCalled();
    expect(upload.file.value).not.toBeNull();
    expect(upload.uploading.value).toBe(false);
  });
});
