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
          <label class="font-bold text-primary flex justify-between">
            {{ $t('create_game.block_duration') }} <span class="text-[#FFBA49]">{{ settings.blockDuration }}s</span>
          </label>
          <input type="range" v-model.number="settings.blockDuration" min="0" max="30" step="1" class="w-full accent-[#FFBA49] cursor-pointer" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-bold text-primary flex justify-between">
            {{ $t('create_game.music_duration') }} <span class="text-[#FFBA49]">{{ settings.musicDuration }}s</span>
          </label>
          <input type="range" v-model.number="settings.musicDuration" min="1" max="100" step="1" class="w-full accent-[#FFBA49] cursor-pointer" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-bold text-primary flex justify-between">
            {{ $t('create_game.total_duration') }} <span class="text-[#FFBA49]">{{ settings.duration }}s</span>
          </label>
          <input type="range" v-model.number="settings.duration" min="1" max="100" step="1" class="w-full accent-[#FFBA49] cursor-pointer" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-bold text-primary">{{ $t('create_game.game_mode') }}</label>
          <CustomSelect 
            v-model="settings.mode"
            :options="modeOptions"
          />
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
import { ChevronLeft, Folder, Cloud, CircleDot, Keyboard } from '@lucide/vue';
import { useI18n } from 'vue-i18n';
import Btn from '../ui/Btn.vue';
import CustomSelect from '../ui/CustomSelect.vue';

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

watch(() => settings.value.musicDuration, (newVal) => {
  if (settings.value.duration < newVal) {
    settings.value.duration = newVal;
  }
  if (settings.value.blockDuration > newVal) {
    settings.value.blockDuration = newVal;
  }
});

watch(() => settings.value.duration, (newVal) => {
  if (settings.value.musicDuration > newVal) {
    settings.value.musicDuration = newVal;
  }
});

watch(() => settings.value.blockDuration, (newVal) => {
  if (settings.value.musicDuration < newVal) {
    settings.value.musicDuration = newVal;
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
