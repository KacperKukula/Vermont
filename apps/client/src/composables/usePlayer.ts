import { readonly, ref, shallowRef } from 'vue';
import type { Recording } from '@vermont/contracts';
import { recordingsService } from '@/services/recordings.service';
import { useNotifications } from './useNotifications';
import { useListeningLibrary } from './useListeningLibrary';

const current = ref<Recording | null>(null);
const audio = shallowRef<HTMLAudioElement | null>(null);
const playing = ref(false);
const loading = ref(false);
const audioUrl = ref('');
let queue: readonly Recording[] = [];
let playRequest = 0;

export function usePlayer() {
  const { showError, clearError } = useNotifications();
  const library = useListeningLibrary();

  function attach(element: HTMLAudioElement | null) { audio.value = element; }
  function setQueue(recordings: readonly Recording[]) { queue = [...recordings]; }

  async function play(recording: Recording) {
    clearError();
    if (current.value?.id === recording.id && audioUrl.value) {
      try {
        if (playing.value) audio.value?.pause();
        else await audio.value?.play();
      } catch {
        showError('Nie można odtworzyć pliku. Wybierz nagranie ponownie.');
        audioUrl.value = '';
      }
      return;
    }

    const request = ++playRequest;
    audio.value?.pause();
    current.value = recording;
    loading.value = true;
    audioUrl.value = '';
    audio.value?.removeAttribute('src');
    audio.value?.load();
    try {
      const result = await recordingsService.playback(recording.id);
      if (request !== playRequest) return;
      audioUrl.value = result.url;
      if (audio.value) {
        audio.value.src = result.url;
        await audio.value.play();
      }
    } catch (cause) {
      if (request === playRequest) showError(cause);
    } finally {
      if (request === playRequest) loading.value = false;
    }
  }

  function next() {
    const index = queue.findIndex((recording) => recording.id === current.value?.id);
    const nextTrack = index >= 0 ? queue[index + 1] : undefined;
    if (nextTrack) void play(nextTrack);
  }

  function reset() {
    ++playRequest;
    audio.value?.pause();
    audio.value?.removeAttribute('src');
    audio.value?.load();
    current.value = null;
    audioUrl.value = '';
    playing.value = false;
    loading.value = false;
    queue = [];
  }

  function removeFromQueue(id: string) {
    library.forget(id);
    const remaining = queue.filter((recording) => recording.id !== id);
    if (current.value?.id === id) reset();
    queue = remaining;
  }

  function playbackError() {
    if (!audioUrl.value) return;
    audioUrl.value = '';
    playing.value = false;
    showError('Nie można odtworzyć MP3. Link mógł wygasnąć — wybierz nagranie ponownie.');
  }

  function setPlaying(value: boolean) {
    playing.value = value;
    if (value && current.value && audioUrl.value) library.remember(current.value);
  }

  return {
    current: readonly(current),
    playing: readonly(playing),
    loading: readonly(loading),
    attach,
    setQueue,
    play,
    next,
    reset,
    removeFromQueue,
    playbackError,
    setPlaying
  };
}
