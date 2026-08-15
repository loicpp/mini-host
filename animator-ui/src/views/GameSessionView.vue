<template>
  <component :is="sessionComponent" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../core/domain/general/stores/game';
import BlindTestSession from '../components/games/blind-test/BlindTestSession.vue';

const { gameType } = useGameStore();


const sessionComponent = computed(() => {
  if (gameType.value === 'blind_test') {
    return BlindTestSession;
  }
  return BlindTestSession; // Fallback
});
</script>
