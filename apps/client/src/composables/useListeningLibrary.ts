import { readonly, ref, watch } from 'vue';
import type { Recording } from '@vermont/contracts';
import { useAuth } from './useAuth';

export type RecordingCategory = 'books' | 'music';

const historyLimit = 20;
const categories = ref<Record<string, RecordingCategory>>({});
const recentlyPlayed = ref<Recording[]>([]);
const { user } = useAuth();

function storageKey() {
  return user.value ? `vermont:listening-library:${user.value.id}` : null;
}

function isRecording(value: unknown): value is Recording {
  if (!value || typeof value !== 'object') return false;
  const recording = value as Partial<Recording>;
  return typeof recording.id === 'string'
    && typeof recording.title === 'string'
    && typeof recording.originalFilename === 'string'
    && typeof recording.sizeBytes === 'number'
    && typeof recording.createdAt === 'string';
}

watch(() => user.value?.id, () => {
  categories.value = {};
  recentlyPlayed.value = [];
  const key = storageKey();
  if (!key) return;
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (!saved || typeof saved !== 'object') return;
    if (saved.categories && typeof saved.categories === 'object') {
      for (const [id, category] of Object.entries(saved.categories)) {
        if (category === 'books' || category === 'music') categories.value[id] = category;
      }
    }
    if (Array.isArray(saved.recentlyPlayed)) {
      const seen = new Set<string>();
      recentlyPlayed.value = saved.recentlyPlayed.filter((recording: unknown) => {
        if (!isRecording(recording) || seen.has(recording.id)) return false;
        seen.add(recording.id);
        return true;
      }).slice(0, historyLimit);
    }
  } catch {
    // Keep listening available when browser storage is unavailable or invalid.
  }
}, { immediate: true, flush: 'sync' });

function persist() {
  const key = storageKey();
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify({
      categories: categories.value,
      recentlyPlayed: recentlyPlayed.value
    }));
  } catch {
    // Changes remain available for this session if browser storage is full.
  }
}

export function useListeningLibrary() {
  function categoryOf(id: string): RecordingCategory {
    return categories.value[id] === 'books' ? 'books' : 'music';
  }

  function setCategory(id: string, category: RecordingCategory) {
    if (!user.value) return;
    categories.value[id] = category;
    persist();
  }

  function remember(recording: Recording) {
    if (!user.value) return;
    recentlyPlayed.value = [recording, ...recentlyPlayed.value.filter((row) => row.id !== recording.id)]
      .slice(0, historyLimit);
    persist();
  }

  function forget(id: string) {
    recentlyPlayed.value = recentlyPlayed.value.filter((row) => row.id !== id);
    delete categories.value[id];
    persist();
  }

  function reconcile(recordings: Recording[], complete: boolean) {
    const available = new Map(recordings.map((recording) => [recording.id, recording]));
    recentlyPlayed.value = recentlyPlayed.value
      .filter((recording) => !complete || available.has(recording.id))
      .map((recording) => available.get(recording.id) ?? recording);
    persist();
  }

  return {
    recentlyPlayed: readonly(recentlyPlayed),
    categoryOf,
    setCategory,
    remember,
    forget,
    reconcile
  };
}
