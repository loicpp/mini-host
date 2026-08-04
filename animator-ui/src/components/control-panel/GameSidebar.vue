<template>
  <aside class="w-[300px] bg-white text-primary p-6 flex flex-col border-r border-[rgba(0,0,0,0.05)] h-full shadow-sm">
    <button class="flex items-center gap-2 text-muted-foreground hover:text-[#f1416c] font-bold text-sm mb-6 transition-colors self-start" @click="$emit('leave-game')">
      <ChevronLeft class="w-4 h-4" /> {{ $t('sidebar.quit') }}
    </button>
    
    <div class="h-[100px] shrink-0 flex flex-col justify-center">
      <div class="w-full" v-if="status !== 'waiting'">
        <div class="flex items-center justify-between mb-2">
          <p class="text-[10px] font-bold text-muted-foreground tracking-wider uppercase m-0">{{ $t('sidebar.playing') }}</p>
          <div class="text-[10px] font-bold bg-muted px-2 py-0.5 rounded-md text-muted-foreground" v-if="playedCount !== undefined && playedCount > 0">{{ playedCount }} {{ $t('sidebar.played') }}</div>
        </div>
        <div class="bg-[#fff6e0] text-[#3F4739] p-4 rounded-xl shadow-sm border border-[#fef3c7] relative group overflow-hidden">
          <template v-if="selectedTrack || lastPlayedTrack">
            <div :class="['transition-all duration-500', status === 'playing' ? 'blur-[6px] opacity-30 group-hover:blur-none group-hover:opacity-100 select-none' : '']">
              <div class="font-bold truncate">{{ (selectedTrack || lastPlayedTrack)?.title }}</div>
              <div class="text-sm opacity-80 truncate">{{ (selectedTrack || lastPlayedTrack)?.artist }}</div>
            </div>
            
            <div v-if="status === 'playing'" class="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-500 pointer-events-none">
              <EyeOff class="w-6 h-6 text-[#3F4739]/50" />
            </div>
          </template>
          <template v-else-if="nextTrackInfo.answer">
            <div :class="['transition-all duration-500', status === 'playing' ? 'blur-[6px] opacity-30 group-hover:blur-none group-hover:opacity-100 select-none' : '']">
              <div class="font-bold truncate" :title="nextTrackInfo.answer">{{ nextTrackInfo.answer }}</div>
            </div>
            <div v-if="status === 'playing'" class="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-500 pointer-events-none">
              <EyeOff class="w-6 h-6 text-[#3F4739]/50" />
            </div>
          </template>
          <template v-else>
            <div class="text-sm italic opacity-70">{{ $t('sidebar.no_music') }}</div>
          </template>
        </div>
      </div>
      <div class="w-full" v-else>
        <template v-if="lastPlayedTrack">
          <div class="flex items-center justify-between mb-2">
            <p class="text-[10px] font-bold text-muted-foreground tracking-wider uppercase m-0">{{ $t('sidebar.last_music') }}</p>
            <div class="text-[10px] font-bold bg-muted px-2 py-0.5 rounded-md text-muted-foreground" v-if="playedCount !== undefined && playedCount > 0">{{ playedCount }} {{ $t('sidebar.played') }}</div>
          </div>
          <div class="bg-gray-50 text-gray-700 p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="font-bold truncate">{{ lastPlayedTrack.title }}</div>
            <div class="text-sm opacity-80 truncate">{{ lastPlayedTrack.artist }}</div>
          </div>
        </template>
        <template v-else>
          <h2 class="text-3xl font-black text-[#FFBA49] leading-tight">
            {{ $t('sidebar.blind_test') }} <br/> <span class="text-xl text-primary font-medium">{{ $t('sidebar.regie') }}</span>
          </h2>
        </template>
      </div>
    </div>
    
    <div class="h-px bg-[rgba(0,0,0,0.05)] w-full my-4 shrink-0"></div>

    <div class="h-[120px] flex flex-col justify-center shrink-0 w-full">
      <div class="flex flex-col gap-4 w-full" v-if="status === 'waiting'">
        <Btn variant="blue" className="w-full font-bold" @click="$emit('play')" :disabled="!selectedTrack">
          <Play class="w-5 h-5 mr-2" /> {{ $t('sidebar.play_music') }}
        </Btn>
      </div>

      <div class="flex flex-col gap-4 w-full" v-if="status === 'playing'">
        <Btn variant="success" className="w-full font-bold" @click="$emit('stop')">
          <Square class="w-5 h-5 mr-2 fill-current" /> {{ $t('sidebar.stop_music') }}
        </Btn>
      </div>

      <div class="flex flex-col gap-3 w-full" v-if="status === 'reviewing'">
        <template v-if="gameMode === 'buzzer' && hasBuzzed">
          <Btn variant="ghost" className="w-full font-bold text-blue-600 border border-blue-200 bg-blue-50" @click="$emit('resume-music')">
            <X class="w-4 h-4 mr-2" /> {{ $t('sidebar.wrong_resume') }}
          </Btn>
          <Btn variant="pink" className="w-full font-bold" @click="$emit('correct-buzzer')">
            <Check class="w-4 h-4 mr-2" /> {{ $t('sidebar.correct_reveal') }}
          </Btn>
        </template>
        <template v-else>
          <Btn variant="pink" className="w-full font-bold" @click="$emit('reveal')">
            <Eye class="w-4 h-4 mr-2" /> {{ gameMode === 'buzzer' ? $t('sidebar.nobody_found') : $t('sidebar.reveal_results') }}
          </Btn>
        </template>
      </div>
      
      <div class="flex flex-col gap-4 w-full" v-if="status === 'results'">
        <Btn variant="gray" className="w-full font-bold" @click="$emit('next-round')">
          <ChevronRight class="w-5 h-5 mr-2" /> {{ $t('sidebar.next_round') }}
        </Btn>
      </div>
    </div>

    <div class="h-px bg-[rgba(0,0,0,0.05)] w-full my-4 shrink-0"></div>

    <div class="flex-1 overflow-y-auto min-h-0 pr-2">
      <!-- Scores section removed per user request -->
    </div>

    <div class="mt-4 pt-4 border-t border-[rgba(0,0,0,0.05)] shrink-0">
      <Btn variant="secondary" className="w-full font-bold bg-[#fff6e0] text-[#3F4739] hover:bg-[#ffe8a0]" @click="handleToggleProjector()">
        <Monitor class="w-4 h-4 mr-2" /> {{ isProjectorOpen ? $t('sidebar.close_projector') : $t('sidebar.open_projector') }}
      </Btn>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
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
  playedCount?: number;
}>();



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
