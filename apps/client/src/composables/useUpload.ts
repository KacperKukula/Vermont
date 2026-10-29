import { readonly, ref } from 'vue';
import type { UploadTicket } from '@vermont/contracts';
import { recordingsService } from '@/services/recordings.service';
import { uploadFile } from '@/services/http';
import { useNotifications } from './useNotifications';
import { useListeningLibrary, type RecordingCategory } from './useListeningLibrary';

// Shared only to disable logout/navigation while a transfer is in progress.
const uploading = ref(false);
export function useUploadStatus() { return { uploading: readonly(uploading) }; }

export function useUpload() {
  const file = ref<File | null>(null);
  const title = ref('');
  const category = ref<RecordingCategory>('music');
  const library = useListeningLibrary();
  const progress = ref(0);
  const { showError, showNotice, clearNotif, clearError } = useNotifications();

  function selectFile(candidate?: File) {
    if (uploading.value || !candidate) return;
    if (!/\.mp3$/i.test(candidate.name) || !candidate.size) {
      showError('Wybierz niepusty plik z rozszerzeniem .mp3');
      return;
    }
    clearError();
    file.value = candidate;
    title.value = candidate.name.replace(/\.mp3$/i, '');
  }

  async function upload(): Promise<boolean> {
    if (!file.value || uploading.value) return false;
    uploading.value = true;
    progress.value = 0;
    clearNotif();
    let ticket: UploadTicket | undefined;
    try {
      ticket = await recordingsService.initiateUpload({
        title: title.value, filename: file.value.name, sizeBytes: file.value.size,
      });
      await uploadFile(ticket.uploadUrl, file.value, (value) => { progress.value = value; });
      const recording = await recordingsService.completeUpload(ticket.id);
      library.setCategory(recording.id, category.value);
      file.value = null;
      title.value = '';
      showNotice('Your recording is ready to play.');
      return true;
    } catch (cause) {
      showError(cause);
      if (ticket) await recordingsService.remove(ticket.id).catch(() => {});
      return false;
    } finally {
      uploading.value = false;
    }
  }

  return {
    file,
    title,
    category,
    progress,
    uploading: readonly(uploading),
    selectFile,
    upload
  };
}
