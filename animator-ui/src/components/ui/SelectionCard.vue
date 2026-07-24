<template>
  <button 
    class="group relative flex flex-col items-center justify-center p-8 transition-all duration-300 rounded-3xl border border-[rgba(0,0,0,0.06)] shadow-sm outline-none aspect-square selection-card"
    :class="[disabled ? 'opacity-60 cursor-not-allowed bg-gray-50/50' : 'bg-white hover:shadow-xl hover:-translate-y-2']"
    :style="cardStyle"
    :disabled="disabled"
  >
    <div v-if="disabled" class="absolute top-4 right-4 bg-gray-200 text-gray-500 text-xs font-bold px-2 py-1 rounded-md">{{ disabledLabel || 'Bientôt' }}</div>
    
    <div class="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors shadow-sm icon-wrapper"
      :class="[disabled ? 'bg-gray-200 text-gray-500' : '']">
      <slot name="icon"></slot>
    </div>
    <span class="text-2xl font-bold mb-2 text-center" :class="[disabled ? 'text-gray-500' : 'text-primary']">{{ title }}</span>
    <span class="text-sm font-medium text-center line-clamp-2" :class="[disabled ? 'text-gray-400' : 'text-muted-foreground']">{{ description }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  description: string;
  themeColor?: string;
  themeBg?: string;
  disabled?: boolean;
  disabledLabel?: string;
}>();

const cardStyle = computed(() => {
  if (props.disabled) return {};
  return {
    '--theme-color': props.themeColor || '#FFBA49',
    '--theme-bg': props.themeBg || '#fff6e0',
  } as any;
});
</script>

<style scoped>
.selection-card:not(:disabled):hover {
  border-color: var(--theme-color);
  background-color: var(--theme-bg);
}
.selection-card:not(:disabled) .icon-wrapper {
  background-color: var(--theme-bg);
  color: var(--theme-color);
}
.selection-card:not(:disabled):hover .icon-wrapper {
  background-color: var(--theme-color);
  color: white;
}
</style>
