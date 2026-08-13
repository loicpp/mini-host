<template>
  <span :class="`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${map[color]}`">
    <slot></slot>
  </span>
</template>

<script setup>
defineProps({
  color: {
    type: String,
    default: "amber"
  }
})

const map = {
  amber: "bg-[#fff6e0] text-[#3F4739]",
  green: "bg-emerald-50 text-emerald-700",
  red:   "bg-red-50 text-red-600",
  blue:  "bg-sky-50 text-sky-700",
  gray:  "bg-gray-100 text-gray-700"
}
</script>
