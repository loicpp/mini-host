<template>
  <main class="flex-1 overflow-y-auto relative p-0 w-full h-full">
    <SetupSelectorScreen @back="router.push('/')" @select-setup="handleSelectSetup" />
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import SetupSelectorScreen from '../components/control-panel/SetupSelectorScreen.vue';
import { useTutorial } from '../composables/useTutorial';

const router = useRouter();
const { playSetupSequence } = useTutorial();

onMounted(() => {
  playSetupSequence();
});

const handleSelectSetup = (setupType: string) => {
  if (setupType === 'playlists') {
    router.push('/playlists');
  }
};
</script>
