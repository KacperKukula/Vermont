<script setup lang="ts">
import SkipBackIcon from '@/assets/icons/player/skip-back.svg?component';
import LoadingIcon from '@/assets/icons/player/loading.svg?component';
import PauseIcon from '@/assets/icons/player/pause.svg?component';
import PlayIcon from '@/assets/icons/player/play.svg?component';
import SkipForwardIcon from '@/assets/icons/player/skip-forward.svg?component';
import PlayerButton from './PlayerButton.vue';

defineProps<{
  playing: boolean;
  loading: boolean;
  busy: boolean;
  canSeek: boolean;
}>();
const emit = defineEmits<{
  toggle: [];
  skip: [seconds: number];
}>();
</script>

<template>
  <div class="player-controls">
    <PlayerButton :disabled="!canSeek || loading" aria-label="Skip back 15 seconds" title="Back 15 seconds" @click="emit('skip', -15)">
      <SkipBackIcon aria-hidden="true" />
    </PlayerButton>
    <PlayerButton class="player-button--play" :disabled="loading" :aria-label="playing ? 'Pause' : 'Play'" :title="playing ? 'Pause' : 'Play'" @click="emit('toggle')">
      <LoadingIcon v-if="busy" class="player-controls__spinner" aria-hidden="true" />
      <PauseIcon v-else-if="playing" aria-hidden="true" />
      <PlayIcon v-else aria-hidden="true" />
    </PlayerButton>
    <PlayerButton :disabled="!canSeek || loading" aria-label="Skip forward 15 seconds" title="Forward 15 seconds" @click="emit('skip', 15)">
      <SkipForwardIcon aria-hidden="true" />
    </PlayerButton>
  </div>
</template>

<style scoped lang="scss">
.player-controls {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: tokens.$space-5;
}
.player-controls__spinner { animation: player-spin 1s linear infinite; }
@include mixins.mobile {
  .player-controls { gap: tokens.$space-6; }
}
@keyframes player-spin {
  to { transform: rotate(360deg); }
}

</style>
