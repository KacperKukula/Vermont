<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRecordings } from '@/composables/useRecordings';
import { usePlayer } from '@/composables/usePlayer';
import DashboardHeading from '@/components/recordings/DashboardHeading.vue';
import RecentPlaylist from '@/components/recordings/RecentPlaylist.vue';
import RecordingList from '@/components/recordings/RecordingList.vue';
import UploadCard from '@/components/recordings/UploadCard.vue';

const {
  recordings, visible, categoryRecordings, category, bookCount, musicCount,
  search, totalBytes, hasMore, loading, deleting, load, remove, play
} = useRecordings();
const { current, playing, loading: playerLoading } = usePlayer();
const uploadCard = ref<InstanceType<typeof UploadCard>>();
const listTitle = computed(() => category.value === 'all' ? 'All files' : category.value === 'books' ? 'Books' : 'Music');

onMounted(() => load(true));
</script>

<template>
  <main class="dashboard">
    <DashboardHeading :count="recordings.length" :total-bytes="totalBytes" :has-more="hasMore" />
    <div class="dashboard__grid">
      <div class="dashboard__content">
        <RecentPlaylist />
        <section class="dashboard__categories" aria-labelledby="file-categories-title">
          <div class="dashboard__category-heading">
            <h2 id="file-categories-title">Your files</h2>
            <button class="dashboard__all" :aria-pressed="category === 'all'" @click="category = 'all'">All files</button>
          </div>
          <div class="dashboard__category-options">
            <button class="dashboard__category" :aria-pressed="category === 'books'" @click="category = 'books'">
              <span class="dashboard__category-icon" aria-hidden="true">▤</span>
              <strong>Books</strong>
              <span>{{ bookCount }}{{ hasMore ? '+' : '' }} {{ bookCount === 1 && !hasMore ? 'file' : 'files' }}</span>
            </button>
            <button class="dashboard__category" :aria-pressed="category === 'music'" @click="category = 'music'">
              <span class="dashboard__category-icon" aria-hidden="true">♫</span>
              <strong>Music</strong>
              <span>{{ musicCount }}{{ hasMore ? '+' : '' }} {{ musicCount === 1 && !hasMore ? 'file' : 'files' }}</span>
            </button>
          </div>
          <p v-if="hasMore" class="dashboard__pagination-note">Counts and search include loaded files. Load more to browse the rest.</p>
        </section>
        <RecordingList
          v-model:search="search"
          :title="listTitle"
          :recordings="visible"
          :total="categoryRecordings.length"
          :loading="loading"
          :has-more="hasMore"
          :deleting-id="deleting"
          :current-id="current?.id"
          :playing="playing"
          :player-loading="playerLoading"
          @play="play"
          @remove="remove"
          @load-more="load()"
          @select-file="uploadCard?.openFilePicker(category === 'all' ? 'music' : category)"
        />
      </div>
      <aside class="dashboard__sidebar">
        <UploadCard ref="uploadCard" @uploaded="load(true)" />
      </aside>
    </div>
  </main>
</template>

<style scoped lang="scss">
.dashboard {
  &__grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 310px;
    gap: tokens.$space-7;
    align-items: start;

    @include mixins.tablet {
      grid-template-columns: minmax(0, 1fr) 280px;
      gap: tokens.$space-5;
    }

    @include mixins.mobile {
      grid-template-columns: 1fr;
    }
  }

  &__content {
    display: grid;
    gap: tokens.$space-6;
    min-width: 0;
  }

  &__category-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: tokens.$space-3;
    margin-bottom: tokens.$space-3;

    h2 {
      margin: 0;
      font-size: tokens.$font-size-lg;
    }
  }

  &__all {
    padding: tokens.$space-2 tokens.$space-3;
    border: 1px solid tokens.$color-border;
    border-radius: tokens.$radius-sm;
    background: tokens.$color-surface;
    color: tokens.$color-text;
  }

  &__category-options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: tokens.$space-3;
  }

  &__category {
    display: grid;
    gap: tokens.$space-1;
    padding: tokens.$space-5;
    border: 1px solid tokens.$color-border;
    border-radius: tokens.$radius-lg;
    background: tokens.$color-surface;
    color: tokens.$color-text;
    text-align: left;

    strong {
      font-size: tokens.$font-size-lg;
    }

    > span:last-child {
      color: tokens.$color-text-muted;
      font-size: tokens.$font-size-sm;
    }
  }

  &__category-icon {
    color: tokens.$color-accent;
    font-size: tokens.$font-size-xl;
  }

  &__all,
  &__category {
    &:hover {
      background: tokens.$color-track-hover;
    }

    &[aria-pressed='true'] {
      border-color: tokens.$color-accent;
      background: tokens.$color-track-active;
    }
  }

  &__pagination-note {
    margin: tokens.$space-2 0 0;
    font-size: tokens.$font-size-sm;
  }
}
</style>
