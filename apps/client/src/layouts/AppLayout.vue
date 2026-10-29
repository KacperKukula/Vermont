<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppNotifications from '@/components/layout/AppNotifications.vue';
import AudioPlayer from '@/components/player/AudioPlayer.vue';

const { user } = useAuth();
</script>

<template>
  <div class="shell">
    <AppHeader />
    <AppNotifications />
    <RouterView />
    <footer v-if="!user" class="footer">Mniej szumu. Więcej muzyki.</footer>
    <AudioPlayer v-if="user" />
  </div>
</template>

<style scoped lang="scss">
.shell {
  max-width: tokens.$container-width;
  margin: auto;
  padding: 0 tokens.$container-gutter;

  @include mixins.tablet {
    padding-inline: tokens.$container-gutter-tablet;
  }

  @include mixins.mobile {
    padding-inline: tokens.$container-gutter-mobile;
  }
}

.footer {
  padding-bottom: 25px;
  color: tokens.$color-text-subtle;
  font-size: tokens.$font-size-xs;
  text-align: center;
}
</style>
