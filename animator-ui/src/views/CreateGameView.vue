<template>
  <main class="flex-1 overflow-y-auto relative p-0 w-full h-full">
    <component 
      :is="configComponent"
      @back="router.push('/game/selector')"
      @configure-playlists="handleConfigurePlaylists"
      @start-game="handleStartGame"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import BlindTestConfig from '../components/games/blind-test/BlindTestConfig.vue';
import { useGameSession } from '../composables/useGameSession';
import { useTutorial } from '../composables/useTutorial';

const router = useRouter();
const route = useRoute();
const { createNewGame, leaveGame } = useGameSession();
const { playInitBlindTestSequence, tutorialGameId, isTutorialActive } = useTutorial();

onMounted(() => {
  playInitBlindTestSequence();
});

const gameType = computed(() => route.params.gameType as string || 'blind_test');

const configComponent = computed(() => {
  if (gameType.value === 'blind_test') {
    return BlindTestConfig;
  }
  return BlindTestConfig; // Fallback
});

const handleConfigurePlaylists = async () => {
  await leaveGame();
  router.push('/playlists');
};

const handleStartGame = async (settings: any) => {
  if (isTutorialActive.value) {
    settings.isTutorial = true;
  }
  const newGameId = await createNewGame(gameType.value, settings);
  if (isTutorialActive.value) {
    tutorialGameId.value = newGameId;
  }
  router.push(`/game/${newGameId}`);
};
</script>
