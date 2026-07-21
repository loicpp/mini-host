<template>
  <aside class="w-[300px] bg-white text-primary p-6 flex flex-col border-r border-[rgba(0,0,0,0.05)] h-full shadow-sm">
    <button class="flex items-center gap-2 text-muted-foreground hover:text-[#f1416c] font-bold text-sm mb-6 transition-colors self-start" @click="$emit('leave-game')" title="Retourner à l'accueil">
      <ChevronLeft class="w-4 h-4" /> Quitter
    </button>
    
    <div class="h-[100px] shrink-0 flex flex-col justify-center">
      <div class="w-full" v-if="status !== 'waiting'">
        <p class="text-[10px] font-bold text-muted-foreground tracking-wider mb-2 uppercase">En cours</p>
        <div class="bg-[#fff6e0] text-[#3F4739] p-4 rounded-xl shadow-sm border border-[#fef3c7] relative group cursor-help overflow-hidden">
          <template v-if="selectedTrack">
            <div :class="['transition-all duration-500', status === 'playing' ? 'blur-[6px] opacity-30 group-hover:blur-none group-hover:opacity-100 select-none' : '']">
              <div class="font-bold truncate">{{ selectedTrack.title }}</div>
              <div class="text-sm opacity-80 truncate">{{ selectedTrack.artist }}</div>
            </div>
            
            <div v-if="status === 'playing'" class="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-500 pointer-events-none">
              <EyeOff class="w-6 h-6 text-[#3F4739]/50" />
            </div>
          </template>
          <template v-else>
            <div class="text-sm italic opacity-70">Aucune musique</div>
          </template>
        </div>
      </div>
      <div class="w-full" v-else>
        <template v-if="lastPlayedTrack">
          <p class="text-[10px] font-bold text-muted-foreground tracking-wider mb-2 uppercase">Dernière Musique</p>
          <div class="bg-gray-50 text-gray-700 p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="font-bold truncate">{{ lastPlayedTrack.title }}</div>
            <div class="text-sm opacity-80 truncate">{{ lastPlayedTrack.artist }}</div>
          </div>
        </template>
        <template v-else>
          <h2 class="text-3xl font-black text-[#FFBA49] leading-tight">
            Blind Test <br/> <span class="text-xl text-primary font-medium">Régie</span>
          </h2>
        </template>
      </div>
    </div>
    
    <div class="h-px bg-[rgba(0,0,0,0.05)] w-full my-4 shrink-0"></div>

    <div class="h-[120px] flex flex-col justify-center shrink-0 w-full">
      <div class="flex flex-col gap-4 w-full" v-if="status === 'waiting'">
        <Btn variant="blue" className="w-full font-bold" @click="$emit('play')" :disabled="!selectedTrack">
          <Play class="w-5 h-5 mr-2" /> Lancer la Musique
        </Btn>
      </div>

      <div class="flex flex-col gap-4 w-full" v-if="status === 'playing'">
        <Btn variant="success" className="w-full font-bold" @click="$emit('stop')">
          <Square class="w-5 h-5 mr-2 fill-current" /> Stop & Corriger
        </Btn>
      </div>

      <div class="flex flex-col gap-3 w-full" v-if="status === 'reviewing'">
        <template v-if="gameMode === 'buzzer' && hasBuzzed">
          <Btn variant="ghost" className="w-full font-bold text-blue-600 border border-blue-200 bg-blue-50" @click="$emit('resume-music')">
            <X class="w-4 h-4 mr-2" /> Faux, on reprend (Bloquer)
          </Btn>
          <Btn variant="pink" className="w-full font-bold" @click="$emit('correct-buzzer')">
            <Check class="w-4 h-4 mr-2" /> Vrai (1 pt & Dévoiler)
          </Btn>
        </template>
        <template v-else>
          <Btn variant="pink" className="w-full font-bold" @click="$emit('reveal')">
            <Eye class="w-4 h-4 mr-2" /> {{ gameMode === 'buzzer' ? "Personne n'a trouvé (Dévoiler)" : "Dévoiler les Résultats" }}
          </Btn>
        </template>
      </div>
      
      <div class="flex flex-col gap-4 w-full" v-if="status === 'results'">
        <Btn variant="gray" className="w-full font-bold" @click="$emit('next-round')">
          <ChevronRight class="w-5 h-5 mr-2" /> Prochain Tour
        </Btn>
      </div>
    </div>

    <div class="h-px bg-[rgba(0,0,0,0.05)] w-full my-4 shrink-0"></div>

    <div class="flex-1 overflow-y-auto min-h-0 pr-2">
      <p class="text-[10px] font-bold text-muted-foreground tracking-wider mb-4 uppercase">Scores</p>
      <div class="flex flex-col gap-3">
        <div v-for="(player, index) in sortedPlayers" :key="player.id" class="flex items-center gap-3">
          <div :class="['w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm', index === 0 ? 'bg-[#FFBA49] text-[#3F4739]' : 'bg-muted text-muted-foreground']">
            {{ index + 1 }}
          </div>
          <div class="flex-1 truncate font-semibold text-sm text-primary">{{ player.name }}</div>
          <div class="font-black text-sm text-primary">{{ player.score || 0 }}</div>
        </div>
        <div v-if="sortedPlayers.length === 0" class="text-xs text-muted-foreground italic text-center py-4">Aucun joueur</div>
      </div>
    </div>

    <div class="mt-4 pt-4 border-t border-[rgba(0,0,0,0.05)] shrink-0">
      <Btn variant="secondary" className="w-full font-bold bg-[#fff6e0] text-[#3F4739] hover:bg-[#ffe8a0]" @click="handleToggleProjector()">
        <Monitor class="w-4 h-4 mr-2" /> {{ isProjectorOpen ? 'Fermer le Projecteur' : 'Ouvrir le Projecteur' }}
      </Btn>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { ChevronLeft, Monitor, Play, Square, X, Check, ChevronRight, EyeOff, Eye } from '@lucide/vue';
import { Track } from '../../services/music/MusicProvider';
import Btn from '../ui/Btn.vue';

const props = defineProps<{
  status: string;
  currentSource: string;
  isProjectorOpen: boolean;
  searchQuery: string;
  localTracks: Track[];
  selectedTrack: Track | null;
  nextTrackInfo: { answer: string };
  gameMode: string;
  hasBuzzed: boolean;
  lastPlayedTrack?: Track | null;
  players?: Record<string, any>;
}>();

const sortedPlayers = computed(() => {
  const arr = Object.keys(props.players || {}).map(id => ({
    id,
    ...props.players![id]
  }));
  return arr.sort((a, b) => (b.score || 0) - (a.score || 0));
});

const emit = defineEmits<{
  (e: 'leave-game'): void;
  (e: 'configure-playlists'): void;
  (e: 'toggle-projector'): void;
  (e: 'play'): void;
  (e: 'stop'): void;
  (e: 'reveal'): void;
  (e: 'next-round'): void;
  (e: 'resume-music'): void;
  (e: 'correct-buzzer'): void;
  (e: 'auto-correct'): void;
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
