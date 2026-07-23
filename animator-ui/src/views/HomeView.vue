<template>
  <main class="flex-1 overflow-y-auto relative p-0 w-full h-full">
    <HomeScreen 
      :lastGameId="lastGameId || ''"
      @open-settings="router.push('/settings')"
      @open-playlists="router.push('/playlists')"
      @create-game="router.push('/game/create')"
      @resume-game="handleResumeGame"
      @run-diagnostics="router.push('/diagnostics')"
      @logout="handleLogout"
    />
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import HomeScreen from '../components/control-panel/HomeScreen.vue';
import { lastGameId } from '../composables/state';
import { useAuth } from '../composables/useAuth';
import { useGameSession } from '../composables/useGameSession';

const router = useRouter();
const { logout } = useAuth();
const { resumeGame } = useGameSession();

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
