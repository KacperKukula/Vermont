import { createRouter, type RouterHistory } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useNotifications } from '@/composables/useNotifications';
import { useUploadStatus } from '@/composables/useUpload';
import { routes } from './routes';

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    guestOnly?: boolean;
    title?: string;
  }
}

export function createAppRouter(history: RouterHistory) {
  const router = createRouter({
    history,
    scrollBehavior: () => ({ top: 0 }),
    routes: [routes],
  });

  router.beforeEach(async (to, from) => {
    const notifications = useNotifications();
    if (useUploadStatus().uploading.value && to.fullPath !== from.fullPath) {
      notifications.showError('Poczekaj na zakończenie przesyłania pliku.');
      return false;
    }

    const auth = useAuth();
    
    try { await auth.restoreSession(); }
    catch (cause) {
      notifications.showError(cause);
      // Let the login page render even if the backend is temporarily unavailable.
      if (to.meta.requiresAuth) return { name: 'login', query: { redirect: to.fullPath } };
    }

    if (to.meta.requiresAuth && !auth.user.value) {
      return { name: 'login', query: { redirect: to.fullPath } };
    }
    if (to.meta.guestOnly && auth.user.value) return { name: 'dashboard' };
  });

  router.afterEach((to, _from, failure) => {
    if (!failure && typeof document !== 'undefined') document.title = `${to.meta.title ?? 'MP3'} — Fala`;
  });

  return router;
}
