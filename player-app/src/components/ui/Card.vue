<template>
  <div :class="`bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] shadow-sm ${className}`">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps({
  className: {
    type: String,
    default: ""
  }
})
</script>
