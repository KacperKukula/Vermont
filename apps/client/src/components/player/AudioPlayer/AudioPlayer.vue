<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import WaveformIcon from '@/assets/icons/player/waveform.svg?component';
import VolumeMutedIcon from '@/assets/icons/player/volume-muted.svg?component';
import VolumeIcon from '@/assets/icons/player/volume.svg?component';
import { useAudioPlayback } from '@/components/player/AudioPlayer/composables/useAudioPlayback.js';
import PlayerButton from './components/PlayerButton.vue';
import PlayerControls from './components/PlayerControls.vue';
import PlayerSlider from './components/PlayerSlider.vue';
import { secondsToTime } from '@/utils/time';

// const {
//   audio,
//   elapsed,
//   duration,
//   volume,
//   muted,
//   speed,
//   buffering,
//   playing,
//   loading,
//   busy,
//   volumeLevel,
//   status,
//   syncTime,
//   syncPreferences,
//   togglePlayback,
//   seek,
//   changeVolume,
//   toggleMute,
//   handleEnded,
//   handleError,
//   setPlaying
// } = useAudioPlayback();

const downloadController = new AbortController();

onMounted(async () => {
  try {
    const response = await fetch('/resources/test.mp3', {
      signal: downloadController.signal
    });
    if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`);
    if (!response.body) throw new Error('The download response has no stream.');

    const totalBytes = Number(response.headers.get('Content-Length'));
    if (!Number.isFinite(totalBytes) || totalBytes <= 0) {
      throw new Error('The download response has no valid file size.');
    }

    const reader = response.body.getReader();
    let downloadedBytes = 0;
    let lastPercentage = -1;
    try {
      console.log('Test audio download: 0%');
      lastPercentage = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        downloadedBytes += value.byteLength;
        const percentage = Math.min(100, Math.floor(downloadedBytes / totalBytes * 100));
        if (percentage !== lastPercentage) {
          console.log(`Test audio download: ${percentage}%`);
          lastPercentage = percentage;
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (cause) {
    if (downloadController.signal.aborted) return;
    console.error('Failed to download test audio:', cause);
  }
});

onBeforeUnmount(() => downloadController.abort());
</script>

<template>
  <section class="audio-player" aria-label="Audio player" :aria-busy="busy">
    KK

    <!--<audio
      ref="audio"
      preload="metadata"
      @loadedmetadata="syncTime(); syncPreferences()"
      @durationchange="syncTime"
      @timeupdate="syncTime"
      @emptied="elapsed = 0; duration = 0; buffering = false"
      @waiting="buffering = true"
      @canplay="buffering = false"
      @playing="setPlaying(true); buffering = false"
      @pause="setPlaying(false); buffering = false"
      @ended="handleEnded"
      @error="handleError"
    ></audio>

    <div class="audio-player__track">
      <div class="audio-player__art" :class="{ 'audio-player__art--playing': playing }" aria-hidden="true">
        <WaveformIcon aria-hidden="true" />
      </div>
      <div class="audio-player__metadata">
        <span class="audio-player__eyebrow">{{ playing ? 'Now playing' : 'Ready to play' }}</span>
        <strong class="audio-player__title" :title="current?.title ?? 'example.mp3'">{{ current?.title ?? 'example.mp3' }}</strong>
        <span class="audio-player__subtitle" role="status">{{ status }}</span>
      </div>
    </div>

    <div class="audio-player__playback">
      <PlayerControls
        :playing="playing"
        :loading="loading"
        :busy="busy"
        :can-seek="duration > 0"
        @toggle="togglePlayback"
        @skip="seek(elapsed + $event)"
      />
      <div class="audio-player__timeline">
        <span class="audio-player__time">{{ secondsToTime(elapsed) }}</span>
        <PlayerSlider
          :value="elapsed"
          :max="duration || 1"
          :step="0.1"
          :disabled="!duration || loading"
          label="Playback position"
          :value-text="`${secondsToTime(elapsed)} of ${secondsToTime(duration)}`"
          @change="seek"
        />
        <span class="audio-player__time">{{ secondsToTime(duration) }}</span>
      </div>
    </div>

    <div class="audio-player__settings">
      <select v-model="speed" class="audio-player__speed" aria-label="Playback speed" title="Playback speed" @change="syncPreferences">
        <option v-for="rate in [0.75, 1, 1.25, 1.5, 1.75, 2]" :key="rate" :value="rate">{{ rate }}×</option>
      </select>
      <div class="audio-player__volume">
        <PlayerButton :aria-label="muted ? 'Unmute' : 'Mute'" :title="muted ? 'Unmute' : 'Mute'" :aria-pressed="muted" @click="toggleMute">
          <VolumeMutedIcon v-if="muted || !volume" aria-hidden="true" />
          <VolumeIcon v-else aria-hidden="true" />
        </PlayerButton>
        <PlayerSlider
          :value="muted ? 0 : volume"
          :max="1"
          :step="0.01"
          compact
          label="Volume"
          :value-text="`${Math.round(volumeLevel)} percent`"
          @change="changeVolume"
        />
      </div>
    </div>-->
  </section>
</template>

<style scoped lang="scss">
.audio-player {
  position: fixed;
  z-index: tokens.$z-index-player;
  right: max(20px, calc((100vw - tokens.$container-width) / 2));
  bottom: max(16px, env(safe-area-inset-bottom));
  left: max(20px, calc((100vw - tokens.$container-width) / 2));
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 1.5fr) minmax(0, 1fr);
  align-items: center;
  gap: tokens.$space-8;
  padding: 16px 24px;
  border: 1px solid #ffffff24;
  border-radius: 24px;
  background:
    radial-gradient(ellipse at top left, #76dca012, transparent 55%),
    linear-gradient(135deg, #ffffff0c, #ffffff00 60%),
    #181d2bb8;
  box-shadow: 0 16px 48px #00000045, inset 0 1px 0 #ffffff12;
  -webkit-backdrop-filter: blur(28px) saturate(150%);
  backdrop-filter: blur(28px) saturate(150%);

  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    background: tokens.$color-surface;
  }

  &__track {
    display: flex;
    align-items: center;
    gap: tokens.$space-4;
    min-width: 0;
  }

  &__art {
    display: grid;
    flex: 0 0 56px;
    place-items: center;
    height: 56px;
    border: 1px solid #ffffff1f;
    border-radius: tokens.$radius-md;
    background: linear-gradient(135deg, #81dfa522, #ffffff05);
    box-shadow: inset 0 1px 0 #ffffff10;
    color: tokens.$color-accent;
    transition: border-color tokens.$transition-fast;

    svg { width: 30px; height: 30px; }

    &--playing { border-color: tokens.$color-accent; }
  }

  &__metadata {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  &__eyebrow {
    color: tokens.$color-accent;
    font-size: 9px;
    font-weight: tokens.$font-weight-semibold;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  &__title {
    @include mixins.text-truncate;
    font-size: tokens.$font-size-md;
    font-weight: tokens.$font-weight-semibold;
  }

  &__subtitle {
    @include mixins.text-truncate;
    color: tokens.$color-text-muted;
    font-size: tokens.$font-size-xs;
  }

  &__playback { min-width: 0; }

  &__timeline {
    display: flex;
    align-items: center;
    gap: tokens.$space-3;
    margin-top: 6px;
  }

  &__time {
    min-width: 34px;
    color: tokens.$color-text-muted;
    font-size: tokens.$font-size-2xs;
    font-variant-numeric: tabular-nums;
    text-align: center;
  }

  &__settings, &__volume {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: tokens.$space-3;
  }

  &__volume { gap: tokens.$space-1; }

  &__speed {
    padding: 6px 8px;
    border: 1px solid #ffffff1c;
    border-radius: tokens.$radius-xs;
    background: #ffffff06;
    color: tokens.$color-text;
    font: inherit;
    font-size: tokens.$font-size-xs;
    cursor: pointer;

    option {
      background: tokens.$color-surface;
      color: tokens.$color-text;
    }

    &:focus-visible {
      outline: 2px solid tokens.$color-accent;
      outline-offset: 4px;
    }
  }

  @include mixins.tablet {
    gap: tokens.$space-4;
    grid-template-columns: minmax(0, 1fr) minmax(260px, 1.3fr) auto;

    &__settings { gap: tokens.$space-1; }
  }

  @include mixins.mobile {
    right: 10px;
    bottom: max(10px, env(safe-area-inset-bottom));
    left: 10px;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: tokens.$space-3;
    padding: 12px 16px;
    border-radius: 20px;

    &__track { gap: tokens.$space-3; }
    &__art { flex-basis: 44px; height: 44px; }
    &__eyebrow { display: none; }
    &__playback { grid-column: 1 / -1; grid-row: 2; }
    &__settings { grid-column: 2; grid-row: 1; }

    &__timeline { margin-top: 0; }
  }
}
</style>
