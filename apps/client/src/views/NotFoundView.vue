<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <main class="page-content">
    <span class="eyebrow">404</span>
    <h1>Tu jest tylko cisza.</h1>
    <p>Nie znaleziono takiej strony.</p>
    <RouterLink class="button ghost" to="/">Wróć na stronę główną</RouterLink>
  </main>
</template>
