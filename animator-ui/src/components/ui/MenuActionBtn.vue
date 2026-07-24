<template>
  <button class="group flex items-center p-4 bg-white hover:bg-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm text-left outline-none" @click="$emit('click')">
    <div :class="['w-12 h-12 rounded-xl flex items-center justify-center mr-5 shrink-0', colorClass]">
      <slot name="icon"></slot>
    </div>
    <span class="text-lg font-bold text-primary flex-1">{{ title }}</span>
    <slot name="extra"></slot>
    <ChevronRight class="w-5 h-5 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors mr-2 shrink-0" />
  </button>
</template>

<script setup lang="ts">
import { ChevronRight } from '@lucide/vue';

defineProps<{
  title: string;
  colorClass: string;
}>();

defineEmits<{
  (e: 'click'): void;
}>();
</script>
