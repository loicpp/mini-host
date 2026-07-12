<template>
  <div class="projector-view">
    <!-- Header with QR Code -->
    <header class="projector-header">
      <div class="qr-box" v-if="gameId && secret && game?.status !== 'waiting'">
        <img :src="qrCodeUrl" alt="QR Code" class="qr-img" />
        <div class="qr-text">
          <p>Scannez pour jouer !</p>
          <h2>{{ gameId }}</h2>
        </div>
      </div>
      <div class="title-box" style="display: flex; align-items: center; gap: 15px;">
        <img src="/favicon.jpg" alt="Logo" class="projector-logo" style="height: 7vh; width: 7vh; border-radius: 1.5vh; object-fit: cover; border: 2px solid #ffc700; box-shadow: 0 0 15px rgba(255, 199, 0, 0.4);" />
        <h1>Blind Test</h1>
      </div>
    </header>

    <!-- Main Display Area -->
    <main class="projector-main">
      <div v-if="!game" class="loading">
        <h1>Connexion à la partie...</h1>
      </div>

      <div v-else-if="game.status === 'waiting'" class="state-panel waiting-state">
        <div class="huge-qr-container" v-if="gameId && secret">
          <img :src="qrCodeUrl" alt="QR Code" class="qr-huge-img" />
          <div class="huge-qr-text">
            <h2>Rejoignez la partie</h2>
            <div class="pin-code">{{ gameId }}</div>
            <p>Scannez pour participer !</p>
          </div>
        </div>

        <h1 class="waiting-title">Préparez-vous !</h1>
        
        <div class="players-lobby">
          <h3>Joueurs présents ({{ Object.keys(game.players || {}).length }})</h3>
          <div class="lobby-grid">
            <span v-for="(player, id) in game.players" :key="id" class="lobby-player">
              {{ player.name }}
            </span>
          </div>
        </div>
      </div>

      <div v-else-if="game.status === 'playing'" class="state-panel playing-state">
        <div v-if="isBuffering" class="buffering">
          <h1>La musique démarre dans...</h1>
          <div class="huge-countdown">{{ bufferTimeLeft }}</div>
        </div>
        <div v-else>
          <div class="countdown-circle">
            <svg viewBox="0 0 100 100">
              <circle class="bg" cx="50" cy="50" r="45"></circle>
              <circle class="progress" cx="50" cy="50" r="45" :stroke-dashoffset="dashOffset"></circle>
            </svg>
            <div class="time-text">{{ timeLeft }}</div>
          </div>
          <h1>À vous de jouer !</h1>
        </div>
      </div>

      <div v-else-if="game.status === 'reviewing'" class="state-panel reviewing-state">
        <h1 class="text-danger">⏰ Temps écoulé !</h1>
        <p>L'animateur corrige vos réponses...</p>
      </div>

      <div v-else-if="game.status === 'results'" class="state-panel results-state">
        <h1 class="text-success">🎉 Résultats</h1>
        <div class="answer-card">
          <h2>{{ game.currentTrack?.answer || 'Réponse Inconnue' }}</h2>
        </div>
        <div class="stats-card">
          <p>Classement Général :</p>
          <ul class="leaderboard-list">
            <li v-for="(player, index) in allPlayersSorted" :key="player.id" class="leaderboard-item">
              <span class="rank">#{{ index + 1 }}</span>
              <span class="name">{{ player.name }}</span>
              <span class="score">{{ player.score || 0 }} pts</span>
            </li>
          </ul>
        </div>
      </div>
      <div v-else-if="game.status === 'finished'" class="state-panel finished-state">
        <h1 class="text-success" style="font-size: 4rem; margin-bottom: 2rem;">🏆 Podium Final 🏆</h1>
        
        <div class="podium-container">
          <div v-for="(player, index) in topThreePlayers" :key="player.id" :class="'podium-place place-' + (index + 1)">
            <div class="medal">{{ ['🥇', '🥈', '🥉'][index] }}</div>
            <div class="podium-name">{{ player.name }}</div>
            <div class="podium-score">{{ player.score || 0 }} pts</div>
          </div>
        </div>
        
        <div class="other-players" v-if="otherPlayers.length > 0">
          <h3>Le reste du classement :</h3>
          <ul class="leaderboard-list">
            <li v-for="(player, index) in otherPlayers" :key="player.id" class="leaderboard-item">
              <span class="rank">#{{ index + 4 }}</span>
              <span class="name">{{ player.name }}</span>
              <span class="score">{{ player.score || 0 }} pts</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { db, auth, getServerTime } from '../firebase';
import { ref as dbRef, onValue } from 'firebase/database';
import { signInAnonymously } from 'firebase/auth';

const gameId = ref('');
const secret = ref('');
const game = ref<Record<string, any> | null>(null);

const timeLeft = ref(0);
const bufferTimeLeft = ref(0);
const isBuffering = ref(false);
const totalTime = ref(30);
const timerInterval = ref<ReturnType<typeof setInterval> | null>(null);

const baseUrl = "https://minihostapp-1.web.app"; 

const qrCodeUrl = computed(() => {
  if (!gameId.value || !secret.value) return '';
  const url = encodeURIComponent(`${baseUrl}/?game=${gameId.value}&secret=${secret.value}`);
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${url}`;
});

const allPlayersSorted = computed(() => {
  if (!game.value || !game.value.players) return [];
  const p = Object.keys(game.value?.players).map(id => ({
    id,
    ...game.value?.players[id]
  }));
  return p.sort((a, b) => (b.score || 0) - (a.score || 0));
});

const topThreePlayers = computed(() => allPlayersSorted.value.slice(0, 3));
const otherPlayers = computed(() => allPlayersSorted.value.slice(3));

const dashOffset = computed(() => {
  const c = Math.PI * (45 * 2);
  const pct = timeLeft.value / totalTime.value;
  return ((1 - pct) * c);
});

onMounted(async () => {
  const params = new URLSearchParams(window.location.search);
  gameId.value = params.get('game') || '';
  
  if (!gameId.value) return;

  // Make sure we have read access
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch(e) {
      console.error(e);
    }
  }

  const gameNode = dbRef(db, `games/${gameId.value}`);
  onValue(gameNode, (snapshot) => {
    if (snapshot.exists()) {
      game.value = snapshot.val();
      secret.value = game.value?.secret || ''; // Read secret from DB to generate QR code
    }
  });
});

watch(() => game.value?.status, (newStatus) => {
  if (newStatus === 'playing') {
    const track = game.value?.currentTrack;
    if (track && track.startTime && track.duration) {
      totalTime.value = track.duration / 1000;
      startTimer(track.startTime, track.duration);
    }
  } else {
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }
  }
});

const startTimer = (startTime: number, duration: number) => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }
  
  const updateTimer = () => {
    const now = getServerTime();
    
    if (now < startTime) {
      isBuffering.value = true;
      timeLeft.value = Math.ceil(duration / 1000);
      bufferTimeLeft.value = Math.ceil((startTime - now) / 1000);
    } else {
      isBuffering.value = false;
      const elapsed = now - startTime;
      const remaining = Math.max(0, duration - elapsed);
      timeLeft.value = Math.ceil(remaining / 1000);
      
      if (remaining <= 0) {
        if (timerInterval.value) {
          clearInterval(timerInterval.value);
          timerInterval.value = null;
        }
      }
    }
  };
  
  updateTimer();
  timerInterval.value = setInterval(updateTimer, 100);
};
</script>

<style>
/* Extracted layout for projector */
.projector-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: var(--bg-gradient, linear-gradient(135deg, #0f0c29, #302b63, #24243e));
  color: white;
  overflow: hidden;
}

.projector-header {
  display: flex;
  justify-content: space-between;
  padding: 3vh 5vw;
  align-items: center;
}

.qr-box {
  display: flex;
  align-items: center;
  gap: 2vw;
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5vh;
  border-radius: 1.5vh;
  backdrop-filter: blur(10px);
}

.qr-img {
  width: 10vh;
  height: 10vh;
}

.qr-text h2 {
  color: #ffc700;
  font-size: 3vh;
  letter-spacing: 2px;
}

.title-box h1 {
  font-size: 5vh;
  background: -webkit-linear-gradient(45deg, #ff3366, #8c1eff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.projector-main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  overflow-y: auto;
  padding: 2vh 0;
}

.state-panel {
  width: 100%;
}

.state-panel h1 {
  font-size: 6vh;
  margin-bottom: 2vh;
}

.state-panel p {
  font-size: 3vh;
  color: rgba(255, 255, 255, 0.7);
}

.pulse-ring.lg {
  width: 150px;
  height: 150px;
  border-width: 4px;
}

/* Timer Circle */
.countdown-circle {
  position: relative;
  width: 40vh;
  height: 40vh;
  margin: 0 auto 4vh;
}

.countdown-circle svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.countdown-circle circle {
  fill: none;
  stroke-width: 8;
}

.countdown-circle .bg {
  stroke: rgba(255, 255, 255, 0.1);
}

.countdown-circle .progress {
  stroke: #00e676;
  stroke-dasharray: 283; /* 2 * PI * 45 */
  transition: stroke-dashoffset 1s linear;
}

.time-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 15vh;
  font-weight: bold;
}

.buffering h1 { font-size: 5vh; color: #ffc700; margin-bottom: 3vh; }
.huge-countdown { font-size: 12vh; font-weight: bold; animation: pulse 1s infinite; color: #fff; }

.huge-qr-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5vw;
  background: rgba(255, 255, 255, 0.1);
  padding: 4vh 5vw;
  border-radius: 3vh;
  backdrop-filter: blur(10px);
  margin: 0 auto 3vh;
  max-width: 85vw;
}
.qr-huge-img {
  width: 45vh;
  height: 45vh;
  background: white;
  padding: 2vh;
  border-radius: 3vh;
  margin: 0;
}
.huge-qr-text {
  text-align: left;
}
.huge-qr-text h2 {
  color: #fff;
  font-size: 5vh;
  margin-bottom: 1vh;
}
.huge-qr-text .pin-code {
  color: #ffc700;
  font-size: 10vh;
  font-weight: bold;
  letter-spacing: 5px;
  margin-bottom: 1vh;
  text-shadow: 0 0 20px rgba(255, 199, 0, 0.5);
}
.huge-qr-text p {
  font-size: 3vh;
  color: rgba(255,255,255,0.8);
}

/* Results */
.answer-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 4vh;
  border-radius: 2vh;
  margin-bottom: 4vh;
  font-size: 4vh;
  border: 2px solid #00e676;
  box-shadow: 0 0 4vh rgba(0, 230, 118, 0.3);
}

.top-players {
  list-style: none;
  font-size: 3vh;
}

.top-players li {
  margin: 1.5vh 0;
}

/* Lobby */
.waiting-title {
  font-size: 6vh;
  margin: 2vh 0 1vh;
}
.players-lobby { margin-top: 1vh; }
.players-lobby h3 { margin-bottom: 1.5vh; color: rgba(255,255,255,0.8); font-size: 3vh; }
.lobby-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1vh;
  justify-content: center;
  max-width: 90vw;
  margin: 0 auto;
}
.lobby-player {
  background: rgba(255,255,255,0.15);
  padding: 1vh 2vw;
  border-radius: 3vh;
  font-size: 2.5vh;
  font-weight: bold;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255,255,255,0.2);
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Leaderboard */
.leaderboard-list {
  list-style: none;
  padding: 0;
  max-width: 60vw;
  margin: 0 auto;
}
.leaderboard-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255,255,255,0.1);
  margin: 1vh 0;
  padding: 1.5vh 2.5vw;
  border-radius: 1.5vh;
  font-size: 3vh;
  animation: fadeIn 0.5s ease-out;
}
.leaderboard-item .rank {
  font-weight: bold;
  color: #ffc700;
  width: 5vw;
  text-align: left;
}
.leaderboard-item .name {
  flex: 1;
  text-align: left;
  margin-left: 2vw;
}
.leaderboard-item .score {
  font-weight: bold;
  color: #00e676;
}

/* Podium */
.podium-container {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 2vw;
  margin-bottom: 5vh;
  height: 40vh;
}
.podium-place {
  background: rgba(255,255,255,0.1);
  border-radius: 2vh 2vh 0 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-top: 2vh;
  width: 20vw;
  box-shadow: 0 -5px 20px rgba(0,0,0,0.3);
  position: relative;
  border-top: 4px solid #ffc700;
  animation: fadeIn 1s ease-out;
}
.podium-place.place-1 {
  height: 100%;
  border-color: #ffd700;
  background: linear-gradient(to top, rgba(255,215,0,0.1), rgba(255,215,0,0.3));
  z-index: 3;
}
.podium-place.place-2 {
  height: 75%;
  border-color: #c0c0c0;
  background: linear-gradient(to top, rgba(192,192,192,0.1), rgba(192,192,192,0.3));
  z-index: 2;
}
.podium-place.place-3 {
  height: 55%;
  border-color: #cd7f32;
  background: linear-gradient(to top, rgba(205,127,50,0.1), rgba(205,127,50,0.3));
  z-index: 1;
}
.medal {
  font-size: 6vh;
  margin-bottom: 1vh;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,0.5));
}
.podium-name {
  font-size: 3.5vh;
  font-weight: bold;
  color: white;
  text-align: center;
  word-break: break-word;
}
.podium-score {
  font-size: 2.5vh;
  color: rgba(255,255,255,0.8);
  margin-top: 1vh;
}
.other-players {
  margin-top: 2vh;
}
.other-players h3 {
  font-size: 3vh;
  color: rgba(255,255,255,0.7);
  margin-bottom: 2vh;
}
</style>
