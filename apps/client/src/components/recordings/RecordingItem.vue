<script setup lang="ts">
import type { Recording } from '@people/contracts';
import { formatDate, formatSize } from '../../utils/format';

defineProps<{
  recording: Recording;
  index: number;
  active: boolean;
  playing: boolean;
  loading: boolean;
  deleting: boolean;
}>();
defineEmits<{ play: [recording: Recording]; remove: [recording: Recording] }>();
</script>

<template>
  <li class="recording-item" :class="{ active }">
    <button class="play-button" :aria-label="`${active && playing ? 'Wstrzymaj' : 'Odtwórz'} ${recording.title}`" :disabled="loading && active" @click="$emit('play', recording)">
      <span class="track-number">{{ String(index + 1).padStart(2, '0') }}</span>
      <span class="play-symbol">{{ active && playing ? 'Ⅱ' : '▶' }}</span>
    </button>
    <div class="track-info">
      <button :disabled="loading && active" @click="$emit('play', recording)">{{ recording.title }}</button>
      <span>{{ recording.originalFilename }}</span>
    </div>
    <div class="track-meta">
      <span>{{ formatSize(recording.sizeBytes) }}</span>
      <time :datetime="recording.createdAt">{{ formatDate(recording.createdAt) }}</time>
    </div>
    <button class="delete-button" :disabled="deleting" :aria-label="`Usuń ${recording.title}`" @click="$emit('remove', recording)">
      {{ deleting ? '…' : '×' }}
    </button>
  </li>
</template>

<style scoped lang="scss">
@use '../../styles/tokens' as tokens;
@use '../../styles/mixins' as mixins;

.recording-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 15px 10px;
  border-radius: tokens.$radius-sm;

  &:hover {
    background: tokens.$color-track-hover;
  }

  &.active {
    background: tokens.$color-track-active;

    .track-info > button,
    .play-symbol {
      color: tokens.$color-accent;
    }

    .track-number {
      display: none;
    }

    .play-symbol {
      display: block;
    }
  }

  @include mixins.mobile {
    gap: tokens.$space-2;
    padding-inline: 2px;
  }
}

.play-button {
  flex: 0 0 35px;
  height: 36px;
  border: 0;
  background: transparent;
  color: tokens.$color-text-muted;
  font-size: tokens.$font-size-label;

  .play-symbol {
    display: none;
  }

  &:hover {
    .play-symbol {
      display: block;
    }

    .track-number {
      display: none;
    }
  }
}

.track-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-width: 0;

  > button {
    @include mixins.text-truncate;

    padding: 0;
    border: 0;
    background: none;
    color: tokens.$color-track-title;
    font-size: tokens.$font-size-md;
    font-weight: 550;
    text-align: left;
  }

  > span {
    @include mixins.text-truncate;

    color: tokens.$color-track-filename;
    font-size: tokens.$font-size-xs;
  }
}

.track-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: tokens.$color-text-muted;
  font-size: tokens.$font-size-xs;
  text-align: right;
  white-space: nowrap;

  time {
    color: tokens.$color-track-date;
    font-size: tokens.$font-size-2xs;
  }

  @include mixins.mobile {
    time {
      display: none;
    }
  }
}

.delete-button {
  padding: 4px 7px;
  border: 0;
  background: transparent;
  color: tokens.$color-delete;
  font-size: 23px;

  &:hover {
    color: tokens.$color-delete-hover;
  }
}
</style>
