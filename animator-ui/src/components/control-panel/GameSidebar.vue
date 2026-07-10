<template>
  <aside class="sidebar">
    <button class="btn-back" @click="$emit('leave-game')" title="Retourner à l'accueil">
      ⬅️ Quitter
    </button>
    <h2>Blind Test <br/> <small>Régie</small></h2>
    
    <div class="menu-section game-active">
      <button class="btn btn-secondary" style="margin-bottom:20px" @click="handleToggleProjector()">
        {{ isProjectorOpen ? '📺 Fermer le Projecteur' : '📺 Ouvrir le Projecteur' }}
      </button>

      <div class="controls" v-if="status === 'waiting'">

        <div class="input-group" v-if="currentSource === 'soundcloud'">
          <label>1. Choisir une Playlist SoundCloud :</label>
          
          <div v-if="customPlaylists.length > 0" style="display:flex; flex-direction:column; gap:10px; margin-top: 10px; margin-bottom: 20px;">
            <select v-model="selectedCustomPlaylist" style="padding:10px; background:rgba(0,0,0,0.5); color:white; border:1px solid rgba(255,255,255,0.2); border-radius:5px; width: 100%; outline:none;">
              <option value="">-- Sélectionner une playlist --</option>
              <option v-for="pl in customPlaylists" :key="pl.id" :value="pl.id">{{ pl.name }}</option>
            </select>
            <button class="btn btn-secondary btn-block" @click="loadSelectedPlaylist" :disabled="!selectedCustomPlaylist">📥 Charger la playlist</button>
          </div>
          <div v-else style="margin-top: 10px;">
            <button class="btn btn-primary btn-block" @click="$emit('configure-playlists')">⚙️ Configurer une playlist</button>
          </div>

        </div>

        <div class="input-group" v-if="currentSource === 'local'">
          <label>1. Dossier de musiques :</label>
          <button class="btn btn-secondary btn-block" @click="$emit('search')">Sélectionner un dossier...</button>
        </div>

        <div class="input-group" v-if="currentSource === 'local' && localTracks.length > 0">
          <p style="color:#ffc700; font-size: 0.9rem; margin-bottom:15px;">
            👉 Sélectionnez une musique dans le grand panneau à droite.
          </p>
        </div>

        <div v-if="selectedTrack" class="input-group">
          <label>{{ currentSource === 'local' ? '3' : '2' }}. Réponse Attendue pour les joueurs :</label>
          <input type="text" v-model="localNextTrackInfo.answer" placeholder="Titre - Artiste" />
        </div>

        <button class="btn btn-action" @click="$emit('play')" :disabled="!selectedTrack" style="margin-top: 15px;">
          ▶️ Lancer la Musique
        </button>
      </div>

      <div class="controls" v-if="status === 'playing'">
        <button class="btn btn-action stop" @click="$emit('stop')">⏹️ Stop & Corriger</button>
      </div>

      <div class="controls" v-if="status === 'reviewing'">
        <button class="btn btn-primary btn-block" @click="$emit('reveal')">🎉 Dévoiler les Résultats</button>
      </div>
      
      <div class="controls" v-if="status === 'results'">
        <button class="btn btn-secondary btn-block" @click="$emit('next-round')">Prochain Tour</button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { Track } from '../../services/music/MusicProvider';

const customPlaylists = ref<any[]>([]);
const selectedCustomPlaylist = ref('');

onMounted(async () => {
  try {
    const configRes = await fetch('http://127.0.0.1:5000/api/playlists');
    const data = await configRes.json();
    if (Array.isArray(data)) {
      customPlaylists.value = data;
    } else if (data.playlists) {
      customPlaylists.value = data.playlists; // backward compatibility
    }
  } catch(e) {
    console.warn("Could not load playlists", e);
  }
});



const loadSelectedPlaylist = () => {
  const pl = customPlaylists.value.find(p => p.id === selectedCustomPlaylist.value);
  if (pl) {
    emit('load-playlist', pl.tracks.map((t: any) => {
      return {
        ...t,
        id: t.url,
        source: 'soundcloud'
      };
    }));
  }
};

const props = defineProps<{
  status: string;
  currentSource: string;
  isProjectorOpen: boolean;
  searchQuery: string;
  localTracks: Track[];
  selectedTrack: Track | null;
  nextTrackInfo: { answer: string };
}>();

const emit = defineEmits<{
  (e: 'leave-game'): void;
  (e: 'configure-playlists'): void;
  (e: 'toggle-projector'): void;
  (e: 'search'): void;
  (e: 'play'): void;
  (e: 'stop'): void;
  (e: 'reveal'): void;
  (e: 'next-round'): void;
  (e: 'load-playlist', tracks: Track[]): void;
  (e: 'update:searchQuery', val: string): void;
  (e: 'update:nextTrackInfo', val: { answer: string }): void;
}>();



const handleToggleProjector = () => {
  emit('toggle-projector');
};

const localSearchQuery = ref(props.searchQuery);
const localNextTrackInfo = ref({ ...props.nextTrackInfo });

watch(localSearchQuery, (val) => emit('update:searchQuery', val));
watch(() => props.searchQuery, (val) => { localSearchQuery.value = val; });

watch(() => localNextTrackInfo.value.answer, () => {
  emit('update:nextTrackInfo', { answer: localNextTrackInfo.value.answer });
});
watch(() => props.nextTrackInfo.answer, (val) => {
  localNextTrackInfo.value.answer = val;
});
</script>

<style scoped>
.btn-back {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0;
  margin-bottom: 20px;
  align-self: flex-start;
  transition: color 0.3s;
}
.btn-back:hover {
  color: #f1416c;
}
.btn-block {
  width: 100%;
}
</style>
