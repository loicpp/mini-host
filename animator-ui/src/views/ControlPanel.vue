<template>
  <div class="animator-app">
    <!-- Login Screen -->
    <LoginScreen 
      v-if="!isLoggedIn" 
      :error="loginError"
      @login="login" 
    />

    <!-- Main App -->
    <div v-else class="animator-app-inner">
      <GameSidebar 
        v-if="viewState === 'game'"
        :status="status"
        :currentSource="currentSource"
        :isProjectorOpen="isProjectorOpen"
        v-model:searchQuery="searchQuery"
        v-model:nextTrackInfo="nextTrackInfo"
        :localTracks="localTracks"
        :selectedTrack="selectedTrack"
        @toggle-projector="toggleProjector"
        @leave-game="leaveGame"
        @configure-playlists="onConfigurePlaylists"
        @search="performSearch"
        @play="playMusic"
        @stop="stopMusic"
        @reveal="revealResults"
        @next-round="nextRound"
        @load-playlist="loadPlaylist"
      />

      <!-- Main Content -->
      <main class="main-content" :class="{ 'full-page': viewState !== 'game' }">
        <HomeScreen 
          v-if="viewState === 'home'"
          :lastGameId="lastGameId"
          @open-settings="viewState = 'settings'"
          @open-playlists="viewState = 'playlists'"
          @create-game="createNewGame"
          @resume-game="resumeGame"
        />

        <SettingsScreen 
          v-else-if="viewState === 'settings'"
          v-model:preferredSource="preferredSource"
          @back="viewState = 'home'"
          @save="saveSettings"
        />

        <PlaylistScreen 
          v-else-if="viewState === 'playlists'"
          @back="viewState = 'home'"
        />

        <div v-else-if="viewState === 'game' && gameId" class="game-panel">
          <div class="header-bar">
            <h3>Joueurs connectés ({{ Object.keys(players).length }})</h3>
            <span class="status-badge" :class="status">{{ statusDisplay }}</span>
            <div style="margin-left: auto; display: flex; gap: 10px;">
              <button class="btn warning" @click="restartGame">
                Recommencer
              </button>
              <button class="btn danger" @click="endGame" v-if="status !== 'finished'">
                Arrêter la partie
              </button>
            </div>
          </div>

          <LocalTracksView 
            v-if="status === 'waiting' && (currentSource === 'local' || (currentSource === 'soundcloud' && localTracks.length > 0))"
            :localTracks="localTracks"
            :selectedTrack="selectedTrack"
            :currentSource="currentSource"
            @select-track="selectTrack"
          />

          <div v-if="status === 'reviewing'" style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <h3 style="margin: 0; color: #ffc700;">🎵 Attendu : {{ nextTrackInfo.answer || 'Réponse inconnue' }}</h3>
          </div>

          <PlayersGrid 
            v-if="status === 'reviewing'"
            :players="players"
            @award="award"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import LoginScreen from '../components/control-panel/LoginScreen.vue';
import HomeScreen from '../components/control-panel/HomeScreen.vue';
import SettingsScreen from '../components/control-panel/SettingsScreen.vue';
import GameSidebar from '../components/control-panel/GameSidebar.vue';
import LocalTracksView from '../components/control-panel/LocalTracksView.vue';
import PlayersGrid from '../components/control-panel/PlayersGrid.vue';
import PlaylistScreen from '../components/control-panel/PlaylistScreen.vue';
import { animatorService } from '../services/animatorService';
import { musicManager } from '../services/music/MusicManager';
import { Track } from '../services/music/MusicProvider';
import { getServerTime } from '../firebase';

const email = ref('');
const password = ref('');
const loginError = ref('');

const isLoggedIn = ref(false);
const gameId = ref('');
const gameSecret = ref('');
const status = ref('waiting');

const players = ref<Record<string, any>>({});
const nextTrackInfo = ref({ answer: '' });
const currentSource = ref('soundcloud');
const searchQuery = ref('');
const selectedTrack = ref<Track | null>(null);
const localTracks = ref<Track[]>([]);
const isProjectorOpen = ref(false);


const statusDisplay = computed(() => {
  if (status.value === 'waiting') return 'En attente...';
  if (status.value === 'playing') return 'Lecture en cours';
  if (status.value === 'reviewing') return 'Correction';
  if (status.value === 'results') return 'Résultats';
  if (status.value === 'finished') return 'Terminée';
  return status.value;
});

const viewState = ref('home');
const preferredSource = ref('soundcloud');
const lastGameId = ref('');

onMounted(() => {
  const attemptAutoLogin = async () => {
    try {
      const configRes = await fetch('http://127.0.0.1:5000/api/config');
      const config = await configRes.json();
      if (config && config.email && config.password) {
        email.value = config.email;
        password.value = config.password;
        await login();
      }
        // Load preferred source
      if (config && config.preferredSource) {
        preferredSource.value = config.preferredSource;
      }
      
      // Auto-cleanup games older than 24h
      if (config && config.gameHistory) {
        const now = Date.now();
        const validHistory = [];
        let updated = false;
        
        for (const game of config.gameHistory) {
          if (now - game.createdAt > 24 * 60 * 60 * 1000) {
            try {
              await animatorService.deleteGame(game.id);
              updated = true;
              // Successfully deleted, do not push to validHistory
            } catch(e) {
              console.error("Failed to delete game on server:", e);
              validHistory.push(game); // Keep it to try again next time
            }
          } else {
            validHistory.push(game);
          }
        }
        
        if (updated) {
          await fetch('http://127.0.0.1:5000/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameHistory: validHistory })
          });
        }
      }
    } catch(e) {
      console.warn("Could not load config", e);
    }
  };

  attemptAutoLogin();

  // Listen for manual projector closures (Alt+F4)
  window.addEventListener('projector-closed-native', async () => {
    isProjectorOpen.value = false;
    try {
      await fetch('http://127.0.0.1:5000/api/projector/close', { method: 'POST' });
    } catch(e) {
      // ignore
    }
  });
});




const login = async (loginEmail?: string, loginPassword?: string) => {
  if (loginEmail) email.value = loginEmail;
  if (loginPassword) password.value = loginPassword;
  try {
    loginError.value = '';
    await animatorService.signIn(email.value, password.value);
    isLoggedIn.value = true;
    
    try {
      await fetch('http://127.0.0.1:5000/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value, password: password.value })
      });
      
      const configRes = await fetch('http://127.0.0.1:5000/api/config');
      const config = await configRes.json();
      
      if (!config.preferredSource) {
        viewState.value = 'settings';
      } else {
        preferredSource.value = config.preferredSource;
        viewState.value = 'home';
      }
      if (config.lastGameId) {
        lastGameId.value = config.lastGameId;
      }
    } catch (e) {
      console.warn("Backend not available, running in local-only mode", e);
      viewState.value = 'settings';
    }
  } catch {
    loginError.value = "Identifiants invalides.";
  }
};

const createNewGame = async () => {
  const game = await animatorService.createGame();
  gameId.value = game.gameId;
  gameSecret.value = game.secret;
  status.value = 'waiting';
  currentSource.value = preferredSource.value;
  viewState.value = 'game';
  
  try {
    const configRes = await fetch('http://127.0.0.1:5000/api/config');
    const config = await configRes.json();
    const history = config.gameHistory || [];
    history.push({ id: game.gameId, createdAt: Date.now() });
    
    await fetch('http://127.0.0.1:5000/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        lastGameId: game.gameId,
        gameHistory: history
      })
    });
    lastGameId.value = game.gameId;
  } catch (e) {
    console.warn("Could not save history to backend", e);
  }
  
  animatorService.listenToPlayers(gameId.value, (newPlayers) => {
    players.value = newPlayers;
  });
};

const resumeGame = async () => {
  if (!lastGameId.value) return;
  gameId.value = lastGameId.value;
  status.value = 'waiting';
  currentSource.value = preferredSource.value;
  viewState.value = 'game';
  
  animatorService.listenToPlayers(gameId.value, (newPlayers) => {
    players.value = newPlayers;
  });
};

const leaveGame = async () => {
  if (isProjectorOpen.value) {
    await toggleProjector();
  }
  // Optional: stop listening to players
  gameId.value = '';
  viewState.value = 'home';
};

const saveSettings = async () => {
  try {
    await fetch('http://127.0.0.1:5000/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferredSource: preferredSource.value })
    });
  } catch (e) {
    console.warn("Could not save settings to backend", e);
  }
  
  viewState.value = 'home';
};

const onConfigurePlaylists = async () => {
  await leaveGame();
  viewState.value = 'playlists';
};

const toggleProjector = async () => {
  if (!isProjectorOpen.value) {
    try {
      await fetch('http://127.0.0.1:5000/api/projector/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId.value })
      });
    } catch (e) {
      window.open(`/public?game=${gameId.value}`, '_blank', 'width=1280,height=720');
    }
    isProjectorOpen.value = true;
  } else {
    try {
      await fetch('http://127.0.0.1:5000/api/projector/close', {
        method: 'POST'
      });
    } catch (e) {
      console.warn("Could not close projector via backend", e);
    }
    isProjectorOpen.value = false;
  }
};

const performSearch = async () => {
  if (musicManager.activeProviderName !== currentSource.value) {
    await musicManager.setProvider(currentSource.value);
  }
  try {
    const results = await musicManager.search(searchQuery.value);
    if (results.length > 0) {
      if (currentSource.value === 'local') {
        localTracks.value = results;
        selectedTrack.value = null;
      } else {
        selectedTrack.value = results[0];
      }
    }
  } catch(e: any) {
    if (e.message !== "Sélection annulée") {
      alert(e.message);
    }
  }
};

const selectTrack = (track: Track) => {
  selectedTrack.value = track;
  nextTrackInfo.value.answer = `${track.artist} - ${track.title}`;
};

let currentStartTime = 0;

const playMusic = async () => {
  if (!selectedTrack.value) return;
  
  try {
    console.log("startGame triggered with track:", selectedTrack.value);
    
    // Unlock audio context safely
    if (typeof musicManager.activate === 'function') {
      console.log("Activating music manager...");
      musicManager.activate().catch(e => console.warn("Activate error:", e));
    }
    
    console.log("Setting status to playing...");
    status.value = 'playing';
    const delay = 3000;
    const startTime = getServerTime() + delay;
    currentStartTime = startTime;
    
    await animatorService.updateGameState(gameId.value, 'playing', {
      startTime: startTime,
      duration: 30000,
      answer: nextTrackInfo.value.answer
    });
    
    const timeToWait = startTime - getServerTime();
    
    // We pass the delay down to the music manager synchronously so that 
    // the provider can capture the user click event gesture for autoplay rules.
    try {
      if (status.value === 'playing') {
        await musicManager.play(selectedTrack.value!, Math.max(0, timeToWait));
      }
    } catch (err: any) {
      alert("Erreur de lecture : " + err.message);
      stopMusic();
    }
  } catch (err: any) {
    alert("Erreur lors du lancement : " + err.message);
  }
};

const stopMusic = async () => {
  await musicManager.stop();
  status.value = 'reviewing';
  await animatorService.updateGameState(gameId.value, 'reviewing');
};

let autoStopTimer: ReturnType<typeof setTimeout> | null = null;

watch(() => status.value, (newStatus) => {
  if (newStatus === 'playing') {
    if (autoStopTimer) clearTimeout(autoStopTimer);
    const checkTimer = () => {
      if (status.value !== 'playing') return;
      const now = getServerTime();
      if (currentStartTime && now >= currentStartTime + 30000) {
        stopMusic();
      } else {
        autoStopTimer = setTimeout(checkTimer, 500);
      }
    };
    checkTimer();
  } else {
    if (autoStopTimer) clearTimeout(autoStopTimer);
  }
});

watch(() => players.value, (newPlayers) => {
  if (status.value === 'playing' && newPlayers) {
    const playerIds = Object.keys(newPlayers);
    if (playerIds.length > 0) {
      const allSubmitted = playerIds.every(id => (newPlayers as Record<string, any>)[id].currentGuess);
      if (allSubmitted) {
        stopMusic();
      }
    }
  }
}, { deep: true });

const award = async (playerId: string, points: number) => {
  if (points !== 0) {
    const currentScore = players.value[playerId]?.score || 0;
    if (currentScore + points >= 0) {
      await animatorService.awardPoints(gameId.value, playerId, points);
    }
  }
  // Optional: visually mark it as corrected locally
};

const revealResults = async () => {
  status.value = 'results';
  await animatorService.updateGameState(gameId.value, 'results');
};

const nextRound = async () => {
  status.value = 'waiting';
  nextTrackInfo.value.answer = '';
  searchQuery.value = '';
  
  try {
    await animatorService.clearPlayerAnswers(gameId.value);
  } catch (e) {
    console.warn("Could not clear player answers", e);
  }
  selectedTrack.value = null;
  await animatorService.updateGameState(gameId.value, 'waiting');
};

const endGame = async () => {
  if (confirm('Voulez-vous vraiment arrêter la partie et afficher le podium final ?')) {
    status.value = 'finished';
    await animatorService.updateGameState(gameId.value, 'finished');
  }
};

const restartGame = async () => {
  if (confirm('Voulez-vous vraiment recommencer la partie à zéro (les joueurs seront conservés) ?')) {
    status.value = 'waiting';
    nextTrackInfo.value.answer = '';
    searchQuery.value = '';
    selectedTrack.value = null;
    
    try {
      await animatorService.resetPlayers(gameId.value);
    } catch (e) {
      console.warn("Could not reset players", e);
    }
    await animatorService.updateGameState(gameId.value, 'waiting', null);
  }
};
const loadPlaylist = async (tracks: Track[]) => {
  localTracks.value = tracks;
  if (tracks.length > 0) {
    const trackSource = tracks[0].source;
    if (musicManager.activeProviderName !== trackSource) {
      try {
        await musicManager.setProvider(trackSource);
      } catch(e) {
        console.error(e);
      }
    }
  }
};
</script>

<style scoped>
.animator-app-inner {
  flex: 1;
  display: flex;
  width: 100%;
}
.main-content.full-page {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}
</style>
