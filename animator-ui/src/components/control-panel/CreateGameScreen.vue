<template>
  <div class="flex flex-col items-center justify-center min-h-full w-full relative p-6">
    <button class="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-primary font-bold text-sm transition-colors z-10" @click="$emit('back')" title="Retourner à l'accueil">
      <ChevronLeft class="w-4 h-4" /> Retour
    </button>
    
    <div class="bg-white p-10 rounded-3xl border border-[rgba(0,0,0,0.08)] shadow-xl w-full max-w-2xl">
      <h2 class="text-3xl font-black text-primary text-center mb-2">Nouvelle Partie</h2>
      <p class="text-muted-foreground text-center mb-8">Configurez les paramètres de votre partie.</p>
      
      <div class="bg-muted/50 p-5 rounded-2xl border border-[rgba(0,0,0,0.05)] mb-8">
        <p class="font-bold text-primary mb-4 text-sm uppercase tracking-wider">Modes de jeu rapides :</p>
        
        <div class="flex items-center gap-3 mb-3">
          <span class="font-bold text-muted-foreground text-sm w-16">Buzzer :</span>
          <div class="flex flex-1 gap-2">
            <Btn variant="secondary" size="sm" className="flex-1 text-xs" @click="applyPreset('buzzer', 0, 15, 15)">Normal</Btn>
            <Btn variant="secondary" size="sm" className="flex-1 text-xs" @click="applyPreset('buzzer', 0, 2, 10)">Quick</Btn>
            <Btn variant="secondary" size="sm" className="flex-1 text-xs" @click="applyPreset('buzzer', 0, 30, 30)">Fun</Btn>
            <Btn variant="secondary" size="sm" className="flex-1 text-xs" @click="applyPreset('buzzer', 10, 30, 30)">Peaceful</Btn>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span class="font-bold text-muted-foreground text-sm w-16">Saisie :</span>
          <div class="flex flex-1 gap-2">
            <Btn variant="secondary" size="sm" className="flex-1 text-xs" @click="applyPreset('text', 0, 15, 15)">Normal</Btn>
            <Btn variant="secondary" size="sm" className="flex-1 text-xs" @click="applyPreset('text', 0, 2, 10)">Quick</Btn>
            <Btn variant="secondary" size="sm" className="flex-1 text-xs" @click="applyPreset('text', 0, 30, 30)">Fun</Btn>
            <Btn variant="secondary" size="sm" className="flex-1 text-xs" @click="applyPreset('text', 10, 30, 30)">Peaceful</Btn>
          </div>
        </div>
      </div>
      
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <label class="font-bold text-primary flex justify-between">
            Temps de blocage initial : <span class="text-[#FFBA49]">{{ settings.blockDuration }}s</span>
          </label>
          <input type="range" v-model.number="settings.blockDuration" min="0" max="30" step="1" class="w-full accent-[#FFBA49] cursor-pointer" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-bold text-primary flex justify-between">
            Temps de la musique : <span class="text-[#FFBA49]">{{ settings.musicDuration }}s</span>
          </label>
          <input type="range" v-model.number="settings.musicDuration" min="1" max="100" step="1" class="w-full accent-[#FFBA49] cursor-pointer" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-bold text-primary flex justify-between">
            Temps total de réflexion : <span class="text-[#FFBA49]">{{ settings.duration }}s</span>
          </label>
          <input type="range" v-model.number="settings.duration" min="1" max="100" step="1" class="w-full accent-[#FFBA49] cursor-pointer" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-bold text-primary">Mode de jeu :</label>
          <select v-model="settings.mode" class="w-full px-4 py-3 bg-muted rounded-xl border-none text-foreground focus:ring-2 focus:ring-[#FFBA49] transition-shadow outline-none cursor-pointer font-medium">
            <option value="buzzer">Buzzer (Le premier qui clique répond)</option>
            <option value="text">Saisie de la musique (Chacun tape sa réponse)</option>
          </select>
        </div>

        <div class="flex flex-col gap-2" v-if="preferredSource === 'soundcloud'">
          <label class="font-bold text-primary">Playlist de départ :</label>
          <div v-if="playlists.length > 0">
            <select v-model="settings.playlistId" class="w-full px-4 py-3 bg-muted rounded-xl border-none text-foreground focus:ring-2 focus:ring-[#FFBA49] transition-shadow outline-none cursor-pointer font-medium">
              <option v-for="pl in playlists" :key="pl.id" :value="pl.id">
                {{ pl.name }} ({{ pl.tracks.length }} titres)
              </option>
            </select>
          </div>
          <div v-else class="mt-2 bg-amber-50 p-4 rounded-xl border border-amber-100 flex flex-col gap-3">
            <p class="text-amber-800 text-sm font-medium text-center">Vous n'avez aucune playlist configurée.</p>
            <Btn variant="dark" @click="$emit('configure-playlists')">Créer ma première playlist</Btn>
          </div>
        </div>

        <div class="flex flex-col gap-2" v-if="preferredSource === 'local'">
          <label class="font-bold text-primary">Dossier de musiques :</label>
          <Btn variant="secondary" @click="selectLocalDirectory">
            <FolderOpen class="w-4 h-4 mr-2" /> {{ settings.localTracks && settings.localTracks.length > 0 ? `${settings.localTracks.length} fichiers sélectionnés` : 'Sélectionner un dossier...' }}
          </Btn>
        </div>
        
        <Btn variant="primary" size="lg" className="w-full mt-4 font-bold text-lg" @click="startGame" :disabled="preferredSource === 'soundcloud' && playlists.length === 0">
          Créer la partie
        </Btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { ChevronLeft, FolderOpen } from '@lucide/vue';
import Btn from '../ui/Btn.vue';
import { musicManager } from '../../services/music/MusicManager';

defineProps<{
  preferredSource: string;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'start-game', settings: any): void;
  (e: 'configure-playlists'): void;
}>();

const playlists = ref<any[]>([]);

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
    if (loadedPlaylists.length > 0 && !settings.value.playlistId) {
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

const selectLocalDirectory = async () => {
  try {
    if (musicManager.activeProviderName !== 'local') {
      await musicManager.setProvider('local');
    }
    const results = await musicManager.search('');
    if (results && results.length > 0) {
      settings.value.localTracks = results;
    }
  } catch(e: any) {
    if (e.message !== "Sélection annulée") {
      console.warn("Could not load local directory", e);
    }
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
  
  settings.value.musicDuration = musicDuration;
  settings.value.duration = duration;
  settings.value.blockDuration = blockDuration;
  
  const selectedPlaylist = playlists.value.find(p => p.id === settings.value.playlistId) || null;
  const payload = {
    ...settings.value,
    playlist: selectedPlaylist
  };
  
  emit('start-game', payload);
};
</script>
