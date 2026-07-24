<template>
  <component :is="sessionComponent" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { gameType } from '../composables/state';
import BlindTestSession from '../components/games/blind-test/BlindTestSession.vue';

const sessionComponent = computed(() => {
  if (gameType.value === 'blind_test') {
    return BlindTestSession;
  }
  return BlindTestSession; // Fallback
});
</script>
