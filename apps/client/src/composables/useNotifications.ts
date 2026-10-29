import { readonly, ref } from 'vue';

const error = ref('');
const notice = ref('');

export function useNotifications() {
  function showError(cause: unknown) {
    error.value = cause instanceof Error ? cause.message : String(cause || 'Wystąpił nieoczekiwany błąd');
  }

  function showNotice(message: string) { notice.value = message; }
  function clearError() { error.value = ''; }
  function clearNotice() { notice.value = ''; }
  function clearNotif() { clearError(); clearNotice(); }

  return { 
    error: readonly(error),
    notice: readonly(notice),
    showError,
    showNotice,
    clearError,
    clearNotice,
    clearNotif
  };
}
