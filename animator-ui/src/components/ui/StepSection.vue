<template>
  <div class="flex gap-4 w-full">
    <!-- Number Badge -->
    <div class="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#FFF8E7] text-[#FFBA49] font-bold text-sm mt-0.5">
      {{ number }}
    </div>
    
    <!-- Content -->
    <div class="flex flex-col flex-1 min-w-0">
      <h3 class="text-base font-bold text-gray-800">{{ title }}</h3>
      <p class="text-xs text-gray-500 mb-2">{{ description }}</p>
      
      <div class="w-full">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  number: string | number;
  title: string;
  description: string;
}>();
</script>
