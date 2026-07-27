<template>
  <div class="relative h-5 flex items-center">
    <div class="relative w-full h-1.5 bg-gray-200 rounded-full">
      <div class="absolute left-0 top-0 h-full rounded-full" :style="{ width: `${pct}%`, background: color }"></div>
    </div>
    <input 
      type="range" 
      :min="internalMin" 
      :max="internalMax" 
      :value="modelValue" 
      @input="updateValue"
      class="absolute inset-0 w-full opacity-0 cursor-pointer h-full" 
    />
    <div class="absolute w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
         :style="{ left: `calc(${pct}% - 8px)`, background: color }"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  color: {
    type: String,
    default: "#FFBA49"
  },
  stepValues: {
    type: Array as () => number[],
    default: undefined
  },
  allowShiftOverride: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const isShiftPressed = ref(false);

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Shift') {
    isShiftPressed.value = true;
  }
};

const handleKeyUp = (e: KeyboardEvent) => {
  if (e.key === 'Shift') {
    isShiftPressed.value = false;
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
});

const internalMin = computed(() => {
  if (props.stepValues && props.stepValues.length > 0) {
    return Math.min(...props.stepValues, props.min);
  }
  return props.min;
});

const internalMax = computed(() => {
  if (props.stepValues && props.stepValues.length > 0) {
    return Math.max(...props.stepValues, props.max);
  }
  return props.max;
});

const pct = computed(() => {
  let percentage = ((props.modelValue - internalMin.value) / (internalMax.value - internalMin.value)) * 100;
  if (percentage < 0) percentage = 0;
  if (percentage > 100) percentage = 100;
  return percentage;
})

const updateValue = (e: Event) => {
  const val = Number((e.target as HTMLInputElement).value)
  if (props.stepValues && props.stepValues.length > 0 && !(props.allowShiftOverride && isShiftPressed.value)) {
    let closest = props.stepValues[0];
    let minDiff = Infinity;
    for (const step of props.stepValues) {
      const diff = Math.abs(step - val);
      if (diff < minDiff) {
        minDiff = diff;
        closest = step;
      }
    }
    emit('update:modelValue', closest)
    // Force input to snap visually if necessary (although opacity is 0)
    ;(e.target as HTMLInputElement).value = closest.toString();
  } else {
    emit('update:modelValue', val)
  }
}
</script>
