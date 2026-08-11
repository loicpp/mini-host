<template>
  <button 
    class="relative flex transition-all duration-300 rounded-2xl border bg-white outline-none overflow-hidden group w-full"
    :class="[
      selected ? 'border-[#FFBA49] shadow-md' : 'border-[rgba(0,0,0,0.08)] shadow-sm hover:border-gray-300',
      layout === 'horizontal' ? 'flex-row items-center p-4 gap-4 text-left' : 
      layout === 'compact' ? 'flex-col items-start p-3 text-left' :
      'flex-col items-center justify-center p-3 gap-1.5 text-center'
    ]"
    @click="$emit('click')"
  >
    <!-- Icon slot wrapped in a circle (for horizontal/vertical) -->
    <div v-if="layout !== 'compact'" class="flex-shrink-0 flex items-center justify-center rounded-full transition-colors"
      :class="[
        layout === 'horizontal' ? 'w-10 h-10' : 'w-8 h-8',
        selected ? 'bg-[#FFF8E7] text-[#FFBA49]' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
      ]">
      <slot name="icon"></slot>
    </div>

    <!-- Text content -->
    <div class="flex flex-col" :class="[layout === 'horizontal' ? 'flex-1' : 'w-full']">
      <span class="font-bold text-sm" :class="selected ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'">{{ title }}</span>
      <span class="text-xs mt-0.5" :class="selected ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'">{{ description }}</span>
    </div>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  selected?: boolean;
  layout?: 'horizontal' | 'vertical' | 'compact';
}>();

defineEmits<{
  (e: 'click'): void;
}>();
</script>
