<script setup lang="ts">
import type { RecordingCategory } from '@/composables/useListeningLibrary';

defineProps<{ label: string; disabled?: boolean }>();
const category = defineModel<RecordingCategory>({ required: true });
</script>

<template>
  <select v-model="category" class="recording-category__select" :aria-label="label" :disabled="disabled">
    <option value="books">Books</option>
    <option value="music">Music</option>
  </select>
</template>

<style scoped lang="scss">
.recording-category__select {
  max-width: 100%;
  padding: 8px 10px;
  border: 1px solid tokens.$color-border;
  border-radius: tokens.$radius-sm;
  background: tokens.$color-input;
  color: tokens.$color-text;
  font: inherit;
  font-size: tokens.$font-size-sm;
  color-scheme: dark;
}
</style>
