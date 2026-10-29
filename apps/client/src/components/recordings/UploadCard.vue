<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { useUpload } from '@/composables/useUpload';
import type { RecordingCategory } from '@/composables/useListeningLibrary';
import { formatSize } from '@/utils/format';
import RecordingCategorySelect from './RecordingCategorySelect.vue';

const emit = defineEmits<{ uploaded: [] }>();
const { file, title, category, progress, uploading, selectFile, upload } = useUpload();
const fileInput = ref<HTMLInputElement>();
const dragging = ref(false);

function openFilePicker(selectedCategory?: RecordingCategory) {
  if (selectedCategory) category.value = selectedCategory;
  fileInput.value?.click();
}
function selected(event: Event) { selectFile((event.target as HTMLInputElement).files?.[0]); }
function dropped(event: DragEvent) {
  dragging.value = false;
  selectFile(event.dataTransfer?.files[0]);
}

async function submit() {
  if (await upload()) {
    if (fileInput.value) fileInput.value.value = '';
    emit('uploaded');
  }
}

function beforeUnload(event: BeforeUnloadEvent) {
  if (!uploading.value) return;
  event.preventDefault();
  event.returnValue = '';
}
window.addEventListener('beforeunload', beforeUnload);
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload));
defineExpose({ openFilePicker });
</script>

<template>
  <section class="upload-card">
    <span class="eyebrow">GROW YOUR COLLECTION</span><h2>Upload a file</h2><p>Add a book or a track. Press play.</p>
    <input ref="fileInput" class="visually-hidden" type="file" accept=".mp3,audio/mpeg" :disabled="uploading" aria-label="Choose an MP3 file" @change="selected" />
    <button type="button" class="upload-card__dropzone" :class="{ 'upload-card__dropzone--dragging': dragging }" :disabled="uploading" @click="openFilePicker()" @dragover.prevent="dragging = true" @dragleave.prevent="dragging = false" @drop.prevent="dropped">
      <span class="upload-card__icon" aria-hidden="true">↑</span>
      <strong>{{ file ? file.name : 'Drop an MP3 here' }}</strong>
      <span>{{ file ? formatSize(file.size) : 'or click to choose a file' }}</span>
    </button>
    <form v-if="file" class="upload-card__form" @submit.prevent="submit">
      <label for="title">Recording title</label>
      <input id="title" v-model="title" maxlength="200" required :disabled="uploading" />
      <label for="upload-category">File category</label>
      <RecordingCategorySelect id="upload-category" v-model="category" label="File category" :disabled="uploading" />
      <div v-if="uploading" class="upload-card__progress" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100" aria-label="Upload progress">
        <span :style="{ width: `${progress}%` }"></span>
      </div>
      <button class="button primary full" :disabled="uploading">
        {{ uploading ? progress === 100 ? 'Checking file…' : `Uploading ${progress}%` : 'Upload file ↑' }}
      </button>
    </form>
    <p class="upload-card__privacy">◎ Files are private and belong to your account.</p>
  </section>
</template>

<style scoped lang="scss">
.upload-card {
  padding: tokens.$space-6;
  border: 1px solid tokens.$color-border;
  border-radius: tokens.$radius-lg;
  background: tokens.$color-surface;

  .eyebrow {
    margin-bottom: 14px;
    font-size: 9px;
    letter-spacing: 1.5px;
  }

  h2 {
    margin-bottom: tokens.$space-2;
    font-size: tokens.$font-size-xl;
    letter-spacing: -0.5px;
  }

  > p {
    font-size: tokens.$font-size-sm;
  }

  @include mixins.mobile {
    padding: tokens.$space-5;
  }
}

.upload-card__dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  min-height: 170px;
  padding: 20px 12px;
  margin: 24px 0 15px;
  border: 1px dashed tokens.$color-dropzone-border;
  border-radius: 11px;
  background: tokens.$color-dropzone;
  color: tokens.$color-dropzone-text;
  transition:
    border-color tokens.$transition-fast,
    background tokens.$transition-fast;

  &:hover,
  &--dragging {
    border-color: tokens.$color-accent;
    background: tokens.$color-dropzone-hover;
  }

  .upload-card__icon {
    margin-bottom: 5px;
    color: tokens.$color-accent;
    font-size: 28px;
  }

  strong {
    max-width: 100%;
    overflow-wrap: anywhere;
    font-size: tokens.$font-size-sm;
  }

  > span:last-child {
    color: tokens.$color-text-muted;
    font-size: tokens.$font-size-xs;
  }

  @include mixins.mobile {
    min-height: 110px;
    margin-top: 15px;
  }
}

.upload-card__form {
  .button {
    margin-top: 17px;
    font-size: tokens.$font-size-sm;
  }

  input {
    font-size: tokens.$font-size-label;
  }
}

.upload-card__progress {
  height: 5px;
  margin-top: 15px;
  overflow: hidden;
  border-radius: tokens.$radius-pill;
  background: tokens.$color-progress-track;

  span {
    display: block;
    height: 100%;
    background: tokens.$color-accent;
    transition: width tokens.$transition-progress;
  }
}

.upload-card > .upload-card__privacy {
  margin: 20px 0 0;
  color: tokens.$color-privacy-text;
  font-size: tokens.$font-size-2xs;
}
</style>
