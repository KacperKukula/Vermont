import { computed, ref } from 'vue';
import type { Recording } from '@vermont/contracts';
import { recordingsService } from '@/services/recordings.service';
import { useNotifications } from './useNotifications';
import { usePlayer } from './usePlayer';
import { useListeningLibrary, type RecordingCategory } from './useListeningLibrary';
import { useAuth } from './useAuth';

export function useRecordings() {
  const recordings = ref<Recording[]>([]);
  const loading = ref(false);
  const hasMore = ref(false);
  const search = ref('');
  const category = ref<RecordingCategory | 'all'>('all');
  const deleting = ref<string | null>(null);
  const { showError } = useNotifications();
  const player = usePlayer();
  const library = useListeningLibrary();
  const { user } = useAuth();
  const totalBytes = computed(() => recordings.value.reduce((sum, row) => sum + row.sizeBytes, 0));
  const categoryRecordings = computed(() => recordings.value.filter((row) =>
    category.value === 'all' || library.categoryOf(row.id) === category.value
  ));
  const visible = computed(() => categoryRecordings.value.filter((row) =>
    `${row.title} ${row.originalFilename}`.toLocaleLowerCase().includes(search.value.trim().toLocaleLowerCase())
  ));
  const bookCount = computed(() => recordings.value.filter((row) => library.categoryOf(row.id) === 'books').length);
  const musicCount = computed(() => recordings.value.length - bookCount.value);

  async function load(reset = false) {
    if (loading.value) return;
    const userId = user.value?.id;
    loading.value = true;
    try {
      const rows = await recordingsService.list(reset ? 0 : recordings.value.length);
      if (userId !== user.value?.id) return;
      recordings.value = reset ? rows : [...recordings.value, ...rows];
      hasMore.value = rows.length === 100;
      library.reconcile(recordings.value, !hasMore.value);
    } catch (cause) {
      showError(cause);
    } finally {
      loading.value = false;
    }
  }

  async function remove(recording: Recording) {
    if (!window.confirm(`Delete “${recording.title}”? This cannot be undone.`)) return;
    deleting.value = recording.id;
    try {
      await recordingsService.remove(recording.id);
      player.removeFromQueue(recording.id);
      await load(true);
    } catch (cause) {
      showError(cause);
    } finally {
      deleting.value = null;
    }
  }

  function play(recording: Recording) {
    player.setQueue(visible.value);
    void player.play(recording);
  }

  return {
    recordings,
    visible,
    categoryRecordings,
    category,
    bookCount,
    musicCount,
    search,
    totalBytes,
    hasMore,
    loading,
    deleting,
    load,
    remove,
    play
  };
}
