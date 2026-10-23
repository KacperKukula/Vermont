import AppLayout from '../layouts/AppLayout.vue';

export const routes = {
    path: '/',
    component: AppLayout,
    children: [
        { path: '', redirect: { name: 'library' } },
        {
            path: 'login', name: 'login',
            meta: { guestOnly: true, title: 'Logowanie' },
            component: () => import('../views/LoginView.vue'),
        },
        {
            path: 'register', name: 'register',
            meta: { guestOnly: true, title: 'Rejestracja' },
            component: () => import('../views/RegisterView.vue'),
        },
        {
            path: 'library', name: 'library',
            meta: { requiresAuth: true, title: 'Biblioteka' },
            component: () => import('../views/LibraryView.vue'),
        },
        {
            path: 'integrations', name: 'integrations',
            meta: { requiresAuth: true, title: 'Integracje' },
            component: () => import('../views/IntegrationsView.vue'),
        },
        {
            path: ':pathMatch(.*)*', name: 'not-found',
            meta: { title: 'Nie znaleziono strony' },
            component: () => import('../views/NotFoundView.vue'),
        },
    ],
}