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
          <div class="flex items-center justify-between mb-1">
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('create_game.presets') }}</h4>
            <button @click="showPresetModal = true" class="w-5 h-5 rounded-md flex items-center justify-center text-gray-400 hover:text-[#FFBA49] hover:bg-[#FFF8E7] transition-colors">
              <Plus class="w-4 h-4" />
            </button>
          </div>
          <div class="grid grid-cols-4 gap-2">
            <div 
              v-for="preset in allPresets" :key="preset.name"
              class="relative group h-full"
            >
              <button
                class="w-full h-full flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all"
                :class="localSettings.preset === preset.name ? 'bg-[#FFBA49] border-[#FFBA49] text-white shadow-md' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'"
                @click="applyPreset(preset)"
              >
                <component :is="IconMap[preset.icon || 'Star'] || Star" class="w-4 h-4 mb-1" />
                <span class="text-[10px] font-bold truncate w-full text-center px-1">{{ preset.isCustom ? preset.name : $t(preset.titleKey!) }}</span>
              </button>
              <button v-if="preset.isCustom"
                @click.stop="deleteCustomPreset(preset.originalIndex!)"
                class="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-200"
                title="Supprimer"
              >
                <X class="w-3 h-3" />
              </button>
            </div>
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
            v-for="opt in BLIND_TEST_ADDITIONAL_OPTIONS"
            :key="opt.key"
            v-show="!opt.requiredMode || localSettings.mode === opt.requiredMode"
            class="flex items-center justify-between p-3 rounded-xl transition-all hover:bg-gray-50 cursor-pointer" 
            @click="localSettings[opt.key as keyof typeof localSettings] = !localSettings[opt.key as keyof typeof localSettings]"
          >
            <div class="flex items-center gap-2">
              <component :is="opt.icon" class="w-4 h-4 text-gray-400" />
              <span class="text-sm font-bold text-gray-800">{{ $t(opt.titleKey) }}</span>
            </div>
            <div 
              :class="['w-12 h-6 rounded-full transition-colors duration-300 flex items-center p-0.5 shrink-0', localSettings[opt.key as keyof typeof localSettings] ? 'bg-[#FFBA49]' : 'bg-gray-200']"
            >
              <div :class="['w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300', localSettings[opt.key as keyof typeof localSettings] ? 'translate-x-6' : 'translate-x-0']"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-100 shrink-0 bg-gray-50 flex gap-3">
        <Btn variant="gray" class="flex-1 font-bold" @click="$emit('close')">{{ $t('create_game.undo') }}</Btn>
        <Btn variant="primary" class="flex-1 font-bold" @click="handleSave">{{ $t('create_game.preset_save_btn') }}</Btn>
      </div>
    </div>
    
    <PresetSaveModal 
      :show="showPresetModal" 
      :custom-presets="customPresets"
      :current-settings="localSettings"
      @close="showPresetModal = false"
      @saved="onPresetsSaved"
    />
    
    <!-- Toast Undo Delete -->
    <div 
      class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-4 z-50 transition-all duration-300 transform"
      :class="toastVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'"
    >
      <span class="text-sm font-medium">{{ $t('create_game.preset_deleted') }}</span>
      <button 
        @click="undoDelete"
        class="text-[#FFBA49] text-sm font-bold hover:text-white transition-colors uppercase tracking-wide"
      >
        {{ $t('create_game.undo') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { X, Settings, Clock, Zap, Smile, Leaf, Music, Hourglass, Plus, Star, Bookmark, Heart, Coffee, Flame, Shield, Ghost, Gamepad2, Trophy, Target, Rocket, Keyboard } from '@lucide/vue';
import Btn from '../ui/Btn.vue';
import Slider from '../ui/Slider.vue';
import PresetSaveModal from '../games/blind-test/PresetSaveModal.vue';
import { BLIND_TEST_ADDITIONAL_OPTIONS, getExpectedValue } from '../../core/domain/games/blind-test/types/blindTestOptions';
import { DEFAULT_PRESETS } from '../../core/domain/games/blind-test/types/blindTestDefaultPresets';
import { usePresets } from '../../core/domain/setup/presets/usePresets';

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
const showPresetModal = ref(false);
const customPresets = ref<any[]>([]);

const allPresets = computed(() => {
  return [
    ...DEFAULT_PRESETS.map(p => ({
      ...p,
      isCustom: false,
      originalIndex: -1
    })),
    ...customPresets.value.map((p, index) => ({
      ...p,
      isCustom: true,
      originalIndex: index
    }))
  ];
});

const IconMap: Record<string, any> = { Clock, Zap, Smile, Leaf, Star, Bookmark, Heart, Coffee, Flame, Shield, Ghost, Gamepad2, Trophy, Target, Rocket };

const toastVisible = ref(false);
const deletedPreset = ref<{ index: number, data: any } | null>(null);
let toastTimeout: ReturnType<typeof setTimeout> | null = null;

const { loadPresets: loadPresetsFromApi, savePresets: savePresetsToApi } = usePresets();

const loadPresets = async () => {
  const presets = await loadPresetsFromApi();
  if (presets) {
    customPresets.value = presets;
  }
};

const savePresetsToBackend = async (presets: any[]) => {
  await savePresetsToApi(presets);
};

const deleteCustomPreset = async (index: number) => {
  const data = customPresets.value[index];
  
  deletedPreset.value = {
    index,
    data
  };
  
  customPresets.value.splice(index, 1);
  await savePresetsToBackend(customPresets.value);
  
  toastVisible.value = true;
  
  if (toastTimeout) clearTimeout(toastTimeout);
  
  toastTimeout = setTimeout(() => {
    toastVisible.value = false;
    deletedPreset.value = null;
  }, 3000);
};

const undoDelete = async () => {
  if (deletedPreset.value) {
    customPresets.value.splice(deletedPreset.value.index, 0, deletedPreset.value.data);
    await savePresetsToBackend(customPresets.value);
    
    toastVisible.value = false;
    deletedPreset.value = null;
    if (toastTimeout) clearTimeout(toastTimeout);
  }
};

const onPresetsSaved = (newPresets: any[]) => {
  customPresets.value = newPresets;
};

onMounted(() => {
  loadPresets();
});

watch(() => props.gameSettings, (newVal) => {
  if (newVal) {
    localSettings.value = JSON.parse(JSON.stringify(newVal));
  }
}, { immediate: true, deep: true });

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

watch(() => localSettings.value.mode, (newMode) => {
  if (newMode) {
    BLIND_TEST_ADDITIONAL_OPTIONS.forEach(opt => {
      localSettings.value[opt.key] = getExpectedValue(opt.key, localSettings.value[opt.key], newMode);
    });
  }
});

const applyPreset = (preset: any) => {
  localSettings.value.preset = preset.name;
  localSettings.value.blockDuration = preset.blockDuration;
  localSettings.value.musicDuration = preset.musicDuration;
  localSettings.value.duration = preset.duration;
  
  BLIND_TEST_ADDITIONAL_OPTIONS.forEach(opt => {
    localSettings.value[opt.key] = getExpectedValue(opt.key, preset[opt.key] ?? false, localSettings.value.mode);
  });
};

const checkPreset = (preset: any) => {
  if (localSettings.value.blockDuration !== preset.blockDuration) return false;
  if (localSettings.value.musicDuration !== preset.musicDuration) return false;
  if (localSettings.value.duration !== preset.duration) return false;
  
  for (const opt of BLIND_TEST_ADDITIONAL_OPTIONS) {
    if (localSettings.value[opt.key] !== getExpectedValue(opt.key, preset[opt.key] ?? false, localSettings.value.mode)) {
      return false;
    }
  }
  return true;
};

// Deep watch on settings to recalculate preset when customized
watch(
  () => {
    const deps = [
      localSettings.value.blockDuration,
      localSettings.value.musicDuration,
      localSettings.value.duration
    ];
    BLIND_TEST_ADDITIONAL_OPTIONS.forEach(opt => deps.push(localSettings.value[opt.key]));
    return deps;
  },
  () => {
    for (const p of allPresets.value) {
      if (checkPreset(p)) {
        localSettings.value.preset = p.name;
        localSettings.value.presetIcon = p.icon || 'Star';
        return;
      }
    }
    
    localSettings.value.preset = 'custom';
    localSettings.value.presetIcon = 'Settings2';
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
