<template>
  <div class="flex flex-col gap-6">
    <!-- Header with Score -->
    <div class="flex items-center justify-between p-4 bg-muted rounded-2xl border border-[rgba(0,0,0,0.05)]">
      <div class="flex items-center gap-3 flex-1 min-w-0 mr-4">
        <div class="w-10 h-10 shrink-0 bg-white rounded-xl flex items-center justify-center shadow-sm text-lg font-bold text-primary">
          {{ player?.name?.charAt(0).toUpperCase() || '?' }}
        </div>
        <span class="font-bold text-lg text-primary truncate block">{{ player?.name }}</span>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <div class="bg-[#FFBA49] px-3 py-1 rounded-full shadow-sm flex items-center border border-[#e6a53c]" v-if="playerRank">
          <span class="font-black text-[#3F4739] text-sm">#{{ playerRank }}</span>
        </div>
        <div class="bg-white px-4 py-1.5 rounded-full shadow-sm flex items-center gap-2 border border-yellow-100">
          <span class="font-black text-xl text-[#FFBA49]">{{ player?.score || 0 }}</span>
          <span class="text-xs font-bold text-muted-foreground uppercase tracking-wider">{{ $t('gameroom.pts') }}</span>
        </div>
      </div>
    </div>

    <!-- Blocked State -->
    <template v-if="player?.blockedTurns === -1 || player?.blockedTurns > 0">
      <div class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center shadow-sm">
        <div class="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          🛑
        </div>
        <h3 class="text-red-600 font-bold text-xl mb-2">{{ $t('gameroom.blocked_title') }}</h3>
        <p v-if="player.blockedTurns === -1" class="text-red-700 font-medium">{{ $t('gameroom.blocked_forever') }}</p>
        <p v-else-if="player.blockedTurns === 1" class="text-[#f0aa30] font-bold">{{ $t('gameroom.blocked_turn') }}</p>
        <p v-else class="text-[#f0aa30] font-bold">{{ $t('gameroom.blocked_turns', { n: player.blockedTurns }) }}</p>
      </div>
    </template>

    <template v-else>
      <!-- Status: Waiting -->
      <div v-if="game.status === 'waiting' || !game.status" class="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
        <div class="w-16 h-16 rounded-full bg-[#fff6e0] flex items-center justify-center mb-6 relative">
          <div class="absolute inset-0 rounded-full border-2 border-[#FFBA49] animate-ping opacity-75"></div>
          <span class="text-2xl">⏳</span>
        </div>
        <h3 class="text-xl font-bold text-primary mb-2">{{ $t('gameroom.waiting_title') }}</h3>
        <p class="text-muted-foreground text-sm">{{ $t('gameroom.waiting_subtitle') }}</p>
      </div>

      <!-- Status: Playing -->
      <div v-else-if="game.status === 'playing'" class="bg-white border-2 border-[#FFBA49] rounded-2xl p-6 shadow-[0_4px_20px_rgba(255,186,73,0.15)] flex flex-col relative overflow-visible">
        
        <div class="text-center mb-6">
          <h3 v-if="isBuffering" class="text-lg font-bold text-muted-foreground">{{ $t('gameroom.buffering') }}</h3>
          <h3 v-else-if="isDelaying" class="text-lg font-bold text-[#FFBA49]">{{ $t('gameroom.delaying', { n: delayTimeLeft }) }}</h3>
          <h3 v-else class="text-2xl font-black text-primary">{{ $t('gameroom.playing') }}</h3>
        </div>

        <div :class="['transition-opacity duration-300', isBuffering ? 'opacity-50 pointer-events-none' : '']">
          <template v-if="game.settings?.mode === 'buzzer'">
            <div class="flex justify-center items-center py-6" v-if="!hasSubmitted">
              <button 
                class="w-48 h-48 rounded-full bg-red-500 hover:bg-red-600 active:bg-red-700 border-8 border-red-700 shadow-[0_10px_20px_rgba(220,38,38,0.4),inset_0_4px_10px_rgba(255,255,255,0.4)] text-white font-black text-4xl tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center"
                @click="handleBuzz" 
                :disabled="timeLeft <= 0 || isBuffering || isDelaying"
              >
                BUZZ
              </button>
            </div>
          </template>
          <template v-else>
            <!-- Search Input -->
            <div class="relative z-50" v-if="!hasSubmitted">
              <div class="relative">
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  @input="handleSearch"
                  @keydown.enter="submitCustomGuess"
                  :placeholder="$t('gameroom.search_placeholder')" 
                  autocomplete="off"
                  maxlength="50"
                  :disabled="timeLeft <= 0 || hasSubmitted || isBuffering || isDelaying"
                  class="w-full pl-12 pr-4 py-4 bg-muted rounded-xl border-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-[#FFBA49] transition-shadow outline-none font-medium text-lg disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl">🔍</span>
                <div v-if="isSearching" class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-muted-foreground border-t-primary rounded-full animate-spin"></div>
              </div>

              <!-- Autocomplete Results -->
              <ul v-if="suggestions.length > 0 && !hasSubmitted" class="absolute bottom-full left-0 right-0 mb-2 bg-white border border-[rgba(0,0,0,0.08)] rounded-xl shadow-2xl overflow-hidden max-h-[250px] overflow-y-auto z-50 flex flex-col-reverse">
                <li 
                  v-for="(item, index) in suggestions" 
                  :key="index"
                  @click="selectSuggestion(item)"
                  class="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer border-b border-muted transition-colors last:border-b-0"
                >
                  <img v-if="item.coverUrl" :src="item.coverUrl" alt="cover" class="w-10 h-10 rounded-md object-cover flex-shrink-0 bg-muted" />
                  <div class="flex flex-col min-w-0">
                    <span class="font-bold text-primary truncate text-sm">{{ item.title }}</span>
                    <span class="text-xs text-muted-foreground truncate">{{ item.artist }}</span>
                  </div>
                </li>
              </ul>
            </div>
          </template>

          <!-- Current Selected Guess -->
          <div v-if="hasSubmitted" class="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p class="text-emerald-500 font-bold text-center mb-3">{{ $t('gameroom.answer_sent') }}</p>
            <div class="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center shadow-sm">
              <strong class="text-emerald-900 block text-lg">{{ currentGuess?.title }}</strong>
              <span v-if="currentGuess?.artist" class="text-emerald-700 text-sm mt-1 block">{{ currentGuess?.artist }}</span>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-center">
          <div v-if="timeLeft > 0" class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff6e0] text-[#3F4739] font-bold text-sm">
            {{ $t('gameroom.time_left', { n: timeLeft }) }}
          </div>
          <div v-else class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 text-red-600 font-bold text-sm">
            {{ $t('gameroom.time_up') }}
          </div>
        </div>
      </div>

      <!-- Status: Results / Reviewing -->
      <div v-else-if="game.status === 'reviewing'" class="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-6 shadow-sm text-center">
        <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-4 text-xl">⏸️</div>
        <h3 class="text-xl font-bold text-primary mb-2">{{ $t('gameroom.review_title') }}</h3>
        <p class="text-muted-foreground text-sm mb-6">{{ $t('gameroom.review_subtitle') }}</p>
        
        <div v-if="hasSubmitted" class="bg-muted p-4 rounded-xl border border-[rgba(0,0,0,0.04)]">
          <p class="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{{ $t('gameroom.your_answer') }}</p>
          <strong class="text-primary block">{{ currentGuess.title }}</strong>
          <span v-if="currentGuess.artist" class="text-muted-foreground text-sm block mt-1">{{ currentGuess.artist }}</span>
        </div>
      </div>

      <!-- Status: Finished -->
      <div v-else-if="game.status === 'finished'" class="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center shadow-sm">
        <div class="text-5xl mb-4">🏆</div>
        <h3 class="text-2xl font-black text-emerald-600 mb-2">{{ $t('gameroom.finished_title') }}</h3>
        <p class="text-emerald-700 font-medium">{{ $t('gameroom.finished_subtitle') }}</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { itunesService } from '../../../services/itunesService';
import { getServerTime } from '../../../firebase';
import { useGameTimer } from '../../../composables/useGameTimer';

const props = defineProps({
  game: Object,
  playerId: String
});

const emit = defineEmits(['submit', 'buzz']);

const searchQuery = ref('');
const suggestions = ref([]);
const isSearching = ref(false);
const searchTimeout = ref(null);

const currentGuess = ref(null);
const hasSubmitted = ref(false);

const { isBuffering, isDelaying, delayTimeLeft, timeLeft, startTimer, stopTimer } = useGameTimer(getServerTime);

const player = computed(() => {
  return props.game?.players?.[props.playerId];
});

const playerRank = computed(() => {
  if (!props.game?.players || !props.playerId) return null;
  const p = Object.keys(props.game.players).map(id => ({
    id,
    ...props.game.players[id]
  }));
  p.sort((a, b) => {
    const scoreDiff = (b.score || 0) - (a.score || 0);
    if (scoreDiff !== 0) return scoreDiff;
    return (a.name || '').localeCompare(b.name || '');
  });
  const index = p.findIndex(pl => pl.id === props.playerId);
  return index !== -1 ? index + 1 : null;
});

watch(() => props.game?.status, (newStatus, oldStatus) => {
  if (newStatus === 'playing') {
    if (oldStatus !== 'playing') {
      searchQuery.value = '';
      suggestions.value = [];
    }
    
    if (player.value?.currentGuess) {
      hasSubmitted.value = true;
      currentGuess.value = player.value.currentGuess;
    } else if (oldStatus !== 'playing') {
      hasSubmitted.value = false;
      currentGuess.value = null;
    }
    
    const track = props.game.currentTrack;
    if (track && track.startTime && track.duration) {
      startTimer(track.startTime, track.duration, track.blockDuration || 0);
    }
  } else if (newStatus !== 'playing') {
    stopTimer();
  }
}, { immediate: true });

const handleSearch = () => {
  if (hasSubmitted.value) return;
  
  clearTimeout(searchTimeout.value);
  suggestions.value = [];
  
  if (searchQuery.value.trim().length < 2) {
    isSearching.value = false;
    return;
  }

  isSearching.value = true;
  searchTimeout.value = setTimeout(async () => {
    suggestions.value = await itunesService.search(searchQuery.value);
    isSearching.value = false;
  }, 500); 
};

const selectSuggestion = (item) => {
  currentGuess.value = item;
  hasSubmitted.value = true;
  searchQuery.value = '';
  suggestions.value = [];
  
  emit('submit', item);
};

const submitCustomGuess = () => {
  if (hasSubmitted.value || !searchQuery.value.trim()) return;
  
  const customText = searchQuery.value.trim();
  let title = customText;
  let artist = '';
  
  if (customText.includes('-')) {
    const parts = customText.split('-');
    title = parts[0].trim();
    artist = parts.slice(1).join('-').trim();
  }
  
  const item = { title, artist, coverUrl: '' };
  
  currentGuess.value = item;
  hasSubmitted.value = true;
  searchQuery.value = '';
  suggestions.value = [];
  
  emit('submit', item);
};

const handleBuzz = () => {
  emit('buzz', (success) => {
    if (success) {
      const item = { title: 'BUZZ', artist: 'Appuyé !' };
      currentGuess.value = item;
      hasSubmitted.value = true;
    }
  });
};
</script>
