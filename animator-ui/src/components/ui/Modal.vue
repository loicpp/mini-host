<template>
  <Teleport to="body">
    <div :class="['app-modal-override fixed inset-0 flex items-center justify-center p-4 font-sans', zIndexClass]" :style="customStyle">
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="$emit('close')"></div>
      <div :class="`relative w-full ${maxW} bg-white rounded-2xl shadow-2xl border border-[rgba(0,0,0,0.08)] overflow-hidden`">
        <slot></slot>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps({
  maxW: {
    type: String,
    default: "max-w-md"
  },
  zIndexClass: {
    type: String,
    default: "z-50"
  },
  customStyle: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['close'])
</script>

<style>
/* Override driver.js which sets pointer-events: none on all elements when active */
.driver-active .app-modal-override,
.driver-active .app-modal-override * {
  pointer-events: auto !important;
}
</style>
