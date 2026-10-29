<script setup lang="ts">
import { computed } from 'vue';
import type { Recording } from '@vermont/contracts';
import { useListeningLibrary } from '@/composables/useListeningLibrary';
import RecordingCategorySelect from './RecordingCategorySelect.vue';
import { formatDate, formatSize } from '@/utils/format';

const props = defineProps<{
  recording: Recording;
  index: number;
  active: boolean;
  playing: boolean;
  loading: boolean;
  deleting: boolean;
}>();
defineEmits<{ play: [recording: Recording]; remove: [recording: Recording] }>();
const library = useListeningLibrary();
const category = computed({
  get: () => library.categoryOf(props.recording.id),
  set: (value) => library.setCategory(props.recording.id, value)
});
</script>

<template>
  <li class="recording-item" :class="{ 'recording-item--active': active }">
    <button class="recording-item__play" :aria-label="`${active && playing ? 'Pause' : 'Play'} ${recording.title}`" :disabled="loading && active" @click="$emit('play', recording)">
      <span class="recording-item__number">{{ String(index + 1).padStart(2, '0') }}</span>
      <span class="recording-item__symbol">{{ active && playing ? 'Ⅱ' : '▶' }}</span>
    </button>
    <div class="recording-item__info">
      <button :disabled="loading && active" @click="$emit('play', recording)">{{ recording.title }}</button>
      <span>{{ recording.originalFilename }}</span>
    </div>
    <RecordingCategorySelect v-model="category" :label="`Category for ${recording.title}`" />
    <div class="recording-item__meta">
      <span>{{ formatSize(recording.sizeBytes) }}</span>
      <time :datetime="recording.createdAt">{{ formatDate(recording.createdAt) }}</time>
    </div>
    <button class="recording-item__delete" :disabled="deleting" :aria-label="`Delete ${recording.title}`" @click="$emit('remove', recording)">
      {{ deleting ? '…' : '×' }}
    </button>
  </li>
</template>

<style scoped lang="scss">
.recording-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 15px 10px;
  border-radius: tokens.$radius-sm;

  &:hover {
    background: tokens.$color-track-hover;
  }

  &--active {
    background: tokens.$color-track-active;

    .recording-item__info > button,
    .recording-item__symbol {
      color: tokens.$color-accent;
    }

    .recording-item__number {
      display: none;
    }

    .recording-item__symbol {
      display: block;
    }
  }

  @include mixins.mobile {
    flex-wrap: wrap;
    gap: tokens.$space-2;
    padding-inline: 2px;
  }
}

.recording-item__play {
  flex: 0 0 35px;
  height: 36px;
  border: 0;
  background: transparent;
  color: tokens.$color-text-muted;
  font-size: tokens.$font-size-label;

  .recording-item__symbol {
    display: none;
  }

  &:hover {
    .recording-item__symbol {
      display: block;
    }

    .recording-item__number {
      display: none;
    }
  }
}

.recording-item__info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-width: 100px;

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

.recording-item__meta {
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

.recording-item__delete {
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
