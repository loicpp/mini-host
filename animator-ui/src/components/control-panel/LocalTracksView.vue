<template>
  <div class="flex-1 overflow-y-auto p-4 bg-muted/30 rounded-2xl border border-[rgba(0,0,0,0.05)] shadow-inner">
    <div v-if="localTracks.length === 0" class="text-center p-8 text-muted-foreground font-medium italic">
      <p>Aucun dossier chargé. Utilisez le bouton "Sélectionner un dossier..." à gauche.</p>
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div 
        v-for="track in localTracks" 
        :key="track.id" 
        :class="[
          'flex items-center p-4 bg-white border rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1',
          selectedTrack?.id === track.id ? 'border-[#FFBA49] bg-amber-50/50 shadow-[0_4px_15px_rgba(255,186,73,0.2)]' : 'border-[rgba(0,0,0,0.08)]',
          playedTracks.includes(track.id) ? 'opacity-40 grayscale' : ''
        ]"
        @click="$emit('select-track', track)"
      >
        <div class="text-3xl mr-4">🎵</div>
        <div class="flex flex-col min-w-0">
          <h4 class="m-0 text-primary font-bold truncate">{{ track.title }}</h4>
          <p class="m-0 text-muted-foreground text-xs truncate">{{ track.artist }}</p>
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
  playedTracks: string[];
}>();

defineEmits<{
  (e: 'select-track', track: Track): void;
}>();
</script>

