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

    <!-- Blocked State -->
    <template v-if="player?.blockedTurns === -1 || player?.blockedTurns > 0">
      <div class="status-card card" style="border: 2px solid #ff4d4d; margin-bottom: 15px; text-align: center; padding: 30px;">
        <h3 style="color: #ff4d4d; margin-bottom: 15px; font-size: 1.5rem;">🛑 Vous êtes bloqué</h3>
        <p v-if="player.blockedTurns === -1" style="font-size: 1.1rem;">L'animateur a bloqué vos réponses pour une durée indéterminée.</p>
        <p v-else-if="player.blockedTurns === 1" style="font-size: 1.1rem; font-weight: bold; color: #ffc700;">Vous êtes bloqué jusqu'à la fin de ce tour.</p>
        <p v-else style="font-size: 1.1rem; font-weight: bold; color: #ffc700;">Vous ne pouvez pas jouer pendant {{ player.blockedTurns }} tour(s).</p>
      </div>
    </template>

    <template v-else>
      <!-- Status: Waiting -->
      <div v-if="game.status === 'waiting' || !game.status" class="status-card card glass">
        <div class="pulse-ring"></div>
        <h3>En attente...</h3>
        <p>L'animateur va bientôt lancer la prochaine musique.</p>
      </div>

      <!-- Status: Playing -->
      <div v-else-if="game.status === 'playing'" class="status-card card highlight">
        <div style="width: 100%;">
          <h3 v-if="isBuffering">⏳ Préparez-vous...</h3>
          <h3 v-else-if="isDelaying" class="text-warning">⏳ Patientez : {{ delayTimeLeft }}s</h3>
          <h3 v-else>🎵 À vous de jouer !</h3>
          
          <p class="time-left" v-if="timeLeft > 0">{{ timeLeft }}s restantes</p>
          <p class="time-left text-danger" v-else>Temps écoulé !</p>

          <div class="guess-container" :style="{ opacity: isBuffering ? 0.5 : 1 }">
            <template v-if="game.settings?.mode === 'buzzer'">
              <div class="buzzer-mode-container" v-if="!hasSubmitted">
                <button 
                  class="btn-buzz" 
                  @click="handleBuzz" 
                  :disabled="timeLeft <= 0 || isBuffering || isDelaying"
                >
                  BUZZ
                </button>
              </div>
            </template>
            <template v-else>
              <!-- Search Input -->
            <div class="input-group search-group">
              <input 
                type="text" 
                v-model="searchQuery" 
                @input="handleSearch"
                placeholder="Tapez un titre ou un artiste..." 
                autocomplete="off"
                :disabled="timeLeft <= 0 || hasSubmitted || isBuffering || isDelaying"
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
            </template>

            <!-- Current Selected Guess -->
            <div class="current-guess" v-if="hasSubmitted">
              <p class="success-text">✅ Réponse envoyée !</p>
              <div class="guess-display">
                <strong>{{ currentGuess?.title }}</strong> <span v-if="currentGuess?.artist">- {{ currentGuess?.artist }}</span>
              </div>
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

      <!-- Status: Finished -->
      <div v-else-if="game.status === 'finished'" class="status-card card glass">
        <h3 style="color: #00e676; font-size: 1.5rem;">🏆 Partie Terminée !</h3>
        <p>Regardez le projecteur pour découvrir le podium final.</p>
      </div>
    </template>
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

const emit = defineEmits(['submit', 'buzz']);

const searchQuery = ref('');
const suggestions = ref([]);
const isSearching = ref(false);
const searchTimeout = ref(null);

const currentGuess = ref(null);
const hasSubmitted = ref(false);
const isBuffering = ref(false);
const isDelaying = ref(false);
const delayTimeLeft = ref(0);
const timeLeft = ref(0);
const timerInterval = ref(null);

const player = computed(() => {
  return props.game?.players?.[props.playerId];
});

const startTimer = (startTime, duration, blockDuration = 0) => {
  clearInterval(timerInterval.value);
  
  const updateTimer = () => {
    const now = getServerTime();
    
    if (now < startTime) {
      isBuffering.value = true;
      isDelaying.value = false;
      timeLeft.value = Math.ceil(duration / 1000);
      delayTimeLeft.value = Math.ceil(blockDuration / 1000);
    } else {
      isBuffering.value = false;
      const elapsed = now - startTime;
      const remaining = Math.max(0, duration - elapsed);
      const remainingDelay = Math.max(0, blockDuration - elapsed);
      timeLeft.value = Math.ceil(remaining / 1000);
      
      if (remainingDelay > 0) {
        isDelaying.value = true;
        delayTimeLeft.value = Math.ceil(remainingDelay / 1000);
      } else {
        isDelaying.value = false;
        delayTimeLeft.value = 0;
      }
      
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
      startTimer(track.startTime, track.duration, track.blockDuration || 0);
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

<style scoped>
.buzzer-mode-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px 0;
}
.btn-buzz {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #ff4d4d, #cc0000);
  border: 8px solid #990000;
  box-shadow: 0 15px 25px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.4);
  color: white;
  font-size: 3.5rem;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.1s;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}
.btn-buzz:active:not(:disabled) {
  transform: translateY(10px) scale(0.95);
  box-shadow: 0 5px 10px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.6);
}
.btn-buzz:disabled {
  background: radial-gradient(circle at 30% 30%, #888, #555);
  border-color: #333;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
input:disabled {
  opacity: 0.3 !important;
  background: rgba(0, 0, 0, 0.6) !important;
  color: #666 !important;
  cursor: not-allowed !important;
}
</style>
