import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import exampleAudio from '@/assets/example.mp3';
import { usePlayerStore } from '@/stores/player';

export function useAudioPlayback() {
  const audioFile = ref<HTMLAudioElement>();
  const player = usePlayerStore();
  const status = computed(() => player.busy ? 'Loading audio…' : player.current ? 'Your private library' : 'Sample audio · MP3');

  function loadAudioFile(source: string = exampleAudio) {
    player.loadAudioFile(source);
  }

  async function togglePlayback() {
    if (!player.current && !player.audioUrl) loadAudioFile();
    await player.togglePlayback();
  }

  function handleEnded() {
    player.setPlaying(false);
    player.buffering = false;
  }

  onMounted(() => {
    player.attach(audioFile.value ?? null);
    if (!player.current && !player.audioUrl) loadAudioFile();
  });

  onBeforeUnmount(() => {
    player.reset();
    player.attach(null);
  });

  return {
    ...storeToRefs(player),
    audio: audioFile,
    status,
    loadAudioFile,
    syncTime: player.syncTime,
    syncPreferences: player.syncPreferences,
    togglePlayback,
    seek: player.seek,
    changeVolume: player.setVolume,
    toggleMute: player.toggleMute,
    handleEnded,
    handleError: player.playbackError,
    setPlaying: player.setPlaying
  };
}
