<template>
  <div class="flex flex-col items-center justify-start min-h-full w-full relative p-4 bg-[#F8F9FA]">
    <!-- Back Button -->
    <button class="absolute top-4 left-4 flex items-center gap-2 text-muted-foreground hover:text-primary font-bold text-sm transition-colors z-10" @click="$emit('back')">
      <ChevronLeft class="w-4 h-4" /> {{ $t('create_game.back') }}
    </button>

    <!-- Main Card -->
    <div class="bg-white p-6 rounded-3xl border border-[rgba(0,0,0,0.06)] shadow-sm w-full max-w-2xl flex flex-col gap-6 mt-4">
      
      <div class="flex flex-col items-center">
        <h2 class="text-2xl font-black text-primary mb-1">{{ $t('create_game.title') }}</h2>
        <p class="text-muted-foreground text-center text-sm">{{ $t('create_game.subtitle') }}</p>
      </div>
      
      <!-- Step 1: Game mode -->
      <StepSection 
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
        number="2" 
        :title="$t('create_game.step2_title')" 
        :description="$t('create_game.step2_desc')"
      >
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <OptionCard 
            :title="$t('create_game.quick_mode_normal')" 
            :description="$t('create_game.normal_desc')" 
            layout="vertical"
            :selected="isPresetSelected(0, 15, 15, true, false)"
            @click="applyPreset(0, 15, 15, true, false)"
          >
            <template #icon>
              <Clock class="w-4 h-4" />
            </template>
          </OptionCard>

          <OptionCard 
            :title="$t('create_game.quick_mode_hard')" 
            :description="$t('create_game.hard_desc')" 
            layout="vertical"
            :selected="isPresetSelected(0, 5, 10, false, true)"
            @click="applyPreset(0, 5, 10, false, true)"
          >
            <template #icon>
              <Zap class="w-4 h-4" />
            </template>
          </OptionCard>

          <OptionCard 
            title="Fun" 
            :description="$t('create_game.fun_desc')" 
            layout="vertical"
            :selected="isPresetSelected(0, 30, 30, true, false)"
            @click="applyPreset(0, 30, 30, true, false)"
          >
            <template #icon>
              <Smile class="w-4 h-4" />
            </template>
          </OptionCard>

          <OptionCard 
            title="Peaceful" 
            :description="$t('create_game.peaceful_desc')" 
            layout="vertical"
            :selected="isPresetSelected(10, 30, 30, true, false)"
            @click="applyPreset(10, 30, 30, true, false)"
          >
            <template #icon>
              <Leaf class="w-4 h-4" />
            </template>
          </OptionCard>
        </div>

        <!-- Summary Bar -->
        <div 
          class="bg-[#F8F9FA] rounded-xl flex items-center justify-between p-3 px-5 text-sm cursor-pointer hover:bg-gray-100 transition-colors group mt-6"
          @click="showAdjust = !showAdjust"
        >
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
          <div class="flex flex-col gap-6">
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
          <div class="flex flex-col gap-1 mt-2">
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{{ $t('create_game.options_title') }}</h4>
            <div 
              class="flex items-center justify-between p-3 rounded-xl transition-all" 
              :class="settings.mode === 'buzzer' ? 'opacity-40 pointer-events-none' : 'hover:bg-gray-50 cursor-pointer'"
              @click="settings.mode === 'text' && (settings.allowSuggestions = !settings.allowSuggestions)"
            >
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-gray-800">{{ $t('create_game.allow_suggestions') }}</span>
                <div class="group relative flex items-center">
                  <Info class="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-help" />
                  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center pointer-events-none font-normal shadow-xl">
                    {{ $t('create_game.allow_suggestions_desc') }}
                    <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
              <div 
                :class="['w-12 h-6 rounded-full transition-colors duration-300 flex items-center p-0.5 shrink-0', settings.allowSuggestions && settings.mode === 'text' ? 'bg-[#FFBA49]' : 'bg-gray-200']"
              >
                <div :class="['w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300', settings.allowSuggestions && settings.mode === 'text' ? 'translate-x-6' : 'translate-x-0']"></div>
              </div>
            </div>
            <div 
              class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              @click="settings.penaltyOnWrongAnswer = !settings.penaltyOnWrongAnswer"
            >
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-gray-800">{{ $t('create_game.auto_correction_penalty') }}</span>
                <div class="group relative flex items-center">
                  <Info class="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-help" />
                  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center pointer-events-none font-normal shadow-xl">
                    {{ $t('create_game.auto_correction_penalty_desc') }}
                    <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
              <div 
                :class="['w-12 h-6 rounded-full transition-colors duration-300 flex items-center p-0.5 shrink-0', settings.penaltyOnWrongAnswer ? 'bg-[#FFBA49]' : 'bg-gray-200']"
              >
                <div :class="['w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300', settings.penaltyOnWrongAnswer ? 'translate-x-6' : 'translate-x-0']"></div>
              </div>
            </div>
          </div>
        </div>
      </StepSection>

      <!-- Step 3: Starting playlist -->
      <StepSection 
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
      <Btn variant="primary" size="lg" className="w-full font-bold text-lg h-14 rounded-2xl shadow-md flex items-center justify-center gap-2" @click="startGame" :disabled="playlists.length === 0">
        <Play class="w-5 h-5 fill-current" />
        {{ $t('create_game.start_button') }}
      </Btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { ChevronLeft, Folder, Cloud, Bell, Type, Clock, Zap, Smile, Leaf, Music, Hourglass, ChevronDown, Play, Info } from '@lucide/vue';
import { useI18n } from 'vue-i18n';
import Btn from '../../ui/Btn.vue';
import CustomSelect from '../../ui/CustomSelect.vue';
import Slider from '../../ui/Slider.vue';
import OptionCard from '../../ui/OptionCard.vue';
import StepSection from '../../ui/StepSection.vue';
import { useTutorial } from '../../../composables/useTutorial.ts';

const { playInitBlindTestSequence } = useTutorial();
const { t } = useI18n();

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'start-game', settings: any): void;
  (e: 'configure-playlists'): void;
}>();

const showAdjust = ref(false);
const playlists = ref<any[]>([]);

const playlistOptions = computed(() => {
  return playlists.value.map(pl => ({
    value: pl.id,
    label: pl.name,
    description: `${pl.tracks.length} ${t('create_game.tracks')}`,
    icon: pl.type === 'local' ? Folder : Cloud
  }));
});

const settings = ref({
  blockDuration: 0,
  musicDuration: 15,
  duration: 30,
  mode: 'buzzer',
  allowSuggestions: true,
  penaltyOnWrongAnswer: false,
  playlistId: '',
  localTracks: [] as any[]
});

onMounted(async () => {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/playlists');
    const data = await res.json();
    let loadedPlaylists = [];
    if (Array.isArray(data)) {
      loadedPlaylists = data;
    } else if (data.playlists) {
      loadedPlaylists = data.playlists;
    }
    playlists.value = loadedPlaylists;
    if (loadedPlaylists.length > 0) {
      settings.value.playlistId = loadedPlaylists[0].id;
    }
  } catch(e) {
    console.warn("Could not load playlists for game creation", e);
  }
  playInitBlindTestSequence();
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
  if (newMode === 'buzzer') {
    settings.value.allowSuggestions = false;
  } else {
    if (!settings.value.penaltyOnWrongAnswer || settings.value.musicDuration !== 5) {
      settings.value.allowSuggestions = true;
    }
  }
});

const isPresetSelected = (block: number, music: number, total: number, suggestions: boolean, penalty: boolean) => {
  const expectedSuggestions = settings.value.mode === 'buzzer' ? false : suggestions;
  return settings.value.blockDuration === block &&
         settings.value.musicDuration === music &&
         settings.value.duration === total &&
         settings.value.allowSuggestions === expectedSuggestions &&
         settings.value.penaltyOnWrongAnswer === penalty;
};

const applyPreset = (block: number, music: number, total: number, suggestions: boolean, penalty: boolean) => {
  settings.value.blockDuration = block;
  settings.value.musicDuration = music;
  settings.value.duration = total;
  settings.value.penaltyOnWrongAnswer = penalty;
  
  if (settings.value.mode === 'text') {
    settings.value.allowSuggestions = suggestions;
  } else {
    settings.value.allowSuggestions = false;
  }
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
  
  const finalSettings = {
    ...settings.value,
    duration,
    musicDuration,
    blockDuration,
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
