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
      <!-- Sort Split Button with Dropdown -->
      <div ref="sortContainerRef" class="relative inline-flex items-stretch bg-white border border-[rgba(0,0,0,0.1)] rounded-xl text-sm font-medium shadow-sm shrink-0">
        <!-- Main button toggles direction asc / desc -->
        <button 
          @click="toggleSortDirection"
          class="flex items-center justify-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-l-xl transition-colors cursor-pointer min-w-[105px]"
          :title="sortDirection === 'asc' ? $t('local_tracks.sort_asc') : $t('local_tracks.sort_desc')"
        >
          <ArrowUp v-if="sortDirection === 'asc'" class="h-4 w-4 text-muted-foreground shrink-0" />
          <ArrowDown v-else class="h-4 w-4 text-muted-foreground shrink-0" />
          <span class="truncate">{{ currentSortLabel }}</span>
        </button>

        <!-- Dropdown toggle button ("petit encadre sur la droite du bouton avec une flèche") -->
        <button 
          @click.stop="isSortDropdownOpen = !isSortDropdownOpen"
          class="flex items-center justify-center px-2 py-2 border-l border-[rgba(0,0,0,0.1)] hover:bg-gray-50 rounded-r-xl transition-colors cursor-pointer"
          :title="$t('local_tracks.choose_sort')"
        >
          <ChevronDown class="h-4 w-4 text-muted-foreground transition-transform duration-200" :class="{ 'rotate-180': isSortDropdownOpen }" />
        </button>

        <!-- Dropdown menu -->
        <div 
          v-if="isSortDropdownOpen"
          class="absolute left-0 top-full mt-1.5 w-40 bg-white border border-[rgba(0,0,0,0.1)] rounded-xl shadow-lg z-50 py-1 overflow-hidden"
        >
          <button
            v-for="opt in sortOptions"
            :key="opt.key"
            @click="selectSortOption(opt.key)"
            class="flex items-center justify-between w-full px-3.5 py-2 text-left text-sm transition-colors hover:bg-amber-50 cursor-pointer"
            :class="trackSort === opt.key ? 'font-semibold text-[#FFBA49] bg-amber-50/50' : 'text-gray-700'"
          >
            <span>{{ opt.label }}</span>
            <Check v-if="trackSort === opt.key" class="h-4 w-4 text-[#FFBA49] shrink-0" />
          </button>
        </div>
      </div>
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
              <div class="flex flex-col min-w-0" :title="track.year ? `${track.title} - ${track.artist} - ${track.year}` : `${track.title} - ${track.artist}`">
                <h4 class="m-0 text-primary font-bold truncate">{{ track.title }}</h4>
                <p class="m-0 text-muted-foreground text-xs truncate">{{ track.artist }}<template v-if="track.year"> - {{ track.year }}</template></p>
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
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { Search, ArrowUp, ArrowDown, ChevronDown, Check, X, Plus, Eye, EyeOff } from '@lucide/vue';
import { useI18n } from 'vue-i18n';
import { Track } from '../../../services/music/MusicProvider';
import { useMusicStore, TrackSortOption } from '../../../core/domain/general/stores/music';
import { useGameData } from '../../../core/domain/games/useGameData';
import Fuse from 'fuse.js';

const { t } = useI18n();
const { searchQuery, trackSort, sortDirection, hidePlayedTracks } = useMusicStore();
const { loadGameData, saveGameData } = useGameData();

const isSortDropdownOpen = ref(false);
const sortContainerRef = ref<HTMLElement | null>(null);

const sortOptions = computed<{ key: TrackSortOption; label: string }[]>(() => [
  { key: 'artist', label: t('local_tracks.sort_by_artist', 'Artiste') },
  { key: 'title', label: t('local_tracks.sort_by_title', 'Titre') },
  { key: 'year', label: t('local_tracks.sort_by_year', 'Année') },
  { key: 'playlist', label: t('local_tracks.sort_by_playlist', 'Playlist') }
]);

const currentSortLabel = computed(() => {
  const current = sortOptions.value.find(opt => opt.key === trackSort.value);
  return current ? current.label : t('local_tracks.sort_by_artist', 'Artiste');
});

const handleClickOutside = (event: MouseEvent) => {
  if (sortContainerRef.value && !sortContainerRef.value.contains(event.target as Node)) {
    isSortDropdownOpen.value = false;
  }
};

const toggleSortDirection = async () => {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  await saveGameData({ sort: trackSort.value, sortDirection: sortDirection.value });
};

const selectSortOption = async (key: TrackSortOption) => {
  trackSort.value = key;
  isSortDropdownOpen.value = false;
  await saveGameData({ sort: trackSort.value, sortDirection: sortDirection.value });
};

onMounted(async () => {
  window.addEventListener('click', handleClickOutside);
  searchInput.value?.focus();
  const data = await loadGameData();
  if (data) {
    if (data.sort) {
      trackSort.value = data.sort as TrackSortOption;
    }
    if (data.sortDirection) {
      sortDirection.value = data.sortDirection;
    }
    if (data.hidePlayedTracks !== undefined) {
      hidePlayedTracks.value = data.hidePlayedTracks;
    }
  }
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
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
  } else {
    // Original playlist index map for 'playlist' sort
    const originalIndexMap = new Map<string, number>();
    props.localTracks.forEach((track, index) => {
      if (track.id) {
        originalIndexMap.set(track.id, index);
      }
    });

    // Appliquer le tri uniquement si on ne fait pas de recherche 
    // (sinon on garde l'ordre de pertinence de Fuse)
    tracks.sort((a, b) => {
      // 1. Playlist sort: order as saved in playlist
      if (trackSort.value === 'playlist') {
        const indexA = originalIndexMap.get(a.id || '') ?? 0;
        const indexB = originalIndexMap.get(b.id || '') ?? 0;
        return sortDirection.value === 'asc' ? indexA - indexB : indexB - indexA;
      }

      // 2. Year sort: without year -> always at bottom
      if (trackSort.value === 'year') {
        const yearA = a.year;
        const yearB = b.year;

        if (yearA === undefined && yearB === undefined) {
          return a.title.localeCompare(b.title);
        }
        if (yearA === undefined) return 1;  // sans année -> en bas
        if (yearB === undefined) return -1; // sans année -> en bas

        if (yearA !== yearB) {
          return sortDirection.value === 'asc' ? yearA - yearB : yearB - yearA;
        }
        return a.title.localeCompare(b.title);
      }

      // 3. Title or Artist sort
      const field = trackSort.value === 'title' ? 'title' : 'artist';
      const secondaryField = field === 'title' ? 'artist' : 'title';

      const valA = (a[field] || '').trim();
      const valB = (b[field] || '').trim();

      if (!valA && !valB) return 0;
      if (!valA) return 1;
      if (!valB) return -1;

      const comp = sortDirection.value === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);

      if (comp !== 0) return comp;

      const secA = (a[secondaryField] || '').trim();
      const secB = (b[secondaryField] || '').trim();
      return sortDirection.value === 'asc'
        ? secA.localeCompare(secB)
        : secB.localeCompare(secA);
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

const toggleHidePlayed = async () => {
  hidePlayedTracks.value = !hidePlayedTracks.value;
  await saveGameData({ hidePlayedTracks: hidePlayedTracks.value });
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
