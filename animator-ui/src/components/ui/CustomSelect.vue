<template>
  <div class="relative w-full" ref="containerRef">
    <div 
      @click="toggle"
      class="w-full px-4 py-3 bg-muted rounded-xl text-foreground font-medium flex items-center justify-between cursor-pointer transition-shadow hover:bg-muted/80 border"
      :class="[isOpen ? 'ring-2 ring-[#FFBA49] border-transparent' : 'border-transparent']"
    >
      <div class="flex items-center gap-3 overflow-hidden">
        <template v-if="selectedOption">
          <component v-if="selectedOption.icon" :is="selectedOption.icon" class="w-5 h-5 shrink-0 text-muted-foreground" />
          <span v-else-if="selectedOption.emoji" class="shrink-0">{{ selectedOption.emoji }}</span>
          <span class="truncate">{{ selectedOption.label }}</span>
        </template>
        <span v-else class="text-muted-foreground">{{ placeholder }}</span>
      </div>
      <ChevronDown class="w-5 h-5 text-muted-foreground transition-transform duration-200" :class="{ 'rotate-180': isOpen }" />
    </div>

    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div 
        v-if="isOpen"
        :class="[
          'absolute z-50 w-full bg-white rounded-xl shadow-xl border border-[rgba(0,0,0,0.08)] overflow-hidden max-h-64 overflow-y-auto',
          placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
        ]"
      >
        <ul class="flex flex-col py-1">
          <li 
            v-for="option in options" 
            :key="String(option.value)"
            @click="selectOption(option)"
            class="flex items-center gap-3 px-4 py-3 hover:bg-muted cursor-pointer transition-colors"
            :class="{ 'bg-amber-50/50': modelValue === option.value }"
          >
            <component v-if="option.icon" :is="option.icon" class="w-5 h-5 shrink-0" :class="modelValue === option.value ? 'text-[#FFBA49]' : 'text-muted-foreground'" />
            <span v-else-if="option.emoji" class="shrink-0 text-lg">{{ option.emoji }}</span>
            
            <div class="flex flex-col min-w-0 flex-1">
              <span class="font-bold truncate text-sm" :class="modelValue === option.value ? 'text-amber-950' : 'text-primary'">{{ option.label }}</span>
              <span v-if="option.description" class="text-xs truncate" :class="modelValue === option.value ? 'text-amber-700/70' : 'text-muted-foreground'">{{ option.description }}</span>
            </div>
            
            <Check v-if="modelValue === option.value" class="w-5 h-5 text-[#FFBA49] shrink-0" />
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ChevronDown, Check } from '@lucide/vue';

export interface SelectOption {
  value: any;
  label: string;
  description?: string;
  icon?: any;
  emoji?: string;
}

const props = defineProps<{
  modelValue: any;
  options: SelectOption[];
  placeholder?: string;
  placement?: 'top' | 'bottom';
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
  (e: 'change', value: any): void;
}>();

const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);

const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === props.modelValue) || null;
});

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (option: SelectOption) => {
  emit('update:modelValue', option.value);
  emit('change', option.value);
  isOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>
