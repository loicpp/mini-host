<template>
  <div>
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
      :class="isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'"
      @click="$emit('close')"
    ></div>

    <!-- Drawer -->
    <div 
      class="fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col"
      :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
        <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Settings class="w-5 h-5 text-gray-500" />
          {{ $t('home.game_settings') }}
        </h2>
        <button @click="$emit('close')" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
        
        <!-- Game Mode -->
        <div v-if="isGameOver" class="flex flex-col gap-2">
          <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{{ $t('create_game.input_mode') }}</h4>
          <div class="flex gap-2">
            <button
              class="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all"
              :class="localSettings.mode === 'buzzer' ? 'bg-[#FFBA49] border-[#FFBA49] text-white shadow-md' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'"
              @click="localSettings.mode = 'buzzer'"
            >
              <Zap class="w-4 h-4 mb-1" />
              <span class="text-[10px] font-bold">{{ $t('create_game.mode_buzzer_title') }}</span>
            </button>
            <button
              class="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all"
              :class="localSettings.mode === 'text' ? 'bg-[#FFBA49] border-[#FFBA49] text-white shadow-md' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'"
              @click="localSettings.mode = 'text'"
            >
              <Keyboard class="w-4 h-4 mb-1" />
              <span class="text-[10px] font-bold">{{ $t('create_game.mode_text_title') }}</span>
            </button>
          </div>
        </div>

        <!-- Presets -->
        <div class="flex flex-col gap-2">
          <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{{ $t('create_game.presets') }}</h4>
          <div class="flex gap-2">
            <button
              class="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all"
              :class="localSettings.preset === 'normal' ? 'bg-[#FFBA49] border-[#FFBA49] text-white shadow-md' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'"
              @click="applyPreset('normal', 0, 15, 15, true, false)"
            >
              <Clock class="w-4 h-4 mb-1" />
              <span class="text-[10px] font-bold">{{ $t('create_game.quick_mode_normal') }}</span>
            </button>
            <button
              class="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all"
              :class="localSettings.preset === 'hard' ? 'bg-[#FFBA49] border-[#FFBA49] text-white shadow-md' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'"
              @click="applyPreset('hard', 0, 5, 10, false, true)"
            >
              <Zap class="w-4 h-4 mb-1" />
              <span class="text-[10px] font-bold">{{ $t('create_game.quick_mode_hard') }}</span>
            </button>
            <button
              class="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all"
              :class="localSettings.preset === 'fun' ? 'bg-[#FFBA49] border-[#FFBA49] text-white shadow-md' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'"
              @click="applyPreset('fun', 0, 30, 30, true, false)"
            >
              <Smile class="w-4 h-4 mb-1" />
              <span class="text-[10px] font-bold">{{ $t('create_game.quick_mode_fun') }}</span>
            </button>
            <button
              class="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all"
              :class="localSettings.preset === 'peaceful' ? 'bg-[#FFBA49] border-[#FFBA49] text-white shadow-md' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'"
              @click="applyPreset('peaceful', 10, 30, 30, true, false)"
            >
              <Leaf class="w-4 h-4 mb-1" />
              <span class="text-[10px] font-bold">{{ $t('create_game.quick_mode_peaceful') }}</span>
            </button>
          </div>
        </div>

        <!-- Times -->
        <div class="flex flex-col gap-6">
          <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Temps (en secondes)</h4>
          
          <!-- Block duration -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Clock class="w-4 h-4 text-gray-400 shrink-0" />
                {{ $t('create_game.block_duration') }}
              </span>
              <div class="flex items-center justify-end w-16 shrink-0 gap-1">
                <input type="number" v-model.number="localSettings.blockDuration" min="0" max="30" @blur="localSettings.blockDuration = Math.min(Math.max(localSettings.blockDuration || 0, 0), 30)" class="w-10 text-right bg-transparent border-b-2 border-transparent hover:border-[#FFBA49]/50 focus:border-[#FFBA49] outline-none font-bold text-gray-800 text-sm p-0 m-0 transition-colors no-spinners" />
                <span class="text-sm font-bold text-gray-800">s</span>
              </div>
            </div>
            <Slider v-model="localSettings.blockDuration" :max="30" :stepValues="[0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 30]" :allowShiftOverride="true" class="w-full" />
          </div>

          <!-- Music duration -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Music class="w-4 h-4 text-gray-400 shrink-0" />
                {{ $t('create_game.music_duration') }}
              </span>
              <div class="flex items-center justify-end w-16 shrink-0 gap-1">
                <input type="number" v-model.number="localSettings.musicDuration" min="1" max="100" @blur="localSettings.musicDuration = Math.min(Math.max(localSettings.musicDuration || 1, 1), 100)" class="w-10 text-right bg-transparent border-b-2 border-transparent hover:border-[#FFBA49]/50 focus:border-[#FFBA49] outline-none font-bold text-gray-800 text-sm p-0 m-0 transition-colors no-spinners" />
                <span class="text-sm font-bold text-gray-800">s</span>
              </div>
            </div>
            <Slider v-model="localSettings.musicDuration" :stepValues="[1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]" :allowShiftOverride="true" class="w-full" />
          </div>

          <!-- Thinking time -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Hourglass class="w-4 h-4 text-gray-400 shrink-0" />
                {{ $t('create_game.total_duration') }}
              </span>
              <div class="flex items-center justify-end w-16 shrink-0 gap-1">
                <input type="number" v-model.number="localSettings.duration" min="1" max="100" @blur="localSettings.duration = Math.min(Math.max(localSettings.duration || 1, 1), 100)" class="w-10 text-right bg-transparent border-b-2 border-transparent hover:border-[#FFBA49]/50 focus:border-[#FFBA49] outline-none font-bold text-gray-800 text-sm p-0 m-0 transition-colors no-spinners" />
                <span class="text-sm font-bold text-gray-800">s</span>
              </div>
            </div>
            <Slider v-model="localSettings.duration" :stepValues="[1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]" :allowShiftOverride="true" class="w-full" />
          </div>
        </div>

        <!-- Additional options -->
        <div class="flex flex-col gap-1 mt-2">
          <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{{ $t('create_game.options_title') }}</h4>
          <div 
            v-if="localSettings.mode === 'text'"
            class="flex items-center justify-between p-3 rounded-xl transition-all hover:bg-gray-50 cursor-pointer" 
            @click="localSettings.allowSuggestions = !localSettings.allowSuggestions"
          >
            <div class="flex items-center gap-2">
              <Lightbulb class="w-4 h-4 text-gray-400" />
              <span class="text-sm font-bold text-gray-800">{{ $t('create_game.allow_suggestions') }}</span>
            </div>
            <div 
              :class="['w-12 h-6 rounded-full transition-colors duration-300 flex items-center p-0.5 shrink-0', localSettings.allowSuggestions ? 'bg-[#FFBA49]' : 'bg-gray-200']"
            >
              <div :class="['w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300', localSettings.allowSuggestions ? 'translate-x-6' : 'translate-x-0']"></div>
            </div>
          </div>
          <div 
            class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            @click="localSettings.penaltyOnWrongAnswer = !localSettings.penaltyOnWrongAnswer"
          >
            <div class="flex items-center gap-2">
              <AlertTriangle class="w-4 h-4 text-gray-400" />
              <span class="text-sm font-bold text-gray-800">{{ $t('create_game.auto_correction_penalty') }}</span>
            </div>
            <div 
              :class="['w-12 h-6 rounded-full transition-colors duration-300 flex items-center p-0.5 shrink-0', localSettings.penaltyOnWrongAnswer ? 'bg-[#FFBA49]' : 'bg-gray-200']"
            >
              <div :class="['w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300', localSettings.penaltyOnWrongAnswer ? 'translate-x-6' : 'translate-x-0']"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-100 shrink-0 bg-gray-50 flex gap-3">
        <Btn variant="gray" class="flex-1 font-bold" @click="$emit('close')">Annuler</Btn>
        <Btn variant="primary" class="flex-1 font-bold" @click="handleSave">Sauvegarder</Btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { X, Settings, Clock, Zap, Smile, Leaf, Music, Hourglass, Lightbulb, AlertTriangle, Keyboard } from '@lucide/vue';
import Btn from '../ui/Btn.vue';
import Slider from '../ui/Slider.vue';

const props = defineProps<{
  isOpen: boolean;
  gameSettings: any;
  isGameOver?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save-settings', settings: any): void;
}>();

const localSettings = ref<any>({});

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.gameSettings) {
    localSettings.value = JSON.parse(JSON.stringify(props.gameSettings));
  }
});

// Constraints Logic
watch(() => localSettings.value.musicDuration, (newVal) => {
  if (typeof newVal === 'number') {
    const effectiveVal = Math.min(Math.max(newVal, 1), 100);
    if (newVal !== effectiveVal) {
      localSettings.value.musicDuration = effectiveVal;
    }
    if (localSettings.value.duration < effectiveVal) {
      localSettings.value.duration = effectiveVal;
    }
    if (localSettings.value.blockDuration > effectiveVal) {
      localSettings.value.blockDuration = effectiveVal;
    }
  }
});

watch(() => localSettings.value.duration, (newVal) => {
  if (typeof newVal === 'number') {
    const effectiveVal = Math.min(Math.max(newVal, 1), 100);
    if (newVal !== effectiveVal) {
      localSettings.value.duration = effectiveVal;
    }
    if (localSettings.value.musicDuration > effectiveVal) {
      localSettings.value.musicDuration = effectiveVal;
    }
  }
});

watch(() => localSettings.value.blockDuration, (newVal) => {
  if (typeof newVal === 'number') {
    const effectiveVal = Math.min(Math.max(newVal, 0), 30);
    if (newVal !== effectiveVal) {
      localSettings.value.blockDuration = effectiveVal;
    }
    if (localSettings.value.musicDuration < effectiveVal) {
      localSettings.value.musicDuration = effectiveVal;
    }
  }
});

const applyPreset = (presetName: string, block: number, music: number, total: number, suggestions: boolean, penalty: boolean) => {
  localSettings.value.preset = presetName;
  localSettings.value.blockDuration = block;
  localSettings.value.musicDuration = music;
  localSettings.value.duration = total;
  localSettings.value.penaltyOnWrongAnswer = penalty;
  
  if (localSettings.value.mode === 'text') {
    localSettings.value.allowSuggestions = suggestions;
  } else {
    localSettings.value.allowSuggestions = false;
  }
};

const checkPreset = (b: number, m: number, t: number, s: boolean, p: boolean) => {
  const expectedSuggestions = localSettings.value.mode === 'buzzer' ? false : s;
  return localSettings.value.blockDuration === b &&
         localSettings.value.musicDuration === m &&
         localSettings.value.duration === t &&
         localSettings.value.allowSuggestions === expectedSuggestions &&
         localSettings.value.penaltyOnWrongAnswer === p;
};

// Deep watch on settings to recalculate preset when customized
watch(
  () => [
    localSettings.value.blockDuration,
    localSettings.value.musicDuration,
    localSettings.value.duration,
    localSettings.value.allowSuggestions,
    localSettings.value.penaltyOnWrongAnswer
  ],
  () => {
    if (checkPreset(0, 15, 15, true, false)) localSettings.value.preset = 'normal';
    else if (checkPreset(0, 5, 10, false, true)) localSettings.value.preset = 'hard';
    else if (checkPreset(0, 30, 30, true, false)) localSettings.value.preset = 'fun';
    else if (checkPreset(10, 30, 30, true, false)) localSettings.value.preset = 'peaceful';
    else localSettings.value.preset = 'custom';
  },
  { deep: true }
);

const handleSave = () => {
  // Ensure types are numbers
  localSettings.value.blockDuration = Number(localSettings.value.blockDuration);
  localSettings.value.musicDuration = Number(localSettings.value.musicDuration);
  localSettings.value.duration = Number(localSettings.value.duration);
  
  emit('save-settings', localSettings.value);
};
</script>

<style scoped>
input[type="number"].no-spinners::-webkit-inner-spin-button,
input[type="number"].no-spinners::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"].no-spinners {
  -moz-appearance: textfield;
}
</style>
