import { storeToRefs } from 'pinia';
import { usePlayerStore } from '@/stores/player';

// Preserve the ref-based API and recording-list toggle behavior for existing consumers.
export function usePlayer() {
  const player = usePlayerStore();
  return {
    ...storeToRefs(player),
    attach: player.attach,
    play: player.togglePlayback,
    reset: player.reset,
    forgetRecording: player.forgetRecording,
    playbackError: player.playbackError,
    setPlaying: player.setPlaying
  };
}
