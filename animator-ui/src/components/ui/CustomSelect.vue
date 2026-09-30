<template>
  <div class="relative w-full" ref="containerRef">
    <div 
      @click="toggle"
      class="w-full px-4 py-3 bg-muted rounded-xl text-foreground font-medium flex items-center justify-between cursor-pointer transition-shadow hover:bg-muted/80 border"
      :class="[isOpen ? 'ring-2 ring-[#FFBA49] border-transparent' : 'border-transparent']"
    >
      <div class="flex items-center gap-3 overflow-hidden">
        <!-- Multiple selection display -->
        <template v-if="multiple">
          <template v-if="selectedOptions.length > 0">
            <template v-if="selectedOptions.length === 1">
              <component v-if="selectedOptions[0].icon" :is="selectedOptions[0].icon" class="w-5 h-5 shrink-0 text-muted-foreground" />
              <span v-else-if="selectedOptions[0].emoji" class="shrink-0">{{ selectedOptions[0].emoji }}</span>
              <span class="truncate">{{ selectedOptions[0].label }}</span>
            </template>
            <template v-else>
              <span class="px-2 py-0.5 bg-[#FFBA49] text-white text-xs font-bold rounded-full shrink-0">
                {{ selectedOptions.length }}
              </span>
              <span class="truncate text-sm font-semibold">
                {{ selectedLabelsText }}
              </span>
            </template>
          </template>
          <span v-else class="text-muted-foreground">{{ placeholder }}</span>
        </template>
        <!-- Single selection display -->
        <template v-else>
          <template v-if="selectedOption">
            <component v-if="selectedOption.icon" :is="selectedOption.icon" class="w-5 h-5 shrink-0 text-muted-foreground" />
            <span v-else-if="selectedOption.emoji" class="shrink-0">{{ selectedOption.emoji }}</span>
            <span class="truncate">{{ selectedOption.label }}</span>
          </template>
          <span v-else class="text-muted-foreground">{{ placeholder }}</span>
        </template>
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
        <!-- Select All / Deselect All in multiple mode -->
        <div 
          v-if="multiple && options.length > 1" 
          class="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50/70 text-xs font-semibold text-gray-500"
        >
          <button 
            type="button" 
            @click.stop="selectAll" 
            class="hover:text-[#FFBA49] transition-colors cursor-pointer"
          >
            {{ $t('create_game.select_all_playlists', 'Tout sélectionner') }}
          </button>
          <button 
            type="button" 
            @click.stop="deselectAll" 
            class="hover:text-red-500 transition-colors cursor-pointer"
          >
            {{ $t('create_game.deselect_all_playlists', 'Tout désélectionner') }}
          </button>
        </div>

        <ul class="flex flex-col py-1">
          <li 
            v-for="option in options" 
            :key="String(option.value)"
            @click="selectOption(option)"
            class="flex items-center gap-3 px-4 py-3 hover:bg-muted cursor-pointer transition-colors"
            :class="{ 'bg-amber-50/50': isOptionSelected(option) }"
          >
            <!-- Checkbox for multiple selection -->
            <div 
              v-if="multiple"
              class="w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors"
              :class="isOptionSelected(option) ? 'bg-[#FFBA49] border-[#FFBA49] text-white shadow-sm' : 'border-gray-300 bg-white'"
            >
              <Check v-if="isOptionSelected(option)" class="w-3.5 h-3.5 stroke-[3]" />
            </div>

            <component v-if="option.icon" :is="option.icon" class="w-5 h-5 shrink-0" :class="isOptionSelected(option) ? 'text-[#FFBA49]' : 'text-muted-foreground'" />
            <span v-else-if="option.emoji" class="shrink-0 text-lg">{{ option.emoji }}</span>
            
            <div class="flex flex-col min-w-0 flex-1">
              <span class="font-bold truncate text-sm" :class="isOptionSelected(option) ? 'text-amber-950' : 'text-primary'">{{ option.label }}</span>
              <span v-if="option.description" class="text-xs truncate" :class="isOptionSelected(option) ? 'text-amber-700/70' : 'text-muted-foreground'">{{ option.description }}</span>
            </div>
            
            <Check v-if="!multiple && isOptionSelected(option)" class="w-5 h-5 text-[#FFBA49] shrink-0" />
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

const props = withDefaults(defineProps<{
  modelValue: any;
  options: SelectOption[];
  placeholder?: string;
  placement?: 'top' | 'bottom';
  multiple?: boolean;
}>(), {
  placement: 'bottom',
  multiple: false
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
  (e: 'change', value: any): void;
}>();

const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);

const isOptionSelected = (option: SelectOption) => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(option.value);
  }
  return props.modelValue === option.value;
};

const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === props.modelValue) || null;
});

const selectedOptions = computed(() => {
  if (!props.multiple || !Array.isArray(props.modelValue)) return [];
  return props.options.filter(opt => props.modelValue.includes(opt.value));
});

const selectedLabelsText = computed(() => {
  return selectedOptions.value.map(opt => opt.label).join(', ');
});

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (option: SelectOption) => {
  if (props.multiple) {
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const index = current.indexOf(option.value);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(option.value);
    }
    emit('update:modelValue', current);
    emit('change', current);
  } else {
    emit('update:modelValue', option.value);
    emit('change', option.value);
    isOpen.value = false;
  }
};

const selectAll = () => {
  const allValues = props.options.map(o => o.value);
  emit('update:modelValue', allValues);
  emit('change', allValues);
};

const deselectAll = () => {
  emit('update:modelValue', []);
  emit('change', []);
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
