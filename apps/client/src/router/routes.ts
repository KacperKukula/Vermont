import AppLayout from '@/layouts/AppLayout.vue';
import { paths } from './paths';

export const routes = {
  path: paths.root,
  component: AppLayout,
  children: [
    { path: '', redirect: { name: 'dashboard' } },
    {
      path: paths.login,
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: {
        guestOnly: true,
        title: 'Logowanie'
      },
    },
    {
      path: paths.register,
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: {
        guestOnly: true,
        title: 'Rejestracja'
      },
    },
    {
      path: paths.dashboard,
      alias: paths.library,
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Dashboard'
      },
    },
    {
      path: paths.notFound,
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'Nie znaleziono strony' },
    },
  ],
};
