<script setup lang="ts">
import { ref } from 'vue';
import { mcpService } from '@/services/mcp.service';
import { useNotifications } from '@/composables/useNotifications';

const token = ref('');
const busy = ref(false);
const { clearError, showError, showNotice } = useNotifications();

async function createToken() {
  busy.value = true;
  clearError();
  token.value = '';
  try {
    token.value = (await mcpService.createToken()).token;
  } catch (cause) {
    showError(cause);
  } finally {
    busy.value = false;
  }
}

async function revokeToken() {
  busy.value = true;
  clearError();
  try {
    await mcpService.revokeToken();
    token.value = '';
    showNotice('Token MCP został unieważniony.');
  } catch (cause) {
    showError(cause);
  } finally {
    busy.value = false;
  }
}

function selectToken(event: FocusEvent) { (event.target as HTMLTextAreaElement).select(); }
</script>

<template>
  <section class="integration-card">
    <h2>Integracja MCP</h2>
    <p>Token daje dostęp do listy i linków odtwarzania przez <code>/mcp</code>. Traktuj go jak hasło. Nowy token zastępuje poprzedni.</p>
    <p>To integracja Bearer dla klientów MCP. Połączenie z ChatGPT może wymagać dodatkowej konfiguracji OAuth.</p>
    <button class="button ghost full" :disabled="busy" @click="createToken">Wygeneruj token</button>
    <textarea v-if="token" :value="token" readonly rows="3" aria-label="Token MCP — skopiuj i zapisz" @focus="selectToken"></textarea>
    <button class="text-button" :disabled="busy" @click="revokeToken">Unieważnij token</button>
  </section>
</template>

<style scoped lang="scss">
.integration-card {
  padding: tokens.$space-7;
  border: 1px solid tokens.$color-border;
  border-radius: tokens.$radius-md;

  h2 {
    font-size: 20px;
  }

  p {
    margin-top: 15px;
    font-size: tokens.$font-size-label;
  }

  .button {
    font-size: tokens.$font-size-sm;
  }

  textarea {
    margin-top: tokens.$space-3;
    overflow-wrap: anywhere;
    resize: vertical;
    font-size: tokens.$font-size-xs;
  }

  @include mixins.mobile {
    padding: tokens.$space-5;
  }
}
</style>
