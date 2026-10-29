import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import type { Recording } from '@vermont/contracts';
import { useNotifications } from '@/composables/useNotifications';
import { catchError } from '@/utils/error';

export const usePlayerStore = defineStore('player', () => {
  /* File contains the current audio element */
  let file: HTMLAudioElement | null = null;
  
  const playing = ref(false);

  const loading = ref(false);

  const buffering = ref(false);

  /* Elapsed playback time in seconds */
  const elapsed = ref(0);

  /* Total duration of the audio in seconds */
  const duration = ref(0);

  const volume = ref(0.8);
  const muted = ref(false);

  /* Speed of audio */
  const speed = ref(1);

  const { showError, clearError } = useNotifications();
  const busy = computed(() => loading.value || buffering.value);
  const volumeLevel = computed(() => muted.value ? 0 : volume.value * 100);

  function syncPreferences() {
    if (!file) return;
    file.volume = volume.value;
    file.muted = muted.value;
    file.playbackRate = speed.value;
  }

  watch([volume, muted, speed], syncPreferences, { flush: 'sync' });

  function syncTime() {
    if (!file) return;
    elapsed.value = Number.isFinite(file.currentTime) ? file.currentTime : 0;
    duration.value = Number.isFinite(file.duration) ? file.duration : 0;
  }

  function pause() {
    loading.value = false;
    file?.pause();
    playing.value = false;
    buffering.value = false;
  }

  function loadAudioFile(source: string) {
    pause();
    clearError();
    loading.value = false;
    elapsed.value = 0;
    duration.value = 0;

    if (!file) return;
    file.src = source;
    file.load();
    syncPreferences();
  }

  async function play() {
    if (!file || !file.src) return;
    clearError();

    const err = await catchError( file.play() );
    console.log(err)
  }

  async function togglePlayback() {
    if (playing.value) {
      pause();
      return;
    }
    await play();
  }

  function seek(seconds: number) {
    if (!file || !duration.value || !Number.isFinite(seconds)) return;
    file.currentTime = Math.min(duration.value, Math.max(0, seconds));
    syncTime();
  }

  function setVolume(value: number) {
    if (!Number.isFinite(value)) return;
    volume.value = Math.min(1, Math.max(0, value));
    muted.value = volume.value === 0;
  }

  function setSpeed(value: number) {
    if (!Number.isFinite(value) || value < 0.25 || value > 4) return;
    speed.value = value;
  }

  function toggleMute() {
    if (!volume.value) volume.value = 0.8;
    muted.value = !muted.value;
  }

  function reset() {
    pause();
    file?.removeAttribute('src');
    file?.load();
    loading.value = false;
    elapsed.value = 0;
    duration.value = 0;
  }


  return {
    playing,
    loading,
    buffering,
    elapsed,
    duration,
    volume,
    muted,
    speed,
    busy,
    volumeLevel,
    syncTime,
    syncPreferences,
    loadAudioFile,
    play,
    pause,
    togglePlayback,
    seek,
    setVolume,
    setSpeed,
    toggleMute,
    reset
  };
});
