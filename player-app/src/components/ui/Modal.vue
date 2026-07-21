<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
    <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="$emit('close')"></div>
    <div :class="`relative w-full ${maxW} bg-white rounded-2xl shadow-2xl border border-[rgba(0,0,0,0.08)] overflow-hidden`">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  maxW: {
    type: String,
    default: "max-w-md"
  }
})

defineEmits(['close'])
</script>
