<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRecordings } from '../composables/useRecordings';
import { usePlayer } from '../composables/usePlayer';
import LibraryHeading from '../components/recordings/LibraryHeading.vue';
import RecordingList from '../components/recordings/RecordingList.vue';
import UploadCard from '../components/recordings/UploadCard.vue';

const { recordings, visible, search, totalBytes, hasMore, loading, deleting, load, remove, play } = useRecordings();
const { current, playing, loading: playerLoading } = usePlayer();
const uploadCard = ref<InstanceType<typeof UploadCard>>();

onMounted(() => load(true));
</script>

<template>
  <main class="dashboard">
    <LibraryHeading :count="recordings.length" :total-bytes="totalBytes" :has-more="hasMore" />
    <div class="dashboard-grid">
      <RecordingList
        v-model:search="search"
        :recordings="visible"
        :total="recordings.length"
        :loading="loading"
        :has-more="hasMore"
        :deleting-id="deleting"
        :current-id="current?.id"
        :playing="playing"
        :player-loading="playerLoading"
        @play="play"
        @remove="remove"
        @load-more="load()"
        @select-file="uploadCard?.openFilePicker()"
      />
      <aside class="sidebar">
        <UploadCard ref="uploadCard" @uploaded="load(true)" />
      </aside>
    </div>
  </main>
</template>
