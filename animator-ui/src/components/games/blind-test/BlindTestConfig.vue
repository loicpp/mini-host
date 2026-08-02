<template>
  <div class="flex flex-col items-center justify-center min-h-full w-full relative p-6">
    <button class="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-primary font-bold text-sm transition-colors z-10" @click="$emit('back')">
      <ChevronLeft class="w-4 h-4" /> {{ $t('create_game.back') }}
    </button>
    
    <div class="bg-white p-10 rounded-3xl border border-[rgba(0,0,0,0.08)] shadow-xl w-full max-w-2xl">
      <h2 class="text-3xl font-black text-primary text-center mb-2">{{ $t('create_game.title') }}</h2>
      <p class="text-muted-foreground text-center mb-8">{{ $t('create_game.subtitle') }}</p>
      
      <div class="bg-muted/50 p-5 rounded-2xl border border-[rgba(0,0,0,0.05)] mb-8">
        <p class="font-bold text-primary mb-4 text-sm uppercase tracking-wider">{{ $t('create_game.quick_modes') }}</p>
        
        <div class="flex items-center gap-3 mb-3">
          <span class="font-bold text-muted-foreground text-sm w-16">{{ $t('create_game.buzzer') }}</span>
          <div class="flex flex-1 gap-2">
            <Btn variant="secondary" size="sm" className="flex-1 text-xs" @click="applyPreset('buzzer', 0, 15, 15)">{{ $t('create_game.quick_mode_normal') }}</Btn>
            <Btn variant="secondary" size="sm" className="flex-1 text-xs" @click="applyPreset('buzzer', 0, 2, 10)">{{ $t('create_game.quick_mode_quick') }}</Btn>
            <Btn variant="secondary" size="sm" className="flex-1 text-xs" @click="applyPreset('buzzer', 0, 30, 30)">Fun</Btn>
            <Btn variant="secondary" size="sm" className="flex-1 text-xs" @click="applyPreset('buzzer', 10, 30, 30)">Peaceful</Btn>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span class="font-bold text-muted-foreground text-sm w-16">{{ $t('create_game.text') }}</span>
          <div class="flex flex-1 gap-2">
            <Btn variant="secondary" size="sm" className="flex-1 text-xs" @click="applyPreset('text', 0, 15, 15)">{{ $t('create_game.quick_mode_normal') }}</Btn>
            <Btn variant="secondary" size="sm" className="flex-1 text-xs" @click="applyPreset('text', 0, 2, 10)">{{ $t('create_game.quick_mode_quick') }}</Btn>
            <Btn variant="secondary" size="sm" className="flex-1 text-xs" @click="applyPreset('text', 0, 30, 30)">Fun</Btn>
            <Btn variant="secondary" size="sm" className="flex-1 text-xs" @click="applyPreset('text', 10, 30, 30)">Peaceful</Btn>
          </div>
        </div>
      </div>
      
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <label class="font-bold text-primary flex justify-between items-center">
            {{ $t('create_game.block_duration') }} 
            <div class="flex items-center text-[#FFBA49]">
              <input type="number" v-model.number="settings.blockDuration" class="w-14 text-right bg-transparent border-b border-transparent hover:border-[#FFBA49] focus:border-[#FFBA49] focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" min="0" max="30" @keydown="preventNonNumeric" @blur="clampValue('blockDuration', 0, 30)" />s
            </div>
          </label>
          <Slider v-model="settings.blockDuration" :max="30" :stepValues="[0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 30]" :allowShiftOverride="true" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-bold text-primary flex justify-between items-center">
            {{ $t('create_game.music_duration') }} 
            <div class="flex items-center text-[#FFBA49]">
              <input type="number" v-model.number="settings.musicDuration" class="w-14 text-right bg-transparent border-b border-transparent hover:border-[#FFBA49] focus:border-[#FFBA49] focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" min="1" max="100" @keydown="preventNonNumeric" @blur="clampValue('musicDuration', 1, 100)" />s
            </div>
          </label>
          <Slider v-model="settings.musicDuration" :stepValues="[1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]" :allowShiftOverride="true" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-bold text-primary flex justify-between items-center">
            {{ $t('create_game.total_duration') }} 
            <div class="flex items-center text-[#FFBA49]">
              <input type="number" v-model.number="settings.duration" class="w-14 text-right bg-transparent border-b border-transparent hover:border-[#FFBA49] focus:border-[#FFBA49] focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" min="1" max="100" @keydown="preventNonNumeric" @blur="clampValue('duration', 1, 100)" />s
            </div>
          </label>
          <Slider v-model="settings.duration" :stepValues="[1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]" :allowShiftOverride="true" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-bold text-primary">{{ $t('create_game.game_mode') }}</label>
          <CustomSelect 
            v-model="settings.mode"
            :options="modeOptions"
          />
        </div>

        <div class="flex flex-col gap-2" v-if="settings.mode === 'text'">
          <div 
            class="flex items-center justify-between p-4 bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-sm hover:border-[#FFBA49] transition-all cursor-pointer group"
            @click="settings.allowSuggestions = !settings.allowSuggestions"
          >
            <div class="flex flex-col">
              <span class="font-bold text-primary transition-colors">{{ $t('create_game.allow_suggestions') }}</span>
              <span class="text-sm text-muted-foreground mt-0.5">{{ $t('create_game.allow_suggestions_desc') }}</span>
            </div>
            <div class="relative shrink-0 ml-4">
              <div :class="['w-11 h-6 rounded-full transition-colors duration-300 flex items-center p-0.5', settings.allowSuggestions ? 'bg-[#FFBA49] shadow-inner' : 'bg-gray-200']">
                <div :class="['w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center', settings.allowSuggestions ? 'translate-x-5' : 'translate-x-0']">
                  <Check v-if="settings.allowSuggestions" class="w-3 h-3 text-[#FFBA49]" strokeWidth="4" />
                  <X v-else class="w-3 h-3 text-gray-400" strokeWidth="4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-bold text-primary">{{ $t('create_game.starting_playlist') }}</label>
          <div v-if="playlists.length > 0">
            <CustomSelect 
              v-model="settings.playlistId"
              :options="playlistOptions"
              :placeholder="$t('create_game.playlist_placeholder')"
            />
          </div>
          <div v-else class="mt-2 bg-amber-50 p-4 rounded-xl border border-amber-100 flex flex-col gap-3">
            <p class="text-amber-800 text-sm font-medium text-center">{{ $t('create_game.no_playlist_available') }}</p>
            <Btn variant="dark" @click="$emit('configure-playlists')">{{ $t('create_game.create_first_playlist') }}</Btn>
          </div>
        </div>
        
        <Btn variant="primary" size="lg" className="w-full mt-4 font-bold text-lg" @click="startGame" :disabled="playlists.length === 0">
          {{ $t('create_game.start_button') }}
        </Btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { ChevronLeft, Folder, Cloud, CircleDot, Keyboard, Check, X } from '@lucide/vue';
import { useI18n } from 'vue-i18n';
import Btn from '../../ui/Btn.vue';
import CustomSelect from '../../ui/CustomSelect.vue';
import Slider from '../../ui/Slider.vue';

const { t } = useI18n();

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'start-game', settings: any): void;
  (e: 'configure-playlists'): void;
}>();

const playlists = ref<any[]>([]);

const playlistOptions = computed(() => {
  return playlists.value.map(pl => ({
    value: pl.id,
    label: pl.name,
    description: `${pl.tracks.length} ${t('create_game.tracks')}`,
    icon: pl.type === 'local' ? Folder : Cloud
  }));
});

const modeOptions = computed(() => [
  { value: 'buzzer', label: t('create_game.mode_buzzer'), icon: CircleDot },
  { value: 'text', label: t('create_game.mode_text'), icon: Keyboard }
]);

const settings = ref({
  blockDuration: 0,
  musicDuration: 15,
  duration: 30,
  mode: 'text',
  allowSuggestions: true,
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
});

const preventNonNumeric = (e: KeyboardEvent) => {
  if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
    e.preventDefault();
  }
};

const clampValue = (field: 'blockDuration' | 'musicDuration' | 'duration', min: number, max: number) => {
  let val = Number(settings.value[field]);
  if (isNaN(val)) val = min;
  if (val < min) val = min;
  if (val > max) val = max;
  settings.value[field] = val;
};

watch(() => settings.value.musicDuration, (newVal) => {
  const effectiveVal = Math.min(Math.max(newVal, 1), 100);
  if (settings.value.duration < effectiveVal) {
    settings.value.duration = effectiveVal;
  }
  if (settings.value.blockDuration > effectiveVal) {
    settings.value.blockDuration = effectiveVal;
  }
});

watch(() => settings.value.duration, (newVal) => {
  const effectiveVal = Math.min(Math.max(newVal, 1), 100);
  if (settings.value.musicDuration > effectiveVal) {
    settings.value.musicDuration = effectiveVal;
  }
});

watch(() => settings.value.blockDuration, (newVal) => {
  const effectiveVal = Math.min(Math.max(newVal, 0), 30);
  if (settings.value.musicDuration < effectiveVal) {
    settings.value.musicDuration = effectiveVal;
  }
});

const applyPreset = (mode: string, block: number, music: number, total: number) => {
  settings.value.mode = mode;
  settings.value.blockDuration = block;
  settings.value.musicDuration = music;
  settings.value.duration = total;
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
