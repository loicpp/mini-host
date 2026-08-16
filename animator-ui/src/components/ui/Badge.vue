<template>
  <span :class="`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colorStyles[color]}`">
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
const { color = "gray" } = defineProps<{
  color?: "amber" | "green" | "red" | "blue" | "gray" | "pink" | "purple"
}>();

const colorStyles = {
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  green: "bg-emerald-100 text-emerald-700 border-emerald-200",
  red: "bg-red-100 text-red-700 border-red-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  gray: "bg-gray-100 text-gray-700 border-gray-200",
  pink: "bg-pink-100 text-pink-700 border-pink-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200"
};
</script>
