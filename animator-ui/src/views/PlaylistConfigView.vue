<template>
  <main class="flex-1 overflow-y-auto relative p-0 w-full h-full">
    <PlaylistScreen 
      @back="router.push('/setup')"
    />
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import PlaylistScreen from '../components/control-panel/PlaylistScreen.vue';
import { useTutorial } from '../composables/useTutorial';

const router = useRouter();
const { playPlaylistsSequence } = useTutorial();

onMounted(() => {
  playPlaylistsSequence();
});
</script>
