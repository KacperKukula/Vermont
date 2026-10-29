<script setup lang="ts">
import type { Recording } from '@vermont/contracts';
import RecordingItem from './RecordingItem.vue';

defineProps<{
  recordings: Recording[];
  total: number;
  title: string;
  loading: boolean;
  hasMore: boolean;
  deletingId: string | null;
  currentId?: string;
  playing: boolean;
  playerLoading: boolean;
}>();
const search = defineModel<string>('search', { required: true });
defineEmits<{
  play: [recording: Recording];
  remove: [recording: Recording];
  loadMore: [];
  selectFile: [];
}>();
</script>

<template>
  <section class="recording-list" :aria-label="title" :aria-busy="loading">
    <div class="recording-list__toolbar">
      <h2>{{ title }} <span>{{ total }}</span></h2>
      <input v-model="search" class="recording-list__search" type="search" placeholder="Search loaded files…" aria-label="Search loaded files" />
    </div>
    <div v-if="loading && !total" class="recording-list__empty" role="status">Loading files…</div>
    <div v-else-if="!total" class="recording-list__empty">
      <span class="recording-list__icon" aria-hidden="true">♫</span>
      <h3>Your collection starts here</h3>
      <p>Upload an MP3 to this category and start listening.</p>
      <button class="button ghost" @click="$emit('selectFile')">Choose a file</button>
    </div>
    <div v-else-if="!recordings.length" class="recording-list__empty">
      <h3>No matching files</h3><p>Try another title or filename.</p>
    </div>
    <ol v-else class="recording-list__tracks">
      <RecordingItem
        v-for="(recording, index) in recordings"
        :key="recording.id"
        :recording="recording"
        :index="index"
        :active="currentId === recording.id"
        :playing="playing"
        :loading="playerLoading"
        :deleting="deletingId === recording.id"
        @play="$emit('play', $event)"
        @remove="$emit('remove', $event)"
      />
    </ol>
    <button v-if="hasMore" class="button ghost recording-list__more" :disabled="loading" @click="$emit('loadMore')">
      {{ loading ? 'Loading…' : 'Load more files' }}
    </button>
  </section>
</template>

<style scoped lang="scss">
.recording-list {
  min-width: 0;
  overflow: hidden;
  border: 1px solid tokens.$color-border;
  border-radius: tokens.$radius-lg;
  background: tokens.$color-library;
}

.recording-list__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: tokens.$space-3;
  padding: tokens.$space-5;
  border-bottom: 1px solid tokens.$color-border;

  h2 {
    margin: 0;
    font-size: tokens.$font-size-base;
    white-space: nowrap;

    span {
      padding: 4px 7px;
      margin-left: 7px;
      border-radius: tokens.$radius-xs;
      background: tokens.$color-badge;
      color: tokens.$color-text-muted;
      font-size: tokens.$font-size-xs;
    }
  }

  .recording-list__search {
    width: 220px;
    padding: 10px 12px;
    font-size: tokens.$font-size-sm;
  }

  @include mixins.tablet {
    flex-wrap: wrap;

    .recording-list__search {
      width: 100%;
    }
  }
}

.recording-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 340px;
  padding: 35px;
  text-align: center;

  .recording-list__icon {
    display: grid;
    place-items: center;
    width: 70px;
    height: 70px;
    margin-bottom: 25px;
    border-radius: 22px;
    background: tokens.$color-empty-icon;
    color: tokens.$color-accent;
    font-size: 30px;
  }

  h3 {
    margin-bottom: tokens.$space-2;
    font-size: tokens.$font-size-lg;
  }

  p {
    font-size: tokens.$font-size-label;
  }

  .button {
    margin-top: tokens.$space-3;
    font-size: tokens.$font-size-sm;
  }
}

.recording-list__tracks {
  padding: tokens.$space-2;
  margin: 0;
  list-style: none;
}

.recording-list__more {
  display: block;
  margin: tokens.$space-5 auto;
  font-size: tokens.$font-size-sm;
}
</style>
