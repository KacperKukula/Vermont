<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useNotifications } from '@/composables/useNotifications';

const email = ref('');
const password = ref('');
const busy = ref(false);

const { login } = useAuth();

const { clearNotif, showError } = useNotifications();
const router = useRouter();
const route = useRoute();
const switchRoute = computed(() => ({
  name: 'register',
  query: typeof route.query.redirect === 'string' ? { redirect: route.query.redirect } : {},
}));

async function submit() {
  if (busy.value) return;
  busy.value = true;
  clearNotif();
  try {
    await login({ email: email.value, password: password.value });
    password.value = '';
    const redirect = route.query.redirect;
    // Only return to known protected pages, never an arbitrary external URL.
    const destination = typeof redirect === 'string' ? router.resolve(redirect) : null;
    await router.replace(destination?.meta.requiresAuth ? destination.fullPath : { name: 'dashboard' });
  } catch (cause) {
    showError(cause);
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <section class="auth-card">
    <span class="auth-card__eyebrow">START LISTENING</span>
    <h2 class="auth-card__title">Good to hear from you.</h2>
    <p class="auth-card__description">Log in to your dashboard.</p>
    <form @submit.prevent="submit">
      <label for="login-email">Email address</label>
      <input id="login-email" v-model="email" type="email" autocomplete="email" maxlength="254" placeholder="you@example.com" required :disabled="busy" />
      <label for="login-password">Password <span>at least 12 characters</span></label>
      <input id="login-password" v-model="password" type="password" autocomplete="current-password" minlength="12" maxlength="128" placeholder="••••••••••••" required :disabled="busy" />
      <button class="button auth-card__submit" type="submit" :disabled="busy">
        {{ busy ? 'Please wait…' : 'Open dashboard →' }}
      </button>
    </form>
    <p class="auth-card__switch">
      Don't have an account yet?
      <RouterLink v-if="!busy" class="auth-card__switch-link" :to="switchRoute" @click="clearNotif">
        Register
      </RouterLink>
    </p>
  </section>
</template>

<style scoped lang="scss">
@use '@styles/components/auth-form';
</style>
