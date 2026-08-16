<template>
  <div class="flex flex-col items-center justify-start min-h-full w-full relative p-4 bg-[#F8F9FA]">
    <!-- Back Button -->
    <BackButton @click="$emit('back')" class="absolute top-4 left-4">
      {{ $t('create_game.back') }}
    </BackButton>

    <!-- Main Card -->
    <div id="blind-test-main-card" class="bg-white p-6 rounded-3xl border border-[rgba(0,0,0,0.06)] shadow-sm w-full max-w-2xl flex flex-col gap-6 mt-4">
      
      <div class="flex flex-col items-center">
        <h2 class="text-2xl font-black text-primary mb-1">{{ $t('create_game.title') }}</h2>
        <p class="text-muted-foreground text-center text-sm">{{ $t('create_game.subtitle') }}</p>
      </div>
      
      <!-- Step 1: Game mode -->
      <StepSection 
        id="input-settings"
        number="1" 
        :title="$t('create_game.step1_title')" 
        :description="$t('create_game.step1_desc')"
      >
        <div class="flex flex-col sm:flex-row gap-4">
          <OptionCard 
            :title="$t('create_game.mode_buzzer_title')" 
            :description="$t('create_game.mode_buzzer_desc')" 
            layout="horizontal"
            :selected="settings.mode === 'buzzer'"
            @click="settings.mode = 'buzzer'"
          >
            <template #icon>
              <Bell class="w-5 h-5" />
            </template>
          </OptionCard>
          
          <OptionCard 
            id="mode-text-card"
            :title="$t('create_game.mode_text_title')" 
            :description="$t('create_game.mode_text_desc')" 
            layout="horizontal"
            :selected="settings.mode === 'text'"
            @click="settings.mode = 'text'"
          >
            <template #icon>
              <Type class="w-5 h-5" />
            </template>
          </OptionCard>
        </div>
      </StepSection>

      <!-- Step 2: Quick game mode -->
      <StepSection
       id="game-settings"
        number="2" 
        :title="$t('create_game.step2_title')" 
        :description="$t('create_game.step2_desc')"
      >
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div v-for="preset in allPresets" :key="preset.name" class="relative group h-full">
            <OptionCard 
              class="h-full"
              :id="preset.name === 'normal' ? 'preset-normal-card' : undefined"
              :title="preset.isCustom ? preset.name : $t(preset.titleKey!)" 
              :description="preset.isCustom ? '' : $t(preset.descKey!)" 
              layout="vertical"
              :selected="isPresetSelected(preset)"
              @click="applyPreset(preset)"
            >
              <template #icon>
                <component :is="IconMap[preset.icon || 'Star'] || Star" class="w-4 h-4" />
              </template>
            </OptionCard>
            <button v-if="preset.isCustom"
              @click.stop="deleteCustomPreset(preset.originalIndex!)"
              class="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-200"
              title="Supprimer"
            >
              <X class="w-3 h-3" />
            </button>
          </div>
        </div>

        <!-- Summary Bar and Adjustments -->
          <!-- Summary Bar -->
        <div 
          id="adjust-summary-bar"
          class="bg-[#F8F9FA] rounded-xl flex items-center justify-between p-3 px-5 text-sm cursor-pointer hover:bg-gray-100 transition-colors group mt-6"
          @click="showAdjust = !showAdjust">
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-2 text-gray-500">
              <Clock class="w-4 h-4 text-[#FFBA49]" />
              <span>{{ $t('create_game.block_short') }} <strong class="text-gray-800 inline-block w-8 text-right">{{ settings.blockDuration }}s</strong></span>
            </div>
            <div class="flex items-center gap-2 text-gray-500">
              <Music class="w-4 h-4 text-[#FFBA49]" />
              <span>{{ $t('create_game.music_short') }} <strong class="text-gray-800 inline-block w-9 text-right">{{ settings.musicDuration }}s</strong></span>
            </div>
            <div class="flex items-center gap-2 text-gray-500">
              <Hourglass class="w-4 h-4 text-[#FFBA49]" />
              <span>{{ $t('create_game.thinking_short') }} <strong class="text-gray-800 inline-block w-9 text-right">{{ settings.duration }}s</strong></span>
            </div>
          </div>
          <div class="flex items-center gap-1 font-medium transition-colors text-gray-500 group-hover:text-gray-800">
            {{ $t('create_game.adjust') }}
            <ChevronDown class="w-4 h-4 transition-transform duration-300" :class="{'rotate-180': showAdjust}" />
          </div>
        </div>

        <!-- Adjust Panel (Sliders & Options) -->
        <div v-show="showAdjust" class="mt-6 flex flex-col gap-8 px-2">
          <!-- Sliders -->
          <div id="sliders-panel" class="flex flex-col gap-6">
            <!-- Initial block -->
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700 w-56 shrink-0 flex items-center gap-2">
                <Clock class="w-4 h-4 text-gray-400 shrink-0" />
                {{ $t('create_game.block_duration') }}
                <div class="group relative flex items-center ml-1">
                  <Info class="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-help" />
                  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center pointer-events-none font-normal shadow-xl">
                    {{ $t('create_game.block_duration_tooltip') }}
                    <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </span>
              <div class="flex-1 px-4">
                <Slider v-model="settings.blockDuration" :max="30" :stepValues="[0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 30]" :allowShiftOverride="true" class="w-full" />
              </div>
              <div class="flex items-center justify-end w-16 shrink-0 gap-1">
                <input type="number" v-model.number="settings.blockDuration" min="0" max="30" @blur="settings.blockDuration = Math.min(Math.max(settings.blockDuration || 0, 0), 30)" class="w-10 text-right bg-transparent border-b-2 border-transparent hover:border-[#FFBA49]/50 focus:border-[#FFBA49] outline-none font-bold text-gray-800 text-sm p-0 m-0 transition-colors no-spinners" />
                <span class="text-sm font-bold text-gray-800">s</span>
              </div>
            </div>
            <!-- Music duration -->
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700 w-56 shrink-0 flex items-center gap-2">
                <Music class="w-4 h-4 text-gray-400 shrink-0" />
                {{ $t('create_game.music_duration') }}
                <div class="group relative flex items-center ml-1">
                  <Info class="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-help" />
                  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center pointer-events-none font-normal shadow-xl">
                    {{ $t('create_game.music_duration_tooltip') }}
                    <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </span>
              <div class="flex-1 px-4">
                <Slider v-model="settings.musicDuration" :stepValues="[1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]" :allowShiftOverride="true" class="w-full" />
              </div>
              <div class="flex items-center justify-end w-16 shrink-0 gap-1">
                <input type="number" v-model.number="settings.musicDuration" min="1" max="100" @blur="settings.musicDuration = Math.min(Math.max(settings.musicDuration || 1, 1), 100)" class="w-10 text-right bg-transparent border-b-2 border-transparent hover:border-[#FFBA49]/50 focus:border-[#FFBA49] outline-none font-bold text-gray-800 text-sm p-0 m-0 transition-colors no-spinners" />
                <span class="text-sm font-bold text-gray-800">s</span>
              </div>
            </div>
            <!-- Thinking time -->
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700 w-56 shrink-0 flex items-center gap-2">
                <Hourglass class="w-4 h-4 text-gray-400 shrink-0" />
                {{ $t('create_game.total_duration') }}
                <div class="group relative flex items-center ml-1">
                  <Info class="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-help" />
                  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center pointer-events-none font-normal shadow-xl">
                    {{ $t('create_game.total_duration_tooltip') }}
                    <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </span>
              <div class="flex-1 px-4">
                <Slider v-model="settings.duration" :stepValues="[1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]" :allowShiftOverride="true" class="w-full" />
              </div>
              <div class="flex items-center justify-end w-16 shrink-0 gap-1">
                <input type="number" v-model.number="settings.duration" min="1" max="100" @blur="settings.duration = Math.min(Math.max(settings.duration || 1, 1), 100)" class="w-10 text-right bg-transparent border-b-2 border-transparent hover:border-[#FFBA49]/50 focus:border-[#FFBA49] outline-none font-bold text-gray-800 text-sm p-0 m-0 transition-colors no-spinners" />
                <span class="text-sm font-bold text-gray-800">s</span>
              </div>
            </div>
          </div>

          <!-- Additional options -->
          <div id="additional-options" class="flex flex-col gap-1 mt-2">
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{{ $t('create_game.options_title') }}</h4>
            <div 
              v-for="opt in BLIND_TEST_ADDITIONAL_OPTIONS"
              :key="opt.key"
              v-show="!opt.requiredMode || settings.mode === opt.requiredMode"
              class="flex items-center justify-between p-3 rounded-xl transition-all hover:bg-gray-50 cursor-pointer" 
              @click="toggleOption(opt.key)"
            >
              <div class="flex items-center gap-2">
                <component :is="opt.icon" class="w-4 h-4 text-gray-400" />
                <span class="text-sm font-bold text-gray-800">{{ $t(opt.titleKey) }}</span>
                <div class="group relative flex items-center" v-if="opt.descKey">
                  <Info class="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-help" />
                  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center pointer-events-none font-normal shadow-xl">
                    {{ $t(opt.descKey) }}
                    <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
              <div 
                :class="['w-12 h-6 rounded-full transition-colors duration-300 flex items-center p-0.5 shrink-0', settings[opt.key as keyof typeof settings] ? 'bg-[#FFBA49]' : 'bg-gray-200']"
              >
                <div :class="['w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300', settings[opt.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-0']"></div>
              </div>
            </div>
          </div>

          <!-- Save Preset action -->
          <div class="mt-2 pt-4 border-t border-gray-100 flex justify-end">
            <button 
              @click="openPresetModal"
              class="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#FFBA49] transition-colors group"
            >
              <Save class="w-4 h-4 group-hover:scale-110 transition-transform" />
              {{ $t('create_game.save_preset') || 'Sauvegarder ce preset' }}
            </button>
          </div>
        </div>
      </StepSection>

      <!-- Step 3: Starting playlist -->
      <StepSection 
        id="playlist-settings"
        number="3" 
        :title="$t('create_game.step3_title')" 
        :description="$t('create_game.step3_desc')"
      >
        <div v-if="playlists.length > 0" class="w-full">
          <CustomSelect 
            v-model="settings.playlistId"
            :options="playlistOptions"
            :placeholder="$t('create_game.playlist_placeholder')"
            placement="top"
            class="bg-[#F8F9FA]"
          />
        </div>
        <div v-else class="bg-amber-50 p-4 rounded-xl border border-amber-100 flex flex-col gap-3">
          <p class="text-amber-800 text-sm font-medium text-center">{{ $t('create_game.no_playlist_available') }}</p>
          <Btn variant="dark" @click="$emit('configure-playlists')">{{ $t('create_game.create_first_playlist') }}</Btn>
        </div>
      </StepSection>
    </div>

    <!-- Create Button -->
    <div class="w-full max-w-2xl mt-4 pb-4">
      <Btn id="start-btn" variant="primary" size="lg" className="w-full font-bold text-lg h-14 rounded-2xl shadow-md flex items-center justify-center gap-2" @click="startGame" :disabled="playlists.length === 0">
        <Play class="w-5 h-5 fill-current" />
        {{ $t('create_game.start_button') }}
      </Btn>
    </div>

    <!-- Save Preset Modal -->
    <PresetSaveModal 
      :show="showPresetModal" 
      :custom-presets="customPresets"
      :current-settings="settings"
      @close="showPresetModal = false"
      @saved="onPresetsSaved"
    />
    <!-- Toast Undo Delete -->
    <div 
      class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-4 z-50 transition-all duration-300 transform"
      :class="toastVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'"
    >
      <span class="text-sm font-medium">{{ $t('create_game.preset_deleted') || 'Preset supprimé' }}</span>
      <button 
        @click="undoDelete"
        class="text-[#FFBA49] text-sm font-bold hover:text-white transition-colors uppercase tracking-wide"
      >
        {{ $t('create_game.undo') || 'Annuler' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { Folder, Cloud, Bell, Type, Clock, Zap, Smile, Leaf, Music, Hourglass, ChevronDown, Play, Info, Star, Bookmark, Heart, Coffee, Flame, Shield, X, Save, Ghost, Gamepad2, Trophy, Target, Rocket } from '@lucide/vue';
import { useI18n } from 'vue-i18n';
import Btn from '../../ui/Btn.vue';
import CustomSelect from '../../ui/CustomSelect.vue';
import Slider from '../../ui/Slider.vue';
import OptionCard from '../../ui/OptionCard.vue';
import StepSection from '../../ui/StepSection.vue';
import BackButton from '../../ui/BackButton.vue';
import PresetSaveModal from './PresetSaveModal.vue';
import { BLIND_TEST_ADDITIONAL_OPTIONS, getExpectedValue } from '../../../core/domain/games/blind-test/types/blindTestOptions';
import { DEFAULT_PRESETS, BlindTestPreset, normalPreset } from '../../../core/domain/games/blind-test/types/blindTestDefaultPresets';
import { usePresets } from '../../../core/domain/setup/presets/usePresets';
import { usePlaylists } from '../../../core/domain/setup/playlists/usePlaylists';

const { t } = useI18n();

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'start-game', settings: any): void;
  (e: 'configure-playlists'): void;
}>();

const { loadPresets: loadPresetsFromApi, savePresets: savePresetsToApi } = usePresets();
const { playlists, loadPlaylists: loadPlaylistsFromApi } = usePlaylists();

const showAdjust = ref(false);

const customPresets = ref<any[]>([]);
const showPresetModal = ref(false);

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

const playlistOptions = computed(() => {
  return playlists.value.map(pl => ({
    value: pl.id,
    label: pl.name,
    description: `${pl.tracks.length} ${t('create_game.tracks')}`,
    icon: pl.type === 'local' ? Folder : Cloud
  }));
});

interface RequiredGameSettings extends BlindTestPreset {
  mode: string;
  playlistId: string;
  localTracks: any[];
  [key: string]: any;
}

const initialSettings: any = {
  name: normalPreset.name,
  icon: normalPreset.icon,
  titleKey: normalPreset.titleKey,
  descKey: normalPreset.descKey,
  blockDuration: normalPreset.blockDuration ?? 0,
  musicDuration: normalPreset.musicDuration ?? 15,
  duration: normalPreset.duration ?? 15,
  mode: 'buzzer',
  playlistId: '',
  localTracks: []
};

BLIND_TEST_ADDITIONAL_OPTIONS.forEach(opt => {
  initialSettings[opt.key] = opt.fallbackValue;
});

const settings = ref<RequiredGameSettings>(initialSettings);

const toggleOption = (key: string) => {
  (settings.value as any)[key] = !(settings.value as any)[key];
};

const loadPresets = async () => {
  const data = await loadPresetsFromApi();
  if (Array.isArray(data)) {
    customPresets.value = data;
  }
};

const savePresetsToBackend = async (presets: any[]) => {
  await savePresetsToApi(presets);
};

const toastVisible = ref(false);
const deletedPreset = ref<{ index: number, data: any } | null>(null);
let toastTimeout: ReturnType<typeof setTimeout> | null = null;

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

const openPresetModal = () => {
  showPresetModal.value = true;
};

onMounted(async () => {
  loadPresets();
  await loadPlaylistsFromApi();
  if (playlists.value.length > 0) {
    settings.value.playlistId = playlists.value[0].id;
  }
});

watch(() => settings.value.musicDuration, (newVal) => {
  if (typeof newVal === 'number') {
    const effectiveVal = Math.min(Math.max(newVal, 1), 100);
    if (newVal !== effectiveVal) {
      settings.value.musicDuration = effectiveVal;
    }
    if (settings.value.duration < effectiveVal) {
      settings.value.duration = effectiveVal;
    }
    if (settings.value.blockDuration > effectiveVal) {
      settings.value.blockDuration = effectiveVal;
    }
  }
});

watch(() => settings.value.duration, (newVal) => {
  if (typeof newVal === 'number') {
    const effectiveVal = Math.min(Math.max(newVal, 1), 100);
    if (newVal !== effectiveVal) {
      settings.value.duration = effectiveVal;
    }
    if (settings.value.musicDuration > effectiveVal) {
      settings.value.musicDuration = effectiveVal;
    }
  }
});

watch(() => settings.value.blockDuration, (newVal) => {
  if (typeof newVal === 'number') {
    const effectiveVal = Math.min(Math.max(newVal, 0), 30);
    if (newVal !== effectiveVal) {
      settings.value.blockDuration = effectiveVal;
    }
    if (settings.value.musicDuration < effectiveVal) {
      settings.value.musicDuration = effectiveVal;
    }
  }
});

watch(() => settings.value.mode, (newMode) => {
  if (newMode) {
    BLIND_TEST_ADDITIONAL_OPTIONS.forEach(opt => {
      settings.value[opt.key as keyof typeof settings.value] = getExpectedValue(opt.key, settings.value[opt.key as keyof typeof settings.value], newMode);
    });
  }
  
  // Specific business logic when switching to text mode
  if (newMode === 'text') {
    if (!settings.value.penaltyOnWrongAnswer || settings.value.musicDuration !== 5) {
      settings.value.allowSuggestions = true;
    }
  }
});

const isPresetSelected = (preset: any) => {
  if (settings.value.blockDuration !== preset.blockDuration) return false;
  if (settings.value.musicDuration !== preset.musicDuration) return false;
  if (settings.value.duration !== preset.duration) return false;
  
  for (const opt of BLIND_TEST_ADDITIONAL_OPTIONS) {
    if (settings.value[opt.key as keyof typeof settings.value] !== getExpectedValue(opt.key, preset[opt.key] ?? false, settings.value.mode)) {
      return false;
    }
  }
  return true;
};

const applyPreset = (preset: any) => {
  settings.value.blockDuration = preset.blockDuration;
  settings.value.musicDuration = preset.musicDuration;
  settings.value.duration = preset.duration;
  
  BLIND_TEST_ADDITIONAL_OPTIONS.forEach(opt => {
    settings.value[opt.key as keyof typeof settings.value] = getExpectedValue(opt.key, preset[opt.key] ?? false, settings.value.mode);
  });
};

const startGame = () => {
  let musicDuration = Math.floor(Number(settings.value.musicDuration));
  if (isNaN(musicDuration) || musicDuration <= 0) {
    musicDuration = 1;
  }
  
  let duration = Math.floor(Number(settings.value.duration));
  if (isNaN(duration) || duration <= 0) {
    duration = 1;
  }
  
  if (duration < musicDuration) {
    duration = musicDuration;
  }
  
  let blockDuration = Math.floor(Number(settings.value.blockDuration));
  if (isNaN(blockDuration) || blockDuration < 0) {
    blockDuration = 0;
  }
  if (blockDuration > musicDuration) {
    blockDuration = musicDuration;
  }
  
  const selectedPlaylist = playlists.value.find(p => p.id === settings.value.playlistId) || null;
  
  const checkPreset = (preset: any) => {
    if (blockDuration !== preset.blockDuration) return false;
    if (musicDuration !== preset.musicDuration) return false;
    if (duration !== preset.duration) return false;
    
    for (const opt of BLIND_TEST_ADDITIONAL_OPTIONS) {
      if (settings.value[opt.key as keyof typeof settings.value] !== getExpectedValue(opt.key, preset[opt.key] ?? false, settings.value.mode!)) {
        return false;
      }
    }
    return true;
  };
  
  let preset = 'custom';
  let presetIcon = 'Settings2';
  
  for (const p of allPresets.value) {
    if (checkPreset(p)) {
      preset = p.name;
      presetIcon = p.icon || 'Star';
      break;
    }
  }
  
  const finalSettings: any = {
    ...settings.value,
    duration,
    musicDuration,
    blockDuration,
    preset,
    presetIcon,
    playlist: selectedPlaylist
  };
  
  emit('start-game', finalSettings);
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
