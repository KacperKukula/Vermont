<script setup lang="ts">
import { ref } from 'vue';
import vermontLogo from '@/assets/vermont-logo.svg';
import { RouterLink, useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useNotifications } from '@/composables/useNotifications';
import { usePlayer } from '@/composables/usePlayer';
import { useUploadStatus } from '@/composables/useUpload';

const { user, logout } = useAuth();
const { uploading } = useUploadStatus();
const { reset } = usePlayer();
const { clearNotif, showError } = useNotifications();
const router = useRouter();
const loggingOut = ref(false);

async function signOut() {
  if (uploading.value || loggingOut.value) return;
  loggingOut.value = true;
  try {
    await logout();
    reset();
    clearNotif();
    await router.replace({ name: 'login' });
  } catch (cause) {
    showError(cause);
  } finally {
    loggingOut.value = false;
  }
}
</script>

<template>
  <header class="header">
    <RouterLink class="brand" to="/" aria-label="Vermont — strona główna">
      <img class="brand-logo" :src="vermontLogo" alt="" width="48" height="39" />
      <span>Vermont</span>
    </RouterLink>
    <nav v-if="user" class="main-nav" aria-label="Menu główne">
      <RouterLink :to="{ name: 'dashboard' }">Dashboard</RouterLink>
      <RouterLink :to="{ name: 'integrations' }">Integracje</RouterLink>
    </nav>
    <div v-if="user" class="account">
      <span>{{ user.email }}</span>
      <button class="button ghost small" :disabled="uploading || loggingOut" @click="signOut">
        {{ loggingOut ? 'Wylogowywanie…' : 'Wyloguj' }}
      </button>
    </div>
    <span v-else class="header-note">Małe miejsce na wielkie brzmienia.</span>
  </header>
</template>

<style scoped lang="scss">
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: tokens.$space-5;
  height: 110px;
  border-bottom: 1px solid tokens.$color-border;

  @include mixins.mobile {
    flex-wrap: wrap;
    gap: tokens.$space-3;
    height: auto;
    min-height: 85px;
    padding: tokens.$space-4 0;
  }
}

.brand {
  display: flex;
  align-items: center;
  gap: tokens.$space-3;
  color: tokens.$color-text;
  font-size: 35px;
  font-weight: tokens.$font-weight-bold;
  letter-spacing: -2px;
  text-decoration: none;

  @include mixins.mobile {
    font-size: 30px;
  }
}

.brand-logo {
  display: block;
  flex-shrink: 0;
  width: 48px;
  height: 39px;

  @include mixins.mobile {
    width: 40px;
    height: 32.5px;
  }
}

.header-note,
.account {
  color: tokens.$color-text-muted;
  font-size: tokens.$font-size-label;
}

.header-note {
  @include mixins.mobile {
    display: none;
  }
}

.account {
  display: flex;
  align-items: center;
  gap: tokens.$space-5;

  span {
    overflow-wrap: anywhere;
  }

  @include mixins.mobile {
    gap: 10px;
    margin-left: auto;
    font-size: tokens.$font-size-2xs;
  }
}

.main-nav {
  display: flex;
  gap: tokens.$space-6;
  margin-right: auto;
  margin-left: 35px;

  a {
    padding: 10px 0;
    color: tokens.$color-text-muted;
    font-size: tokens.$font-size-label;
    text-decoration: none;

    &.router-link-active {
      color: tokens.$color-accent;
    }
  }

  @include mixins.mobile {
    order: 3;
    width: 100%;
    margin: 0;
  }
}
</style>
