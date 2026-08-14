<template>
  <button 
    class="flex items-center justify-start gap-2 text-muted-foreground hover:text-primary font-bold text-sm transition-colors z-10 w-[180px] h-[44px] shrink-0"
    @click="$emit('click')"
  >
    <ChevronLeft class="w-4 h-4" /> 
    <span class="truncate pr-2"><slot>{{ text }}</slot></span>
  </button>
</template>

<script setup lang="ts">
import { ChevronLeft } from '@lucide/vue';

defineProps<{
  text?: string;
}>();

defineEmits<{
  (e: 'click'): void;
}>();
</script>
