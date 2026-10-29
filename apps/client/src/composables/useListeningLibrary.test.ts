import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Recording } from '@vermont/contracts';
import { authService } from '@/services/auth.service';
import { useAuth } from './useAuth';
import { useListeningLibrary } from './useListeningLibrary';

vi.mock('@/services/auth.service', () => ({
  authService: { login: vi.fn(), logout: vi.fn() }
}));

function recording(id: string): Recording {
  return {
    id,
    title: id,
    originalFilename: `${id}.mp3`,
    sizeBytes: 10,
    createdAt: '2026-01-01'
  };
}

describe('account listening library', () => {
  const auth = useAuth();
  const library = useListeningLibrary();
  let storage: Map<string, string>;

  async function signIn(id: string) {
    vi.mocked(authService.login).mockResolvedValue({ id, email: `${id}@example.com` });
    await auth.login({ email: `${id}@example.com`, password: 'example-password' });
  }

  beforeEach(async () => {
    await auth.logout();
    storage = new Map();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value)
    });
    await signIn('first');
  });

  afterEach(() => vi.unstubAllGlobals());

  it('keeps a unique playlist in most recently played order and limits its size', () => {
    for (let index = 0; index < 25; index++) library.remember(recording(String(index)));
    library.remember(recording('12'));
    expect(library.recentlyPlayed.value).toHaveLength(20);
    expect(library.recentlyPlayed.value[0]?.id).toBe('12');
    expect(library.recentlyPlayed.value[1]?.id).toBe('24');
    expect(library.recentlyPlayed.value.filter((row) => row.id === '12')).toHaveLength(1);
  });

  it('persists categories and history and isolates them between accounts', async () => {
    library.setCategory('book', 'books');
    library.remember(recording('book'));
    await auth.logout();
    expect(library.recentlyPlayed.value).toEqual([]);
    await signIn('second');
    expect(library.categoryOf('book')).toBe('music');
    expect(library.recentlyPlayed.value).toEqual([]);
    library.remember(recording('track'));
    await signIn('first');
    expect(library.categoryOf('book')).toBe('books');
    expect(library.recentlyPlayed.value.map((row) => row.id)).toEqual(['book']);
  });

  it('removes deleted files from history and category assignments', () => {
    library.setCategory('book', 'books');
    library.remember(recording('book'));
    library.forget('book');
    expect(library.categoryOf('book')).toBe('music');
    expect(library.recentlyPlayed.value).toEqual([]);
  });

  it('preserves history while paginating and removes unavailable files after a complete load', () => {
    library.remember(recording('older'));
    library.remember(recording('newer'));
    library.reconcile([recording('newer')], false);
    expect(library.recentlyPlayed.value).toHaveLength(2);
    library.reconcile([{ ...recording('newer'), title: 'Updated title' }], true);
    expect(library.recentlyPlayed.value.map((row) => row.title)).toEqual(['Updated title']);
  });

  it('ignores corrupt stored data', async () => {
    await auth.logout();
    storage.set('vermont:listening-library:first', '{invalid');
    await signIn('first');
    expect(library.recentlyPlayed.value).toEqual([]);
    await auth.logout();
    storage.set('vermont:listening-library:first', JSON.stringify({
      categories: { book: 'books', invalid: 'unknown' },
      recentlyPlayed: [null, { id: 'incomplete' }, recording('book'), recording('book')]
    }));
    await signIn('first');
    expect(library.categoryOf('book')).toBe('books');
    expect(library.categoryOf('invalid')).toBe('music');
    expect(library.recentlyPlayed.value.map((row) => row.id)).toEqual(['book']);
  });

  it('still supports listening and categories when browser storage is blocked', () => {
    vi.stubGlobal('localStorage', {
      setItem: () => { throw new Error('Storage unavailable'); }
    });
    expect(() => library.remember(recording('book'))).not.toThrow();
    expect(() => library.setCategory('book', 'books')).not.toThrow();
    expect(library.recentlyPlayed.value[0]?.id).toBe('book');
    expect(library.categoryOf('book')).toBe('books');
  });
});
