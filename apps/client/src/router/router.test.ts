import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryHistory } from 'vue-router';
import type { User } from '@vermont/contracts';

const state = vi.hoisted(() => ({
  user: { value: null as User | null },
  uploading: { value: false },
  restoreSession: vi.fn<() => Promise<void>>(),
}));

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({ user: state.user, restoreSession: state.restoreSession }),
}));
vi.mock('@/composables/useUpload', () => ({
  useUploadStatus: () => ({ uploading: state.uploading }),
}));

import { createAppRouter } from './index';

describe('application routing', () => {
  beforeEach(() => {
    state.user.value = null;
    state.uploading.value = false;
    state.restoreSession.mockReset().mockResolvedValue(undefined);
  });

  it('redirects a guest to login and preserves the requested page', async () => {
    const router = createAppRouter(createMemoryHistory());
    await router.push('/integrations');
    expect(router.currentRoute.value.name).toBe('login');
    expect(router.currentRoute.value.query.redirect).toBe('/integrations');
  });

  it('allows a guest to open registration', async () => {
    const router = createAppRouter(createMemoryHistory());
    await router.push('/register');
    expect(router.currentRoute.value.name).toBe('register');
  });

  it('redirects the root to the dashboard for authenticated users', async () => {
    state.user.value = { id: 'user', email: 'user@example.com' };
    const router = createAppRouter(createMemoryHistory());
    await router.push('/');
    expect(router.currentRoute.value.name).toBe('dashboard');
  });

  it('redirects an authenticated user away from login', async () => {
    state.user.value = { id: 'user', email: 'user@example.com' };
    const router = createAppRouter(createMemoryHistory());
    await router.push('/login');
    expect(router.currentRoute.value.name).toBe('dashboard');
  });

  it('keeps the old library URL working as the dashboard', async () => {
    state.user.value = { id: 'user', email: 'user@example.com' };
    const router = createAppRouter(createMemoryHistory());
    await router.push('/library');
    expect(router.currentRoute.value.name).toBe('dashboard');
  });

  it('allows navigation between protected pages', async () => {
    state.user.value = { id: 'user', email: 'user@example.com' };
    const router = createAppRouter(createMemoryHistory());
    await router.push('/dashboard');
    await router.push('/integrations');
    expect(router.currentRoute.value.name).toBe('integrations');
  });

  it('does not abandon an active upload', async () => {
    state.user.value = { id: 'user', email: 'user@example.com' };
    const router = createAppRouter(createMemoryHistory());
    await router.push('/dashboard');
    state.uploading.value = true;
    await router.push('/integrations');
    expect(router.currentRoute.value.name).toBe('dashboard');
  });

  it('shows a 404 page for an unknown path', async () => {
    const router = createAppRouter(createMemoryHistory());
    await router.push('/does-not-exist');
    expect(router.currentRoute.value.name).toBe('not-found');
  });

  it('renders login when the session check encounters a network failure', async () => {
    state.restoreSession.mockRejectedValue(new Error('Offline'));
    const router = createAppRouter(createMemoryHistory());
    await router.push('/dashboard');
    expect(router.currentRoute.value.name).toBe('login');
  });
});
