<template>
  <div class="local-tracks-view">
    <div v-if="localTracks.length === 0" class="empty-state">
      <p>Aucun dossier chargé. Utilisez le bouton "Sélectionner un dossier..." à gauche.</p>
    </div>
    <div v-else class="tracks-list">
      <div 
        v-for="track in localTracks" 
        :key="track.id" 
        class="track-item" 
        :class="{ active: selectedTrack?.id === track.id }"
        @click="$emit('select-track', track)"
      >
        <div class="track-icon">🎵</div>
        <div class="track-info">
          <h4>{{ track.title }}</h4>
          <p>{{ track.artist }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Track } from '../../services/music/MusicProvider';

defineProps<{
  localTracks: Track[];
  selectedTrack: Track | null;
  currentSource: string;
}>();

defineEmits<{
  (e: 'select-track', track: Track): void;
}>();
</script>

<style scoped>
.local-tracks-view {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}
.tracks-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
}
.track-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}
.track-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}
.track-item.active {
  background: rgba(255, 199, 0, 0.2);
  border-color: #ffc700;
}
.track-icon {
  font-size: 2rem;
  margin-right: 15px;
}
.track-info h4 {
  margin: 0 0 5px 0;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}
.track-info p {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}
.empty-state {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 50px;
  font-size: 1.2rem;
}
</style>
