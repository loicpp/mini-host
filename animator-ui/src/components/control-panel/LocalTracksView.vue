<template>
  <div class="flex flex-col h-full min-h-0">
    <!-- Top Bar: Search & Sort -->
    <div v-if="localTracks.length > 0" class="flex gap-4 mb-4 shrink-0">
      <div class="relative flex-1">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search class="h-4 w-4 text-muted-foreground" />
        </div>
        <input 
          ref="searchInput"
          type="text" 
          v-model="searchQuery" 
          @keydown.esc="searchQuery = ''"
          @keydown.enter="handleEnterKey"
          :placeholder="$t('local_tracks.search', 'Rechercher une musique...')"
          class="block w-full pl-10 pr-10 py-2 border border-[rgba(0,0,0,0.1)] rounded-xl leading-5 bg-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#FFBA49]/50 focus:border-[#FFBA49] sm:text-sm transition-all"
        >
        <button 
          v-if="searchQuery"
          @click="searchQuery = ''" 
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-gray-700 transition-colors cursor-pointer"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
      <button 
        @click="toggleSort"
        class="flex items-center justify-center gap-2 w-36 px-4 py-2 bg-white border border-[rgba(0,0,0,0.1)] rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        <ArrowUpDown class="h-4 w-4 text-muted-foreground shrink-0" />
        <span class="truncate">{{ trackSort === 'title' ? $t('local_tracks.sort_by_title') : $t('local_tracks.sort_by_artist') }}</span>
      </button>
      <button 
        @click="toggleHidePlayed"
        :title="hidePlayedTracks ? $t('local_tracks.hide_played_title') : $t('local_tracks.show_played_title')"
        :class="[
          'flex items-center justify-center gap-2 w-36 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
          hidePlayedTracks 
            ? 'bg-gray-100 border border-[rgba(0,0,0,0.1)] text-gray-500 shadow-inner'
            : 'bg-white border border-[rgba(0,0,0,0.1)] hover:bg-gray-50'
        ]"
      >
        <EyeOff v-if="hidePlayedTracks" class="h-4 w-4 shrink-0" />
        <Eye v-else class="h-4 w-4 text-muted-foreground shrink-0" />
        <span class="truncate">{{ hidePlayedTracks ? $t('local_tracks.hide_played') : $t('local_tracks.show_played') }}</span>
      </button>
    </div>

    <div class="flex-1 min-h-0 p-4 bg-muted/30 rounded-2xl border border-[rgba(0,0,0,0.05)] shadow-inner overflow-y-auto relative" ref="trackListContainer">
        <div v-if="localTracks.length === 0" class="text-center p-8 text-muted-foreground font-medium italic">
          <p>{{ $t('local_tracks.no_folder') }}</p>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-0.5">
          <div 
            v-for="track in processedTracks" 
            :key="track.id"
            :id="'track-' + track.id"
            :class="getTrackClasses(track)"
            @click.stop="$emit('select-track', selectedTrack?.id === track.id ? null : track)"
          >
            <div :class="['flex items-center w-full min-w-0 transition-opacity duration-200', playedTracks.includes(track.id || '') ? 'opacity-40 grayscale' : '']">
              <div class="text-3xl mr-4 shrink-0" :title="track.isTemporary ? $t('local_tracks.temporary_track') : ''">
                🎵
              </div>
              <div class="flex flex-col min-w-0" :title="`${track.title} - ${track.artist}`">
                <h4 class="m-0 text-primary font-bold truncate">{{ track.title }}</h4>
                <p class="m-0 text-muted-foreground text-xs truncate">{{ track.artist }}</p>
              </div>
            </div>
          </div>
          <div 
            v-if="searchQuery"
            class="flex items-center p-4 bg-transparent border-2 border-[rgba(0,0,0,0.08)] border-dashed rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-md hover:border-[#FFBA49] group"
            @click.stop="$emit('open-temp-track-modal', searchQuery)"
          >
            <Plus class="w-8 h-8 mr-4 text-muted-foreground group-hover:text-[#FFBA49] transition-colors" />
            <div class="flex flex-col min-w-0">
              <h4 class="m-0 text-primary font-bold truncate">{{ $t('local_tracks.search_temp_title') }}</h4>
              <p class="m-0 text-muted-foreground text-xs truncate">{{ $t('local_tracks.search_temp_desc') }}</p>
            </div>
          </div>

        </div>
    </div>
    <div v-if="localTracks.length > 0" class="mt-2 text-sm font-semibold text-muted-foreground self-end px-2">
      {{ $t('playlists.track_count_label') }} : {{ processedTracks.length }} / {{ localTracks.length }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted } from 'vue';
import { Search, ArrowUpDown, X, Plus, Eye, EyeOff } from '@lucide/vue';
import { Track } from '../../services/music/MusicProvider';
import { searchQuery, trackSort, hidePlayedTracks } from '../../composables/state';
import Fuse from 'fuse.js';

onUnmounted(() => {
  searchQuery.value = '';
});

const props = defineProps<{
  localTracks: Track[];
  selectedTrack: Track | null;
  currentSource: string;
  playedTracks: string[];
}>();

const emit = defineEmits<{
  (e: 'select-track', track: Track | null): void;
  (e: 'open-temp-track-modal', query: string): void;
}>();

const trackListContainer = ref<HTMLElement | null>(null);
const searchInput = ref<HTMLInputElement | null>(null);

import { onMounted } from 'vue';

onMounted(async () => {
  searchInput.value?.focus();
  try {
    const res = await fetch('http://127.0.0.1:5000/api/game');
    const data = await res.json();
    if (data.sort) {
      trackSort.value = data.sort;
    }
    if (data.hidePlayedTracks !== undefined) {
      hidePlayedTracks.value = data.hidePlayedTracks;
    }
  } catch (e) {
    console.warn("Could not load sort preference", e);
  }
});

const scrollToTrack = (trackId: string) => {
  nextTick(() => {
    const el = document.getElementById('track-' + trackId);
    if (el && trackListContainer.value) {
      // Calculate offset relative to the container
      const containerTop = trackListContainer.value.getBoundingClientRect().top;
      const elTop = el.getBoundingClientRect().top;
      const scrollTop = trackListContainer.value.scrollTop;
      const relativeTop = elTop - containerTop + scrollTop;
      
      trackListContainer.value.scrollTo({
        top: Math.max(0, relativeTop - 20),
        behavior: 'smooth'
      });
    }
  });
};

const focusSearch = () => {
  searchInput.value?.focus();
};

defineExpose({ scrollToTrack, focusSearch });

const processedTracks = computed(() => {
  let tracks = [...props.localTracks];
  
  if (hidePlayedTracks.value) {
    tracks = tracks.filter(t => !props.playedTracks.includes(t.id || ''));
  }
  
  if (searchQuery.value) {
    const q = searchQuery.value;
    
    // Configurer fuse.js avec un seuil (threshold) représentant le pourcentage d'erreur
    // 0.0 = Correspondance parfaite, 1.0 = N'importe quoi
    // 0.2 = Autorise environ 20% d'erreur (fautes de frappe, mots inversés)
    const fuse = new Fuse(tracks, {
      keys: [
        { name: 'title', weight: 1 },
        { name: 'artist', weight: 1 },
        { name: 'combined', getFn: (track) => `${track.title} ${track.artist}` },
        { name: 'combined_reverse', getFn: (track) => `${track.artist} ${track.title}` }
      ],
      threshold: 0.2,
      ignoreLocation: true,
      includeScore: true,
    });
    
    // Extraire les résultats originaux
    tracks = fuse.search(q).map(result => result.item);
  }
  
  // Appliquer le tri uniquement si on ne fait pas de recherche 
  // (sinon on garde l'ordre de pertinence de Fuse)
  if (!searchQuery.value) {
    tracks.sort((a, b) => {
      if (trackSort.value === 'title') {
        return a.title.localeCompare(b.title);
      } else {
        return a.artist.localeCompare(b.artist);
      }
    });
  }
  
  return tracks;
});

const getTrackClasses = (track: Track) => {
  const isSelected = props.selectedTrack?.id === track.id;
  
  let classes = 'flex items-center p-4 border rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1';
  
  if (isSelected) {
    classes += ' border-[#FFBA49] shadow-[0_4px_15px_rgba(255,186,73,0.2)]';
    if (track.isTemporary) {
      classes += ' bg-[#fff6e0]';
    } else {
      classes += ' bg-amber-50/50';
    }
  } else {
    if (track.isTemporary) {
      classes += ' border-gray-300 border-dashed bg-[#fff6e0]';
    } else {
      classes += ' border-[rgba(0,0,0,0.08)] bg-white';
    }
  }
  
  return classes;
};

const toggleSort = async () => {
  trackSort.value = trackSort.value === 'title' ? 'artist' : 'title';
  try {
    await fetch('http://127.0.0.1:5000/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sort: trackSort.value })
    });
  } catch (e) {
    console.warn("Could not save sort preference", e);
  }
};

const toggleHidePlayed = async () => {
  hidePlayedTracks.value = !hidePlayedTracks.value;
  try {
    await fetch('http://127.0.0.1:5000/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hidePlayedTracks: hidePlayedTracks.value })
    });
  } catch (e) {
    console.warn("Could not save hidePlayedTracks preference", e);
  }
};

const handleEnterKey = () => {
  if (processedTracks.value.length === 1) {
    const track = processedTracks.value[0];
    const isSelecting = props.selectedTrack?.id !== track.id;
    emit('select-track', isSelecting ? track : null);
    if (isSelecting) {
      searchInput.value?.blur();
    } else {
      searchInput.value?.focus();
    }
  } else if (searchQuery.value && searchQuery.value.trim().length >= 5) {
    emit('open-temp-track-modal', searchQuery.value);
    searchInput.value?.blur();
  }
};
</script>
