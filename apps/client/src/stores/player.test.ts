import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { Recording } from '@vermont/contracts';
import { recordingsService } from '@/services/recordings.service';
import { usePlayerStore } from './player';

vi.mock('@/services/recordings.service', () => ({
  recordingsService: { playback: vi.fn() }
}));
vi.mock('@/composables/useListeningLibrary', () => ({
  useListeningLibrary: () => ({ remember: vi.fn(), forget: vi.fn() })
}));

describe('player store', () => {
  let player: ReturnType<typeof usePlayerStore>;
  let audio: HTMLAudioElement;
  const recording: Recording = {
    id: 'one',
    title: 'One',
    originalFilename: 'one.mp3',
    sizeBytes: 10,
    createdAt: '2026-01-01'
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    player = usePlayerStore();
    audio = {
      src: '',
      currentTime: 0,
      duration: 120,
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      load: vi.fn(),
      removeAttribute: vi.fn()
    } as unknown as HTMLAudioElement;
    player.attach(audio);
    vi.mocked(recordingsService.playback).mockResolvedValue({ url: '/one.mp3' });
  });

  it('shares controls and applies preferences to the attached audio element', () => {
    const other = usePlayerStore();
    other.setVolume(0.4);
    other.setSpeed(1.5);
    other.toggleMute();
    expect(player.volume).toBe(0.4);
    expect(audio.volume).toBe(0.4);
    expect(audio.playbackRate).toBe(1.5);
    expect(audio.muted).toBe(true);
  });

  it('keeps separate Pinia instances independent', () => {
    player.setVolume(0.2);
    const other = usePlayerStore(createPinia());
    expect(other.volume).toBe(0.8);
    expect(other.current).toBeNull();
  });

  it('loads a local source without autoplay or stale recording metadata', async () => {
    await player.play(recording);
    vi.mocked(audio.play).mockClear();
    player.loadAudioFile('/sample.mp3');
    expect(player.current).toBeNull();
    expect(player.audioUrl).toBe('/sample.mp3');
    expect(audio.src).toBe('/sample.mp3');
    expect(audio.play).not.toHaveBeenCalled();
    expect(player.playing).toBe(false);
  });

  it('resumes with play and pauses with an explicit action', async () => {
    await player.play(recording);
    player.setPlaying(true);
    vi.mocked(audio.pause).mockClear();
    await player.play();
    expect(audio.pause).not.toHaveBeenCalled();
    expect(recordingsService.playback).toHaveBeenCalledOnce();
    player.pause();
    expect(audio.pause).toHaveBeenCalledOnce();
    expect(player.playing).toBe(false);
  });

  it('clamps seeking to the audio duration', () => {
    player.syncTime();
    player.seek(200);
    expect(audio.currentTime).toBe(120);
    expect(player.elapsed).toBe(120);
    player.seek(-10);
    expect(audio.currentTime).toBe(0);
  });

  it.each(['pause', 'reset', 'loadAudioFile'] as const)('ignores a pending recording after %s', async (action) => {
    let resolve!: (value: { url: string }) => void;
    vi.mocked(recordingsService.playback).mockReturnValue(new Promise((done) => { resolve = done; }));
    const pending = player.play(recording);
    if (action === 'loadAudioFile') player.loadAudioFile('/sample.mp3');
    else player[action]();
    resolve({ url: '/stale.mp3' });
    await pending;
    expect(audio.src).not.toBe('/stale.mp3');
    expect(audio.play).not.toHaveBeenCalled();
    expect(player.loading).toBe(false);
  });
});
