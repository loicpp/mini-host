<template>
  <div class="relative h-5 flex items-center">
    <div class="relative w-full h-1.5 bg-gray-200 rounded-full">
      <div class="absolute left-0 top-0 h-full rounded-full" :style="{ width: `${pct}%`, background: color }"></div>
    </div>
    <input 
      type="range" 
      :min="min" 
      :max="max" 
      :value="modelValue" 
      @input="updateValue"
      class="absolute inset-0 w-full opacity-0 cursor-pointer h-full" 
    />
    <div class="absolute w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
         :style="{ left: `calc(${pct}% - 8px)`, background: color }"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  color: { type: String, default: "#FFBA49" }
})

const emit = defineEmits(['update:modelValue'])

const pct = computed(() => {
  return ((props.modelValue - props.min) / (props.max - props.min)) * 100
})

const updateValue = (e) => {
  const val = Number(e.target.value)
  emit('update:modelValue', val)
}
</script>
