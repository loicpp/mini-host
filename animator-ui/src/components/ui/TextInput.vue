<template>
  <div class="relative flex items-center" :class="wrapperClass">
    <input
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :placeholder="placeholder"
      :maxlength="maxLength"
      v-bind="$attrs"
      class="w-full transition-shadow outline-none"
      :class="[
        inputClass,
        focusClass,
        { 'pr-10': clearable && modelValue }
      ]"
      ref="inputRef"
    />
    <button
      v-if="clearable && modelValue"
      type="button"
      @click.stop="clearInput"
      class="absolute right-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-black/5"
    >
      <X class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { X } from '@lucide/vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  maxLength: {
    type: Number,
    default: undefined
  },
  clearable: {
    type: Boolean,
    default: false
  },
  wrapperClass: {
    type: [String, Object, Array],
    default: 'w-full'
  },
  inputClass: {
    type: [String, Object, Array],
    default: 'border-none bg-muted px-4 py-3 rounded-xl font-medium text-foreground'
  },
  focusClass: {
    type: String,
    default: 'focus:ring-2 focus:ring-[#FFBA49]'
  },
  clearOnUnmount: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'clear'])
const inputRef = ref<HTMLInputElement | null>(null)

function clearInput() {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

onUnmounted(() => {
  if (props.clearOnUnmount) {
    emit('update:modelValue', '')
  }
})

defineExpose({
  focus: () => inputRef.value?.focus()
})
</script>
