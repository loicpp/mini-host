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

        <div v-if="selectedTrack" class="input-group">
          <label>Réponse Attendue pour les joueurs :</label>
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
import { ref, watch } from 'vue';
import { Track } from '../../services/music/MusicProvider';


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
