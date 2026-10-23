import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Recording } from '@people/contracts';
import { recordingsService } from '../services/recordings.service';
import { usePlayer } from './usePlayer';

vi.mock('../services/recordings.service', () => ({
  recordingsService: { playback: vi.fn() },
}));

const recording = (id: string): Recording => ({
  id, title: id, originalFilename: `${id}.mp3`, sizeBytes: 10, createdAt: '2026-01-01',
});

describe('shared audio player', () => {
  const player = usePlayer();
  let element: HTMLAudioElement;

  beforeEach(() => {
    player.reset();
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

  it('plays the next item in the queue', async () => {
    player.setQueue([recording('one'), recording('two')]);
    await player.play(recording('one'));
    player.next();
    await vi.waitFor(() => expect(element.src).toBe('https://example.com/two'));
    expect(player.current.value?.id).toBe('two');
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
    player.removeFromQueue('one');
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
});
