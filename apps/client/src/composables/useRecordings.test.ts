import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Recording } from '@vermont/contracts';
import { recordingsService } from '@/services/recordings.service';
import { useListeningLibrary } from './useListeningLibrary';
import { useRecordings } from './useRecordings';

const player = vi.hoisted(() => ({ play: vi.fn() }));
vi.mock('@/composables/usePlayer', () => ({ usePlayer: () => player }));
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({ user: { value: { id: 'listener', email: 'listener@example.com' } } })
}));
vi.mock('@/services/recordings.service', () => ({
  recordingsService: { list: vi.fn() }
}));

const files: Recording[] = [
  { id: 'book', title: 'A story', originalFilename: 'chapter.mp3', sizeBytes: 10, createdAt: '2026-01-01' },
  { id: 'song', title: 'A song', originalFilename: 'track.mp3', sizeBytes: 20, createdAt: '2026-01-01' }
];

describe('dashboard file categories', () => {
  const library = useListeningLibrary();

  beforeEach(() => {
    vi.clearAllMocks();
    library.setCategory('book', 'books');
    library.setCategory('song', 'music');
    vi.mocked(recordingsService.list).mockResolvedValue(files);
  });

  it('combines category filtering with title and filename search', async () => {
    const recordings = useRecordings();
    await recordings.load(true);
    recordings.category.value = 'books';
    recordings.search.value = ' CHAPTER ';
    expect(recordings.visible.value.map((row) => row.id)).toEqual(['book']);
    recordings.category.value = 'music';
    expect(recordings.visible.value).toEqual([]);
    recordings.search.value = 'SONG';
    expect(recordings.visible.value.map((row) => row.id)).toEqual(['song']);
  });

  it('updates category counts and filtered files when a file is moved', async () => {
    const recordings = useRecordings();
    await recordings.load(true);
    recordings.category.value = 'books';
    expect(recordings.bookCount.value).toBe(1);
    expect(recordings.musicCount.value).toBe(1);
    library.setCategory('song', 'books');
    expect(recordings.bookCount.value).toBe(2);
    expect(recordings.musicCount.value).toBe(0);
    expect(recordings.visible.value).toHaveLength(2);
  });

  it('plays only the selected recording', async () => {
    const recordings = useRecordings();
    await recordings.load(true);
    recordings.category.value = 'books';
    recordings.play(files[0]!);
    expect(player.play).toHaveBeenCalledOnce();
    expect(player.play).toHaveBeenCalledWith(files[0]);
  });
});
