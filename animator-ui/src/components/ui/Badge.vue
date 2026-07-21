<template>
  <span :class="`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${map[color]}`">
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
const { color = "gray" } = defineProps<{
  color?: "amber" | "green" | "red" | "blue" | "gray" | "pink"
}>()

const map: Record<string, string> = {
  amber: "bg-amber-100 text-amber-800 font-bold",
  green: "bg-emerald-100 text-emerald-800 font-bold",
  red:   "bg-red-100 text-red-800 font-bold",
  blue:  "bg-blue-100 text-blue-800 font-bold",
  gray:  "bg-gray-200 text-gray-800 font-bold",
  pink:  "bg-pink-100 text-pink-800 font-bold"
}
</script>
