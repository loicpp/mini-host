<template>
  <main class="flex-1 overflow-y-auto relative p-0 w-full h-full">
    <GameSelectorScreen @back="router.push('/')" @select-game="handleSelectGame" />
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import GameSelectorScreen from '../components/games/GameSelectorScreen.vue';

const router = useRouter();

const handleSelectGame = (gameType: string) => {
  router.push(`/game/create/${gameType}`);
};
</script>
