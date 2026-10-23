import { computed, ref } from 'vue';
import type { Recording } from '@people/contracts';
import { recordingsService } from '../services/recordings.service';
import { useNotifications } from './useNotifications';
import { usePlayer } from './usePlayer';

export function useRecordings() {
  const recordings = ref<Recording[]>([]);
  const loading = ref(false);
  const hasMore = ref(false);
  const search = ref('');
  const deleting = ref<string | null>(null);
  const { showError } = useNotifications();
  const player = usePlayer();
  const totalBytes = computed(() => recordings.value.reduce((sum, row) => sum + row.sizeBytes, 0));
  const visible = computed(() => recordings.value.filter((row) =>
    `${row.title} ${row.originalFilename}`.toLocaleLowerCase().includes(search.value.toLocaleLowerCase()),
  ));

  async function load(reset = false) {
    if (loading.value) return;
    loading.value = true;
    try {
      const rows = await recordingsService.list(reset ? 0 : recordings.value.length);
      recordings.value = reset ? rows : [...recordings.value, ...rows];
      hasMore.value = rows.length === 100;
    } catch (cause) {
      showError(cause);
    } finally {
      loading.value = false;
    }
  }

  async function remove(recording: Recording) {
    if (!window.confirm(`Usunąć „${recording.title}”? Tej operacji nie można cofnąć.`)) return;
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

  return { recordings, visible, search, totalBytes, hasMore, loading, deleting, load, remove, play };
}
