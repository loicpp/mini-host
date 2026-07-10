<template>
  <div class="game-room">
    <!-- Header with Score -->
    <div class="game-header card">
      <div class="player-info">
        <span class="player-name">{{ player?.name }}</span>
        <div class="score-badge">
          <span class="score-value">{{ player?.score || 0 }}</span> pts
        </div>
      </div>
    </div>

    <!-- Status: Waiting -->
    <div v-if="game.status === 'waiting' || !game.status" class="status-card card glass">
      <div class="pulse-ring"></div>
      <h3>En attente...</h3>
      <p>L'animateur va bientôt lancer la prochaine musique.</p>
    </div>

    <!-- Status: Playing -->
    <div v-else-if="game.status === 'playing'" class="status-card card highlight">
      <h3 v-if="isBuffering">⏳ Préparez-vous...</h3>
      <h3 v-else>🎵 À vous de jouer !</h3>
      
      <p class="time-left" v-if="timeLeft > 0">{{ timeLeft }}s restantes</p>
      <p class="time-left text-danger" v-else>Temps écoulé !</p>

      <div class="guess-container" :style="{ opacity: isBuffering ? 0.5 : 1 }">
        <!-- Search Input -->
        <div class="input-group search-group">
          <input 
            type="text" 
            v-model="searchQuery" 
            @input="handleSearch"
            placeholder="Tapez un titre ou un artiste..." 
            autocomplete="off"
            :disabled="timeLeft <= 0 || hasSubmitted || isBuffering"
          />
            <div class="search-loader" v-if="isSearching"></div>
          </div>

          <!-- Autocomplete Results -->
          <ul class="autocomplete-list" v-if="suggestions.length > 0 && !hasSubmitted">
            <li 
              v-for="(item, index) in suggestions" 
              :key="index"
              @click="selectSuggestion(item)"
            >
              <img v-if="item.coverUrl" :src="item.coverUrl" alt="cover" class="suggestion-cover" />
              <div class="suggestion-info">
                <span class="suggestion-title">{{ item.title }}</span>
                <span class="suggestion-artist">{{ item.artist }}</span>
              </div>
            </li>
          </ul>

          <!-- Current Selected Guess -->
          <div class="current-guess" v-if="hasSubmitted">
            <p class="success-text">✅ Réponse envoyée !</p>
            <div class="guess-display">
              <strong>{{ currentGuess.title }}</strong> - {{ currentGuess.artist }}
            </div>
          </div>
        </div>
      </div>

    <!-- Status: Results / Reviewing -->
    <div v-else-if="game.status === 'reviewing'" class="status-card card">
      <h3>⏸️ Fin du morceau</h3>
      <p>L'animateur corrige les réponses. Préparez-vous !</p>
      <div class="guess-display" v-if="hasSubmitted">
        Votre réponse : <strong>{{ currentGuess.title }}</strong> - {{ currentGuess.artist }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { itunesService } from '../services/itunesService';
import { getServerTime } from '../firebase';

const props = defineProps({
  game: Object,
  playerId: String
});

const emit = defineEmits(['submit']);

const searchQuery = ref('');
const suggestions = ref([]);
const isSearching = ref(false);
const searchTimeout = ref(null);

const currentGuess = ref(null);
const hasSubmitted = ref(false);
const isBuffering = ref(false);
const timeLeft = ref(0);
const timerInterval = ref(null);

const player = computed(() => {
  return props.game?.players?.[props.playerId];
});

const startTimer = (startTime, duration) => {
  clearInterval(timerInterval.value);
  
  const updateTimer = () => {
    const now = getServerTime();
    
    if (now < startTime) {
      isBuffering.value = true;
      timeLeft.value = Math.ceil(duration / 1000);
    } else {
      isBuffering.value = false;
      const elapsed = now - startTime;
      const remaining = Math.max(0, duration - elapsed);
      timeLeft.value = Math.ceil(remaining / 1000);
      
      if (remaining <= 0) {
        clearInterval(timerInterval.value);
      }
    }
  };
  
  updateTimer();
  timerInterval.value = setInterval(updateTimer, 100);
};

// Watch for game status changes
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
    
    // Start timer if provided
    const track = props.game.currentTrack;
    if (track && track.startTime && track.duration) {
      startTimer(track.startTime, track.duration);
    }
  } else if (newStatus !== 'playing') {
    clearInterval(timerInterval.value);
  }
}, { immediate: true });



onUnmounted(() => {
  clearInterval(timerInterval.value);
});

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
  }, 500); // Debounce
};

const selectSuggestion = (item) => {
  currentGuess.value = item;
  hasSubmitted.value = true;
  searchQuery.value = '';
  suggestions.value = [];
  
  emit('submit', item);
};
</script>

<style scoped>
</style>
