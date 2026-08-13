<template>
  <button 
    :disabled="disabled"
    :class="[
      baseClass,
      sizes[size],
      variants[variant],
      disabled ? 'opacity-50 cursor-not-allowed' : '',
      className
    ]"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: "primary" },
  size: { type: String, default: "md" },
  className: { type: String, default: "" },
  disabled: { type: Boolean, default: false }
})

defineEmits(['click'])

const baseClass = "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 select-none cursor-pointer"

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base"
}

const variants = {
  primary: "bg-[#FFBA49] text-[#3F4739] hover:bg-[#f0aa30] active:scale-[0.98] shadow-sm",
  secondary: "bg-[#fff6e0] text-[#3F4739] hover:bg-[#ffe8a0] active:scale-[0.98]",
  ghost: "bg-transparent text-[#717568] hover:bg-gray-100 active:scale-[0.98]",
  danger: "bg-red-500 text-white hover:bg-red-600 active:scale-[0.98] shadow-sm",
  success: "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-[0.98] shadow-sm",
  dark: "bg-[#3F4739] text-white hover:bg-[#2e342a] active:scale-[0.98] shadow-sm",
  cyan: "bg-cyan-500 text-white hover:bg-cyan-600 active:scale-[0.98] shadow-sm"
}
</script>
