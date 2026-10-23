import { readonly, ref } from 'vue';
import type { Credentials, User } from '@people/contracts';
import { authService } from '../services/auth.service';
import { ApiError } from '../services/http';

const user = ref<User | null>(null);
let initialized = false;
let initialization: Promise<void> | undefined;

export function useAuth() {
  async function initialize() {
    if (initialized) return;
    if (!initialization) {
      initialization = (async () => {
        try {
          user.value = await authService.me();
          initialized = true;
        } catch (cause) {
          if (!(cause instanceof ApiError && cause.status === 401)) throw cause;
          user.value = null;
          initialized = true;
        } finally {
          initialization = undefined;
        }
      })();
    }
    await initialization;
  }

  async function authenticate(mode: 'login' | 'register', credentials: Credentials) {
    user.value = await authService[mode](credentials);
    initialized = true;
  }

  async function logout() {
    await authService.logout();
    user.value = null;
    initialized = true;
  }

  return { user: readonly(user), initialize, authenticate, logout };
}
