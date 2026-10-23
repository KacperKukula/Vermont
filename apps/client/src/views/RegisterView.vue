<script setup lang="ts">
import AuthIntro from '../components/auth/AuthIntro.vue';
import AuthForm from '../components/auth/AuthForm.vue';
</script>

<template>
  <main class="welcome">
    <AuthIntro />
    <AuthForm mode="register" />
  </main>
</template>
