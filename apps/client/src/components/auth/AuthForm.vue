<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuth } from '../../composables/useAuth';
import { useNotifications } from '../../composables/useNotifications';

const props = defineProps<{ mode: 'login' | 'register' }>();
const email = ref('');
const password = ref('');
const busy = ref(false);
const isLogin = computed(() => props.mode === 'login');
const { authenticate } = useAuth();
const { clear, showError } = useNotifications();
const router = useRouter();
const route = useRoute();
const switchRoute = computed(() => ({
  name: isLogin.value ? 'register' : 'login',
  query: typeof route.query.redirect === 'string' ? { redirect: route.query.redirect } : {},
}));

async function submit() {
  busy.value = true;
  clear();
  try {
    await authenticate(props.mode, { email: email.value, password: password.value });
    password.value = '';
    const redirect = route.query.redirect;
    // Only return to known protected pages, never an arbitrary external URL.
    const destination = typeof redirect === 'string' ? router.resolve(redirect) : null;
    await router.replace(destination?.meta.requiresAuth ? destination.fullPath : { name: 'library' });
  } catch (cause) {
    showError(cause);
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <section class="auth-card">
    <span class="eyebrow">ZACZNIJ SŁUCHAĆ</span>
    <h2>{{ isLogin ? 'Dobrze Cię słyszeć.' : 'Znajdź swój rytm.' }}</h2>
    <p>{{ isLogin ? 'Zaloguj się do swojej biblioteki.' : 'Utwórz konto i dodaj pierwsze nagranie.' }}</p>
    <form @submit.prevent="submit">
      <label for="email">Adres e-mail</label>
      <input id="email" v-model="email" type="email" autocomplete="email" maxlength="254" placeholder="ty@example.com" required :disabled="busy" />
      <label for="password">Hasło <span>minimum 12 znaków</span></label>
      <input id="password" v-model="password" type="password" :autocomplete="isLogin ? 'current-password' : 'new-password'" minlength="12" maxlength="128" placeholder="••••••••••••" required :disabled="busy" />
      <button class="button primary full" :disabled="busy">
        {{ busy ? 'Chwileczkę…' : isLogin ? 'Wejdź do biblioteki →' : 'Utwórz konto →' }}
      </button>
    </form>
    <p class="switch-auth">
      {{ isLogin ? 'Jeszcze nie masz konta?' : 'Masz już konto?' }}
      <RouterLink v-if="!busy" :to="switchRoute" @click="clear">
        {{ isLogin ? 'Zarejestruj się' : 'Zaloguj się' }}
      </RouterLink>
    </p>
  </section>
</template>

<style scoped lang="scss">
@use '../../styles/tokens' as tokens;
@use '../../styles/mixins' as mixins;

.auth-card {
  padding: tokens.$space-9;
  border: 1px solid tokens.$color-border;
  border-radius: tokens.$radius-xl;
  background: tokens.$color-surface;
  box-shadow: tokens.$shadow-card;

  h2 {
    margin-bottom: 10px;
    font-size: 27px;
    letter-spacing: -0.7px;
  }

  > p {
    font-size: tokens.$font-size-label;
  }

  .eyebrow {
    font-size: 9px;
  }

  .primary {
    margin-top: 26px;
  }

  @include mixins.tablet {
    padding: tokens.$space-7;
  }

  @include mixins.mobile {
    padding: 27px;

    h2 {
      font-size: 25px;
    }
  }
}

.switch-auth {
  margin: 25px 0 0;
  font-size: tokens.$font-size-sm;
  text-align: center;

  a {
    padding: tokens.$space-1;
    color: tokens.$color-accent;
    text-decoration: none;
  }
}
</style>
