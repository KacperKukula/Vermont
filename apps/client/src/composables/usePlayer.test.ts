import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { Recording } from '@vermont/contracts';
import { recordingsService } from '@/services/recordings.service';
import { usePlayer } from './usePlayer';

const library = vi.hoisted(() => ({ remember: vi.fn(), forget: vi.fn() }));
vi.mock('@/composables/useListeningLibrary', () => ({
  useListeningLibrary: () => library
}));

vi.mock('@/services/recordings.service', () => ({
  recordingsService: { playback: vi.fn() },
}));

const recording = (id: string): Recording => ({
  id, title: id, originalFilename: `${id}.mp3`, sizeBytes: 10, createdAt: '2026-01-01',
});

describe('shared audio player', () => {
  let player: ReturnType<typeof usePlayer>;
  let element: HTMLAudioElement;

  beforeEach(() => {
    setActivePinia(createPinia());
    player = usePlayer();
    vi.clearAllMocks();
    element = {
      src: '', play: vi.fn().mockResolvedValue(undefined), pause: vi.fn(),
      load: vi.fn(), removeAttribute: vi.fn(),
    } as unknown as HTMLAudioElement;
    player.attach(element);
    vi.mocked(recordingsService.playback).mockImplementation(async (id) => ({ url: `https://example.com/${id}` }));
  });

  it('shares the active recording between consumers', async () => {
    await player.play(recording('one'));
    expect(usePlayer().current.value?.id).toBe('one');
    expect(element.src).toBe('https://example.com/one');
    expect(element.play).toHaveBeenCalledOnce();
  });

  it('pauses the currently playing recording instead of reloading its URL', async () => {
    await player.play(recording('one'));
    player.setPlaying(true);
    await player.play(recording('one'));
    expect(recordingsService.playback).toHaveBeenCalledOnce();
    expect(element.pause).toHaveBeenCalled();
  });

  it('clears player state when the active recording is deleted', async () => {
    await player.play(recording('one'));
    player.forgetRecording('one');
    expect(player.current.value).toBeNull();
    expect(player.playing.value).toBe(false);
    expect(element.removeAttribute).toHaveBeenCalledWith('src');
  });

  it('ignores a playback URL resolved after logout/reset', async () => {
    let resolve!: (value: { url: string }) => void;
    vi.mocked(recordingsService.playback).mockReturnValue(new Promise((done) => { resolve = done; }));
    const pending = player.play(recording('one'));
    player.reset();
    resolve({ url: 'https://example.com/stale' });
    await pending;
    expect(player.current.value).toBeNull();
    expect(element.play).not.toHaveBeenCalled();
  });

  it('adds a recording to history only when audio actually starts playing', async () => {
    await player.play(recording('one'));
    expect(library.remember).not.toHaveBeenCalled();
    player.setPlaying(true);
    expect(library.remember).toHaveBeenCalledWith(recording('one'));
    player.setPlaying(false);
    expect(library.remember).toHaveBeenCalledOnce();
  });

  it('does not add failed playback attempts to history', async () => {
    vi.mocked(recordingsService.playback).mockRejectedValue(new Error('Unavailable'));
    await player.play(recording('one'));
    expect(library.remember).not.toHaveBeenCalled();
  });

  it('removes a deleted recording from history', () => {
    player.forgetRecording('one');
    expect(library.forget).toHaveBeenCalledWith('one');
  });
});
