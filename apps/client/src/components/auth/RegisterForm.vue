<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useNotifications } from '@/composables/useNotifications';

const email = ref('');
const password = ref('');
const busy = ref(false);

const { register } = useAuth();
const { clearNotif, showError } = useNotifications();
const router = useRouter();
const route = useRoute();
const switchRoute = computed(() => ({
  name: 'login',
  query: typeof route.query.redirect === 'string' ? { redirect: route.query.redirect } : {},
}));

async function submit() {
  if (busy.value) return;
  busy.value = true;
  clearNotif();
  try {
    await register({ email: email.value, password: password.value });
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
    <h2 class="auth-card__title">Find your rhythm.</h2>
    <p class="auth-card__description">Create an account and add your first recording.</p>
    <form @submit.prevent="submit">
      <label for="register-email">Email address</label>
      <input id="register-email" v-model="email" type="email" autocomplete="email" maxlength="254" placeholder="you@example.com" required :disabled="busy" />
      <label for="register-password">Password <span>at least 12 characters</span></label>
      <input id="register-password" v-model="password" type="password" autocomplete="new-password" minlength="12" maxlength="128" placeholder="••••••••••••" required :disabled="busy" />
      <button class="button auth-card__submit" type="submit" :disabled="busy">
        {{ busy ? 'Please wait…' : 'Create account →' }}
      </button>
    </form>
    <p class="auth-card__switch">
      Already have an account?
      <RouterLink v-if="!busy" class="auth-card__switch-link" :to="switchRoute" @click="clearNotif">
        Log in
      </RouterLink>
    </p>
  </section>
</template>

<style scoped lang="scss">
@use '@styles/components/auth-form';
</style>
