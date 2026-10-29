import { readonly, ref } from 'vue';
import type { Credentials, User } from '@vermont/contracts';
import { authService } from '@/services/auth.service';
import { ApiError } from '@/services/http';

const user = ref<User | null>(null);

export function useAuth() {

  /**
   * Initializes authentication 
   * @returns 
   */
  async function restoreSession() {
    if (user.value!!) return;
    else {
      try { user.value = await authService.me(); }
      catch (cause) { 
        if (!(cause instanceof ApiError && cause.status === 401)) throw cause
        user.value = null;
      }
    }
  }

  /**
   * Logs in the user with the provided credentials.
   * @param credentials The user's login credentials (email and password)
   */
  async function login(credentials: Credentials) {
    user.value = await authService.login(credentials);
  }

  async function register(credentials: Credentials) {
    user.value = await authService.register(credentials);
  }

  async function logout() {
    await authService.logout();
    user.value = null;
  }

  return {
    user: readonly(user),
    restoreSession,
    login,
    register,
    logout
  };
}
