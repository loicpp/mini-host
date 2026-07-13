<template>
  <div class="animator-app">
    <!-- Disconnection Warning Banner -->
    <div v-if="!isBackendConnected" class="backend-warning-banner">
      <span class="warning-icon">⚠️</span>
      <span>Impossible de contacter le serveur local (backend). Assurez-vous que l'application de bureau est bien lancée.</span>
    </div>
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
        @play="playMusic"
        @stop="stopMusic"
        @reveal="revealResults"
        @next-round="nextRound"
      />

      <!-- Main Content -->
      <main class="main-content" :class="{ 'full-page': viewState !== 'game' }">
        <HomeScreen 
          v-if="viewState === 'home'"
          :lastGameId="lastGameId"
          @open-settings="viewState = 'settings'"
          @open-playlists="viewState = 'playlists'"
          @create-game="viewState = 'create-game'"
          @resume-game="resumeGame"
          @run-diagnostics="showDiagnostics = true"
        />

        <CreateGameScreen
          v-else-if="viewState === 'create-game'"
          :preferredSource="preferredSource"
          @back="viewState = 'home'"
          @configure-playlists="onConfigurePlaylists"
          @start-game="createNewGame"
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
            <h3 @click="isPlayersModalOpen = true" style="cursor: pointer; text-decoration: underline;" title="Voir et gérer les joueurs">
              Joueurs connectés ({{ Object.keys(displayedPlayers).length }})
            </h3>
            <span class="status-badge" :class="status">{{ statusDisplay }}</span>
            <div style="margin-left: auto; display: flex; gap: 10px;">
              <button class="btn btn-warning" @click="restartGame">
                Recommencer
              </button>
              <button class="btn btn-danger" @click="endGame" v-if="status !== 'finished'">
                Arrêter la partie
              </button>
            </div>
          </div>

          <LocalTracksView 
            v-if="status === 'waiting' && (currentSource === 'local' || (currentSource === 'soundcloud' && localTracks.length > 0))"
            :localTracks="localTracks"
            :selectedTrack="selectedTrack"
            :currentSource="currentSource"
            :playedTracks="playedTracks"
            @select-track="selectTrack"
          />

          <div v-if="status === 'reviewing'" style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <h3 style="margin: 0; color: #ffc700;">🎵 Attendu : {{ nextTrackInfo.answer || 'Réponse inconnue' }}</h3>
          </div>

          <PlayersGrid 
            v-if="status === 'reviewing'"
            :players="displayedPlayers"
            @award="award"
          />
        </div>

        <!-- Players Modal -->
        <div v-if="isPlayersModalOpen" class="modal-overlay" @click="isPlayersModalOpen = false">
          <div class="modal-content" @click.stop>
            <h2>Gestion des Joueurs</h2>
            <div class="players-list">
              <div v-if="Object.keys(displayedPlayers).length === 0" class="no-players">
                Aucun joueur connecté.
              </div>
              <div v-for="(player, playerId) in displayedPlayers" :key="playerId" class="player-item">
                <div class="player-info-row">
                  <span class="player-name">
                    {{ player.name || 'Anonyme' }}
                    <span v-if="player.blockedTurns === -1" style="color: #ff4d4d; font-size: 0.8em; margin-left: 5px;">(Bloqué)</span>
                    <span v-else-if="player.blockedTurns > 0" style="color: #ffc700; font-size: 0.8em; margin-left: 5px;">(Bloqué {{ player.blockedTurns }} tour(s))</span>
                  </span>
                  <span class="player-score">{{ player.score || 0 }} pts</span>
                </div>
                <div class="player-actions-row">
                  <div class="block-controls">
                    <button class="btn btn-sm btn-warning" @click="setPlayerBlock(playerId as string, 1)" title="Bloquer pour 1 tour">1 Tour</button>
                    <button class="btn btn-sm btn-warning" @click="setPlayerBlock(playerId as string, 3)" title="Bloquer pour 3 tours">3 Tours</button>
                    <button class="btn btn-sm btn-danger" @click="setPlayerBlock(playerId as string, -1)" title="Bloquer indéfiniment">Bloquer</button>
                    <button class="btn btn-sm btn-success" v-if="player.blockedTurns" @click="setPlayerBlock(playerId as string, 0)">Débloquer</button>
                  </div>
                  <button class="btn btn-sm btn-danger" @click="removePlayer(playerId as string)">Supprimer</button>
                </div>
              </div>
            </div>
            <button class="btn secondary" style="width: 100%; margin-top: 20px;" @click="isPlayersModalOpen = false">Fermer</button>
          </div>
        </div>

      </main>

      <DiagnosticsModal 
        v-if="showDiagnostics" 
        @close="showDiagnostics = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import LoginScreen from '../components/control-panel/LoginScreen.vue';
import HomeScreen from '../components/control-panel/HomeScreen.vue';
import SettingsScreen from '../components/control-panel/SettingsScreen.vue';
import CreateGameScreen from '../components/control-panel/CreateGameScreen.vue';
import GameSidebar from '../components/control-panel/GameSidebar.vue';
import LocalTracksView from '../components/control-panel/LocalTracksView.vue';
import PlayersGrid from '../components/control-panel/PlayersGrid.vue';
import PlaylistScreen from '../components/control-panel/PlaylistScreen.vue';
import DiagnosticsModal from '../components/control-panel/DiagnosticsModal.vue';
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
const playedTracks = ref<string[]>([]);
const isProjectorOpen = ref(false);
const showDiagnostics = ref(false);
const isPlayersModalOpen = ref(false);

const gameSettings = ref({ duration: 30, mode: 'text' });

const pendingPoints = ref<Record<string, number>>({});

const displayedPlayers = computed(() => {
  const result: Record<string, any> = {};
  for (const id in players.value) {
    const p = players.value[id];
    result[id] = {
      ...p,
      score: (p.score || 0) + (pendingPoints.value[id] || 0)
    };
  }
  return result;
});


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

const isBackendConnected = ref(true);
let pingInterval: ReturnType<typeof setInterval> | null = null;

const checkBackendConnection = async () => {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/test_connection');
    isBackendConnected.value = res.ok;
  } catch (e) {
    console.warn(e);
    isBackendConnected.value = false;
  }
};

onMounted(() => {
  // Start connection monitor
  checkBackendConnection();
  pingInterval = setInterval(checkBackendConnection, 4000);
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
      console.warn(e);
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

const sanitizeTracks = (tracks: any[]): Track[] => {
  return tracks.map(t => {
    if (t.id && t.source) return t;
    
    let source = 'soundcloud';
    if (t.url && (t.url.includes('youtube') || t.url.includes('youtu.be'))) source = 'youtube';
    
    let id = t.url;
    if (source === 'youtube' && t.url) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = t.url.match(regExp);
      if (match && match[2].length === 11) {
        id = match[2];
      }
    }
    
    return {
      ...t,
      id: t.id || id || String(Math.random()),
      source: t.source || source
    };
  });
};

const createNewGame = async (settings: any) => {
  if (settings) {
    gameSettings.value = {
      duration: settings.duration,
      mode: settings.mode
    };
  }

  if (lastGameId.value) {
    try {
      await animatorService.deleteGame(lastGameId.value);
    } catch (e) {
      console.warn("Could not delete previous game", e);
    }
  }

  const game = await animatorService.createGame();
  gameId.value = game.gameId;
  gameSecret.value = game.secret;
  status.value = 'waiting';
  currentSource.value = preferredSource.value;
  viewState.value = 'game';
  
  if (musicManager.activeProviderName !== currentSource.value) {
    try {
      await musicManager.setProvider(currentSource.value);
    } catch(e) {
      console.warn("Could not set music provider", e);
    }
  }
  
  playedTracks.value = [];
  if (currentSource.value === 'local') {
    localTracks.value = settings?.localTracks || [];
  } else {
    localTracks.value = (settings && settings.playlist) ? sanitizeTracks(settings.playlist.tracks) : [];
  }
  
  try {
    await fetch('http://127.0.0.1:5000/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ localTracks: localTracks.value, playedTracks: [], settings: gameSettings.value })
    });
  } catch (e) {
    console.warn("Could not save game.json", e);
  }
  
  try {
    await fetch('http://127.0.0.1:5000/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        lastGameId: game.gameId
      })
    });
    lastGameId.value = game.gameId;
  } catch (e) {
    console.warn("Could not save lastGameId to backend", e);
  }
  
  animatorService.listenToPlayers(gameId.value, (newPlayers) => {
    players.value = newPlayers;
  });
};

const resumeGame = async () => {
  if (!lastGameId.value) return;
  gameId.value = lastGameId.value;
  
  try {
    const gameData = await animatorService.getGame(gameId.value);
    if (gameData && gameData.status) {
      status.value = gameData.status;
    } else {
      status.value = 'waiting';
    }
  } catch (e) {
    console.warn("Could not fetch game status from Firebase, falling back to 'waiting'", e);
    status.value = 'waiting';
  }
  
  currentSource.value = preferredSource.value;
  viewState.value = 'game';
  
  try {
    const res = await fetch('http://127.0.0.1:5000/api/game');
    const data = await res.json();
    if (data.localTracks) localTracks.value = data.localTracks;
    if (data.playedTracks) playedTracks.value = data.playedTracks;
    if (data.settings) gameSettings.value = data.settings;
  } catch(e) {
    console.warn("Could not load game.json", e);
  }
  
  animatorService.listenToPlayers(gameId.value, (newPlayers) => {
    players.value = newPlayers;
  });
};

const leaveGame = async () => {
  if (isProjectorOpen.value) {
    await toggleProjector();
  }
  try {
    await musicManager.stop();
  } catch(e) {
    console.warn(e);
  }
  gameId.value = '';
  selectedTrack.value = null;
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
      console.warn(e);
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



const selectTrack = (track: Track) => {
  selectedTrack.value = track;
  nextTrackInfo.value.answer = `${track.title} - ${track.artist}`;
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
      duration: gameSettings.value.duration * 1000,
      answer: nextTrackInfo.value.answer,
      mode: gameSettings.value.mode
    });
    
    if (!playedTracks.value.includes(selectedTrack.value.id)) {
      playedTracks.value.push(selectedTrack.value.id);
      try {
        await fetch('http://127.0.0.1:5000/api/game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ localTracks: localTracks.value, playedTracks: playedTracks.value, settings: gameSettings.value })
        });
      } catch(e) {
        console.warn(e);
      }
    }
    
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
  // Decrement blocked turns after the round has been played/missed
  await animatorService.decrementBlockedTurns(gameId.value);
};

let autoStopTimer: ReturnType<typeof setTimeout> | null = null;

watch(() => status.value, (newStatus) => {
  if (newStatus === 'playing') {
    if (autoStopTimer) clearTimeout(autoStopTimer);
    const checkTimer = () => {
      if (status.value !== 'playing') return;
      const now = getServerTime();
      if (currentStartTime && now >= currentStartTime + (gameSettings.value.duration * 1000)) {
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

const award = (playerId: string, points: number) => {
  if (points !== 0) {
    const currentScore = players.value[playerId]?.score || 0;
    const currentPending = pendingPoints.value[playerId] || 0;
    if (currentScore + currentPending + points >= 0) {
      pendingPoints.value = {
        ...pendingPoints.value,
        [playerId]: currentPending + points
      };
    }
  }
};

const applyPendingPoints = async () => {
  for (const [playerId, points] of Object.entries(pendingPoints.value)) {
    if (points !== 0) {
      await animatorService.awardPoints(gameId.value, playerId, points);
    }
  }
  pendingPoints.value = {};
};

const revealResults = async () => {
  status.value = 'results';
  await applyPendingPoints();
  await animatorService.updateGameState(gameId.value, 'results');
};

const nextRound = async () => {
  status.value = 'waiting';
  nextTrackInfo.value.answer = '';
  searchQuery.value = '';
  pendingPoints.value = {};
  
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
    pendingPoints.value = {};
    
    try {
      await animatorService.resetPlayers(gameId.value);
    } catch (e) {
      console.warn("Could not reset players", e);
    }
    await animatorService.updateGameState(gameId.value, 'waiting', null);
  }
};

const removePlayer = async (playerId: string) => {
  if (confirm('Voulez-vous vraiment supprimer ce joueur ?')) {
    try {
      await animatorService.removePlayer(gameId.value, playerId);
    } catch(e) {
      console.error("Impossible de supprimer le joueur:", e);
    }
  }
};

const setPlayerBlock = async (playerId: string, turns: number) => {
  try {
    await animatorService.setPlayerBlock(gameId.value, playerId, turns);
  } catch(e) {
    console.error("Impossible de modifier le blocage du joueur:", e);
  }
};

onUnmounted(() => {
  if (pingInterval) {
    clearInterval(pingInterval);
  }
});
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: #1e1e2d;
  padding: 30px;
  border-radius: 12px;
  width: 600px;
  max-width: 95vw;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.1);
}
.modal-content h2 {
  margin-bottom: 20px;
  text-align: center;
  color: #fff;
}
.players-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 50vh;
  overflow-y: auto;
}
.player-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #2b2b40;
  padding: 15px;
  border-radius: 8px;
}
.player-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.player-actions-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 15px;
}
.block-controls {
  display: flex;
  gap: 8px;
  flex: 1;
}
.block-controls button {
  flex: 1;
  white-space: nowrap;
}
.player-name {
  font-weight: 600;
  flex: 1;
}
.player-score {
  margin-right: 15px;
  color: #ffc700;
  font-weight: bold;
}
.no-players {
  text-align: center;
  color: #888;
  font-style: italic;
  padding: 20px;
}

.backend-warning-banner {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  background: #ff4d4d;
  color: white;
  padding: 12px;
  text-align: center;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  z-index: 99999;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  font-size: 14px;
}
.warning-icon {
  font-size: 18px;
  animation: warning-blink 1s infinite alternate;
}
@keyframes warning-blink {
  from { opacity: 0.5; }
  to { opacity: 1; }
}
</style>
