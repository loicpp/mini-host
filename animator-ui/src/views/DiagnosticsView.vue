<template>
  <main class="flex-1 overflow-y-auto relative p-0 w-full h-full">
    <div class="h-full bg-background flex flex-col">
      <div class="p-4 border-b flex justify-between items-center">
        <h2 class="text-xl font-bold">{{ $t('control_panel.diagnostics') }}</h2>
        <button @click="router.push('/')" class="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80">
          {{ $t('control_panel.close') }}
        </button>
      </div>
      <div class="flex-1 overflow-auto">
        <DiagnosticsModal @close="router.push('/')" />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import DiagnosticsModal from '../components/control-panel/DiagnosticsModal.vue';

const router = useRouter();
</script>
