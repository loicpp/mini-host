<template>
  <main class="flex-1 overflow-y-auto relative p-0 w-full h-full">
    <HistoryScreen @back="router.push('/')" />
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import HistoryScreen from '../components/general/HistoryScreen.vue';

const router = useRouter();
</script>
