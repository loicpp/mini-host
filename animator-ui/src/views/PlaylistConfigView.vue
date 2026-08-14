<template>
  <main class="flex-1 overflow-y-auto relative p-0 w-full h-full">
    <PlaylistScreen 
      @back="router.push('/setup')"
    />
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import PlaylistScreen from '../components/control-panel/PlaylistScreen.vue';

const router = useRouter();
</script>
