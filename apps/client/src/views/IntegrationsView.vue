<script setup lang="ts">
import McpTokenCard from '@/components/integrations/McpTokenCard.vue';
</script>

<template>
  <main class="dashboard">
    <section class="page-heading">
      <div>
        <span class="eyebrow">POŁĄCZ SWOJĄ BIBLIOTEKĘ</span>
        <h1>Integracje<span class="brand-dot">.</span></h1>
        <p>Zarządzaj dostępem klientów MCP do swoich nagrań.</p>
      </div>
    </section>
    <div class="integrations-content"><McpTokenCard /></div>
  </main>
</template>
