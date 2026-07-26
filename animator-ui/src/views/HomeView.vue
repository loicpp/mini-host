<template>
  <main class="flex-1 overflow-y-auto relative p-0 w-full h-full">
    <HomeScreen 
      :lastGameId="verifiedLastGameId || ''"
      @open-settings="router.push('/settings')"
      @open-setup="router.push('/setup')"
      @create-game="router.push('/game/selector')"
      @resume-game="handleResumeGame"
      @run-diagnostics="router.push('/diagnostics')"
      @logout="handleLogout"
    />
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import HomeScreen from '../components/control-panel/HomeScreen.vue';
import { lastGameId } from '../composables/state';
import { useAuth } from '../composables/useAuth';
import { useGameSession } from '../composables/useGameSession';
import { animatorService } from '../services/animatorService';

const router = useRouter();
const { logout } = useAuth();
const { resumeGame } = useGameSession();

const verifiedLastGameId = ref<string | null>(null);

onMounted(async () => {
  if (lastGameId.value) {
    try {
      const gameData = await animatorService.getGame(lastGameId.value);
      if (!gameData) {
        lastGameId.value = null;
        localStorage.removeItem('minihost_last_game');
      } else {
        verifiedLastGameId.value = lastGameId.value;
      }
    } catch (e) {
      console.warn("Impossible de vérifier l'existence de la partie", e);
    }
  }
});

const handleResumeGame = async () => {
  const success = await resumeGame();
  if (success) {
    router.push(`/game/${lastGameId.value}`);
  }
};

const handleLogout = async () => {
  const success = await logout();
  if (success) {
    router.push('/login');
  }
};
</script>
