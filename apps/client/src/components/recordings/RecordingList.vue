<script setup lang="ts">
import type { Recording } from '@people/contracts';
import RecordingItem from './RecordingItem.vue';

defineProps<{
  recordings: Recording[];
  total: number;
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
  <section class="library-panel" aria-label="Lista nagrań" :aria-busy="loading">
    <div class="library-toolbar">
      <h2>Twoje nagrania <span>{{ total }}</span></h2>
      <input v-model="search" class="search" type="search" placeholder="Szukaj w załadowanych…" aria-label="Szukaj w załadowanych nagraniach" />
    </div>
    <div v-if="loading && !total" class="empty-state" role="status">Ładowanie nagrań…</div>
    <div v-else-if="!total" class="empty-state">
      <span class="empty-icon" aria-hidden="true">♫</span>
      <h3>Tu zaczyna się Twoja kolekcja</h3>
      <p>Dodaj pierwsze MP3, a my zajmiemy się resztą.</p>
      <button class="button ghost" @click="$emit('selectFile')">Wybierz pierwsze nagranie</button>
    </div>
    <div v-else-if="!recordings.length" class="empty-state">
      <h3>Chwilowo cisza</h3><p>Brak nagrań pasujących do wyszukiwania.</p>
    </div>
    <ol v-else class="track-list">
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
    <button v-if="hasMore" class="button ghost load-more" :disabled="loading" @click="$emit('loadMore')">
      {{ loading ? 'Ładowanie…' : 'Pokaż kolejne nagrania' }}
    </button>
  </section>
</template>

<style scoped lang="scss">
@use '../../styles/tokens' as tokens;
@use '../../styles/mixins' as mixins;

.library-panel {
  min-width: 0;
  overflow: hidden;
  border: 1px solid tokens.$color-border;
  border-radius: tokens.$radius-lg;
  background: tokens.$color-library;
}

.library-toolbar {
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

  .search {
    width: 220px;
    padding: 10px 12px;
    font-size: tokens.$font-size-sm;
  }

  @include mixins.tablet {
    flex-wrap: wrap;

    .search {
      width: 100%;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 340px;
  padding: 35px;
  text-align: center;

  .empty-icon {
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

.track-list {
  padding: tokens.$space-2;
  margin: 0;
  list-style: none;
}

.load-more {
  display: block;
  margin: tokens.$space-5 auto;
  font-size: tokens.$font-size-sm;
}
</style>
