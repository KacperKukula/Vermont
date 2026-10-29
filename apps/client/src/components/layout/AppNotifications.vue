<script setup lang="ts">
import { useNotifications } from '@/composables/useNotifications';

const { error, notice, clearError, clearNotice } = useNotifications();
</script>

<template>
  <div v-if="error" class="alert error" role="alert">
    <span>{{ error }}</span>
    <button aria-label="Zamknij komunikat" @click="clearError">×</button>
  </div>
  <div v-if="notice" class="alert success" role="status">
    <span>{{ notice }}</span>
    <button aria-label="Zamknij komunikat" @click="clearNotice">×</button>
  </div>
</template>

<style scoped lang="scss">
.alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: tokens.$space-4;
  padding: 12px 18px;
  margin-top: tokens.$space-5;
  border: 1px solid transparent;
  border-radius: tokens.$radius-sm;
  font-size: tokens.$font-size-label;

  &.error {
    border-color: tokens.$color-error-border;
    background: tokens.$color-error-background;
    color: tokens.$color-error-text;
  }

  &.success {
    border-color: tokens.$color-success-border;
    background: tokens.$color-success-background;
    color: tokens.$color-success-text;
  }

  button {
    border: 0;
    background: none;
    color: inherit;
    font-size: tokens.$font-size-xl;
  }
}
</style>
