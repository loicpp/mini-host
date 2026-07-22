<template>
  <button 
    :disabled="disabled"
    :class="[
      baseClass,
      sizes[size],
      computedVariant,
      disabled ? 'opacity-50 cursor-not-allowed' : '',
      className
    ]"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const { variant = "primary", size = "md", className = "", disabled = false } = defineProps<{
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "dark" | "cyan" | "orange" | "blue" | "pink" | "gray" | "soft" | "ghost-yellow" | "ghost-orange" | "ghost-red"
  size?: "sm" | "md" | "lg"
  className?: string
  disabled?: boolean
}>()

const computedVariant = computed(() => {
  const base = variants[variant] || variants.primary;
  if (!disabled) return base;
  return base.split(' ').filter(c => !c.startsWith('hover:') && !c.startsWith('active:')).join(' ');
});

defineEmits(['click'])

const baseClass = "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 select-none cursor-pointer"

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base"
}

const variants = {
  primary: "bg-[#FFBA49] text-[#3F4739] hover:bg-[#f0aa30] active:scale-[0.98] shadow-sm",
  secondary: "bg-[#FFD166] text-[#3F4739] hover:bg-[#FFBA49] active:scale-[0.98] shadow-sm",
  ghost: "bg-transparent text-[#717568] hover:bg-gray-100 active:scale-[0.98]",
  danger: "bg-red-500 text-white hover:bg-red-600 active:scale-[0.98] shadow-sm",
  success: "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-[0.98] shadow-sm",
  dark: "bg-[#3F4739] text-white hover:bg-[#2e342a] active:scale-[0.98] shadow-sm",
  cyan: "bg-cyan-500 text-white hover:bg-cyan-600 active:scale-[0.98] shadow-sm",
  orange: "bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.98] shadow-sm",
  blue: "bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.98] shadow-sm",
  pink: "bg-pink-500 text-white hover:bg-pink-600 active:scale-[0.98] shadow-sm",
  gray: "bg-gray-200 text-gray-800 hover:bg-gray-300 active:scale-[0.98] shadow-sm",
  soft: "bg-gray-200/70 text-gray-800 hover:bg-gray-300 active:scale-[0.98]",
  'ghost-yellow': "bg-transparent text-[#e09e24] hover:bg-[#FFBA49]/15 hover:text-[#c28415] active:scale-[0.98] hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200",
  'ghost-orange': "bg-transparent text-orange-600 hover:bg-orange-100 hover:text-orange-800 active:scale-[0.98] hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200",
  'ghost-red': "bg-transparent text-red-600 hover:bg-red-100 hover:text-red-800 active:scale-[0.98] hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
}
</script>
