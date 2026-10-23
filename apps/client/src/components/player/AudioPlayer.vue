<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { usePlayer } from '../../composables/usePlayer';

const audio = ref<HTMLAudioElement>();
const { current, playing, loading, attach, next, reset, playbackError, setPlaying } = usePlayer();

onMounted(() => attach(audio.value ?? null));
onBeforeUnmount(() => { reset(); attach(null); });
</script>

<template>
  <section class="player" aria-label="Odtwarzacz MP3">
    <div class="player-art" :class="{ playing }" aria-hidden="true">♫</div>
    <div class="player-title">
      <strong>{{ current?.title ?? 'Twój następny ulubiony dźwięk' }}</strong>
      <span>{{ loading ? 'Ładowanie…' : current ? 'Twoja prywatna biblioteka' : 'Wybierz nagranie i zacznij słuchać' }}</span>
    </div>
    <audio ref="audio" controls preload="none" @play="setPlaying(true)" @pause="setPlaying(false)" @ended="next" @error="playbackError"></audio>
    <button class="button ghost small next-track" :disabled="!current" aria-label="Następne nagranie" @click="next">Następne →</button>
  </section>
</template>

<style scoped lang="scss">
@use '../../styles/tokens' as tokens;
@use '../../styles/mixins' as mixins;

.player {
  position: fixed;
  z-index: tokens.$z-index-player;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  gap: 18px;
  min-height: 95px;
  padding: 20px max(24px, calc((100vw - tokens.$container-content-width) / 2));
  border-top: 1px solid tokens.$color-player-border;
  background: tokens.$color-player-background;
  box-shadow: tokens.$shadow-player;
  backdrop-filter: blur(16px);

  audio {
    flex: 1;
    min-width: 180px;
    max-width: 560px;
    height: 40px;
    color-scheme: dark;
  }

  @include mixins.mobile {
    flex-wrap: wrap;
    gap: tokens.$space-3;
    padding: 14px 20px max(14px, env(safe-area-inset-bottom));

    audio {
      flex: 0 0 100%;
      width: 100%;
      max-width: 100%;
    }
  }
}

.player-art {
  display: grid;
  flex: 0 0 48px;
  place-items: center;
  height: 48px;
  border-radius: tokens.$radius-sm;
  background: tokens.$color-player-art;
  color: tokens.$color-accent;
  font-size: 24px;

  &.playing {
    box-shadow: tokens.$shadow-playing;
  }
}

.player-title {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  max-width: 360px;

  strong {
    @include mixins.text-truncate;

    font-size: tokens.$font-size-label;
  }

  span {
    color: tokens.$color-text-muted;
    font-size: tokens.$font-size-xs;
  }

  @include mixins.mobile {
    max-width: calc(100% - 65px);
  }
}

.next-track {
  @include mixins.tablet {
    display: none;
  }
}
</style>
