<template>
  <main class="flex-1 overflow-y-auto relative p-0 w-full h-full">
    <CreateGameScreen
      @back="router.push('/')"
      @configure-playlists="handleConfigurePlaylists"
      @start-game="handleStartGame"
    />
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import CreateGameScreen from '../components/control-panel/CreateGameScreen.vue';
import { useGameSession } from '../composables/useGameSession';

const router = useRouter();
const { createNewGame, leaveGame } = useGameSession();

const handleConfigurePlaylists = async () => {
  await leaveGame();
  router.push('/playlists');
};

const handleStartGame = async (settings: any) => {
  const newGameId = await createNewGame(settings);
  router.push(`/game/${newGameId}`);
};
</script>
