<template>
  <div class="flex w-full h-screen bg-muted/30 text-foreground overflow-hidden font-sans">
    <!-- Disconnection Warning Banner -->
    <div v-if="!isBackendConnected" class="fixed top-0 left-0 w-full bg-red-500 text-white p-3 text-center font-bold flex justify-center items-center gap-2 z-50 shadow-md text-sm">
      <span class="animate-pulse text-lg">⚠️</span>
      <span>Impossible de contacter le serveur local (backend). Assurez-vous que l'application de bureau est bien lancée.</span>
    </div>
    <!-- Login Screen -->
    <LoginScreen 
      v-if="!isLoggedIn" 
      :error="loginError"
      @login="login" 
      class="w-full h-full"
    />

    <!-- Main App -->
    <div v-else class="flex w-full h-full">
      <GameSidebar 
        v-if="viewState === 'game'"
        :status="status"
        :currentSource="currentSource"
        :isProjectorOpen="isProjectorOpen"
        v-model:searchQuery="searchQuery"
        v-model:nextTrackInfo="nextTrackInfo"
        :localTracks="localTracks"
        :selectedTrack="selectedTrack"
        :gameMode="gameSettings.mode"
        :hasBuzzed="hasBuzzed"
        :lastPlayedTrack="lastPlayedTrack"
        :players="displayedPlayers"
        @toggle-projector="toggleProjector"
        @leave-game="leaveGame"
        @configure-playlists="onConfigurePlaylists"
        @play="playMusic"
        @stop="stopMusic"
        @reveal="revealResults"
        @next-round="nextRound"
        @resume-music="resumeMusic"
        @correct-buzzer="correctBuzzer"
        @auto-correct="autoCorrect"
      />

      <!-- Main Content -->
      <main :class="['flex-1 overflow-y-auto relative', viewState !== 'game' ? 'p-0' : 'p-8']">
        <HomeScreen 
          v-if="viewState === 'home'"
          :lastGameId="lastGameId || ''"
          @open-settings="viewState = 'settings'"
          @open-playlists="viewState = 'playlists'"
          @create-game="viewState = 'create-game'"
          @resume-game="resumeGame"
          @run-diagnostics="showDiagnostics = true"
          @logout="logout"
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
          @logout="logout"
        />

        <PlaylistScreen 
          v-else-if="viewState === 'playlists'"
          @back="viewState = 'home'"
        />

        <div v-else-if="viewState === 'game' && gameId" class="flex flex-col gap-6">
          <div class="flex items-center justify-between mb-2 pb-4 border-b border-[rgba(0,0,0,0.05)]">
            <div class="flex items-center gap-3">
              <Badge :color="status === 'waiting' ? 'gray' : status === 'playing' ? 'blue' : status === 'reviewing' ? 'green' : status === 'results' ? 'pink' : 'gray'" class="px-3 py-1 text-xs uppercase tracking-wider">{{ statusDisplay }}</Badge>
            </div>
            <div class="ml-auto flex items-center gap-3">
              <button @click="isPlayersModalOpen = true" class="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-sm hover:bg-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 font-semibold text-primary">
                <Users class="w-5 h-5" /> 
                <span>{{ Object.keys(displayedPlayers).length }} joueurs</span>
                <span class="w-2 h-2 rounded-full bg-emerald-400 ml-1"></span>
              </button>
              <Btn variant="ghost-orange" @click="restartGame">
                <RefreshCw class="w-4 h-4 mr-2" /> Recommencer
              </Btn>
              <Btn variant="ghost-red" @click="endGame" v-if="status !== 'finished'">
                <Square class="w-4 h-4 mr-2" /> Arrêter
              </Btn>
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

          <div v-if="status === 'reviewing'" class="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl flex flex-wrap items-center justify-center gap-6 mb-4 shadow-sm">
            <h3 class="text-xl font-bold text-blue-700 m-0 flex items-center gap-2">
              🎵 Attendu : <span class="px-3 py-1 bg-white rounded-lg border border-blue-200 shadow-sm ml-2">{{ nextTrackInfo.answer || 'Réponse inconnue' }}</span>
            </h3>
            <Btn v-if="gameSettings.mode === 'text'" variant="blue" className="font-bold shadow-md" @click="autoCorrect">
              <Wand2 class="w-4 h-4 mr-2" /> Auto-correction
            </Btn>
          </div>

          <PlayersGrid 
            v-if="status === 'reviewing'"
            :players="displayedPlayers"
            :gameMode="gameSettings.mode"
            @award="award"
          />

          <!-- PLAYING VIEW -->
          <div v-if="status === 'playing'" class="flex flex-col gap-6 animate-in fade-in duration-300">
            <!-- Top Bar: Now Playing & Timer -->
            <div class="bg-white p-6 rounded-3xl border border-[rgba(0,0,0,0.06)] shadow-sm flex flex-col gap-4">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                    <Music class="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h2 class="text-xl font-bold text-primary">Lecture en cours...</h2>
                  </div>
                </div>
                <div class="text-3xl font-black text-primary font-mono bg-slate-50 px-4 py-2 rounded-xl">
                  {{ musicTimeLeft }}s
                </div>
              </div>
              <!-- Progress Bar -->
              <div class="h-3 bg-gray-100 rounded-full overflow-hidden relative">
                <div class="absolute top-0 left-0 h-full bg-[#FFBA49] transition-all duration-100 ease-linear" :style="{ width: musicProgress + '%' }"></div>
                <div v-if="gameSettings.duration > 0" class="absolute top-0 h-full w-1 bg-red-400 z-10 rounded-full" :style="{ left: (gameSettings.musicDuration / gameSettings.duration * 100) + '%' }" title="Coupure du son"></div>
              </div>
            </div>

            <!-- Buzzer Alert (Buzzer Mode) -->
            <div v-if="gameSettings.mode === 'buzzer' && currentBuzzer" class="flex-1 bg-red-50 border-2 border-red-200 p-8 rounded-3xl flex flex-col items-center justify-center text-center shadow-inner animate-in zoom-in-95 duration-200">
              <div class="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white shadow-xl mb-6 animate-bounce">
                <Zap class="w-10 h-10 fill-current" />
              </div>
              <h2 class="text-4xl font-black text-red-600 mb-2">{{ displayedPlayers[currentBuzzer.playerId]?.name || 'Un joueur' }} a buzzé !</h2>
              <p class="text-red-500/80 font-bold text-xl">La musique est en pause. À lui de donner la réponse !</p>
            </div>

            <!-- Players Grid (Text Mode) -->
            <div v-if="gameSettings.mode === 'text'" class="flex-1 bg-white p-6 rounded-3xl border border-[rgba(0,0,0,0.06)] shadow-sm">
              <h3 class="font-bold text-primary mb-4 flex items-center gap-2">
                <Users class="w-5 h-5 text-muted-foreground" /> Statut des joueurs en direct
              </h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                <div v-for="player in displayedPlayers" :key="player.id" 
                     :class="['p-3 rounded-xl border flex items-center gap-3 transition-colors', 
                              player.blockedTurns && player.blockedTurns > 0 ? 'bg-red-50 border-red-200' :
                              player.hasAnswered ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200']">
                  <div :class="['w-8 h-8 rounded-full flex items-center justify-center shrink-0', 
                                player.blockedTurns && player.blockedTurns > 0 ? 'bg-red-200 text-red-500' :
                                player.hasAnswered ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400']">
                    <Ban v-if="player.blockedTurns && player.blockedTurns > 0" class="w-4 h-4" />
                    <Check v-else-if="player.hasAnswered" class="w-4 h-4" />
                    <Loader2 v-else class="w-4 h-4 animate-spin" />
                  </div>
                  <span :class="['font-bold truncate', 
                                 player.blockedTurns && player.blockedTurns > 0 ? 'text-red-700 line-through opacity-70' :
                                 player.hasAnswered ? 'text-emerald-700' : 'text-gray-500']">
                    {{ player.name }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- RESULTS VIEW -->
          <div v-if="status === 'results'" class="flex flex-col gap-6 animate-in fade-in duration-300">
            <!-- Points Winners -->
            <div class="flex-1 bg-white p-6 rounded-3xl border border-[rgba(0,0,0,0.06)] shadow-sm">
              <h3 class="font-bold text-primary mb-6 flex items-center gap-2">
                <Trophy class="w-5 h-5 text-yellow-500" /> Points remportés (cette manche)
              </h3>
              
              <div class="grid gap-3">
                <div v-for="player in playersWhoWonPoints" :key="player.id" class="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div class="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">
                    +{{ player.pointsGained }}
                  </div>
                  <div class="flex-1">
                    <h4 class="font-bold text-lg text-emerald-900 m-0">{{ player.name }}</h4>
                  </div>
                  <div class="flex flex-col items-end">
                    <div class="font-black text-xl text-emerald-700">{{ player.score }} pts (Total)</div>
                  </div>
                </div>
                <div v-if="playersWhoWonPoints.length === 0" class="text-center text-muted-foreground py-8 italic bg-gray-50 rounded-xl border border-gray-100">
                  Personne n'a remporté de points sur cette manche...
                </div>
              </div>
              
            </div>
          </div>
        </div>

        <!-- Players Modal -->
        <Modal v-if="isPlayersModalOpen" @close="isPlayersModalOpen = false" maxW="max-w-2xl">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-[#fff6e0] rounded-xl flex items-center justify-center shadow-sm">
                  <Users class="w-5 h-5 text-[#FFBA49]" />
                </div>
                <h2 class="text-2xl font-bold text-primary">Gestion des Joueurs</h2>
              </div>
              <button @click="isPlayersModalOpen = false" class="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"><X class="w-5 h-5" /></button>
            </div>
            
            <div class="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-2">
              <div v-if="Object.keys(displayedPlayers).length === 0" class="text-center p-8 bg-muted/50 rounded-xl border border-dashed border-muted-foreground/30 text-muted-foreground font-medium italic">
                Aucun joueur connecté.
              </div>
              <div v-for="(player, playerId) in displayedPlayers" :key="playerId" :class="['rounded-xl border p-4 flex flex-col gap-3', player.blockedTurns ? 'border-red-200 bg-red-50/50' : 'border-[rgba(0,0,0,0.08)] bg-[#f5f6fa]']">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-primary text-lg">{{ player.name || 'Anonyme' }}</span>
                    <Badge v-if="player.blockedTurns === -1" color="red">Bloqué définitivement</Badge>
                    <Badge v-else-if="player.blockedTurns > 0" color="red">Bloqué ({{ player.blockedTurns }} tour(s))</Badge>
                  </div>
                  <span class="font-black text-[#FFBA49] tabular-nums text-lg">{{ player.score || 0 }} pts</span>
                </div>
                
                <div class="flex gap-2 flex-wrap items-center justify-between mt-1">
                  <div class="flex flex-wrap gap-2">
                    <Btn variant="secondary" size="sm" @click="setPlayerBlock(playerId as string, 1)" title="Bloquer pour 1 tour">+1 Tour</Btn>
                    <Btn variant="secondary" size="sm" @click="setPlayerBlock(playerId as string, 3)" title="Bloquer pour 3 tours">+3 Tours</Btn>
                    <Btn :variant="player.blockedTurns ? 'success' : 'danger'" size="sm" @click="setPlayerBlock(playerId as string, player.blockedTurns ? 0 : -1)">
                      {{ player.blockedTurns ? 'Débloquer' : 'Bloquer définitivement' }}
                    </Btn>
                  </div>
                  <Btn variant="danger" size="sm" @click="removePlayer(playerId as string)">Supprimer</Btn>
                </div>
              </div>
            </div>
            
            <div class="flex justify-end mt-6">
              <Btn variant="dark" size="md" @click="isPlayersModalOpen = false">Fermer</Btn>
            </div>
          </div>
        </Modal>

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
import { Users, X, RefreshCw, Square, Wand2, Music, Zap, Check, Loader2, Trophy, Ban } from '@lucide/vue';
import Btn from '../components/ui/Btn.vue';
import Badge from '../components/ui/Badge.vue';
import Modal from '../components/ui/Modal.vue';
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
import { useDialog } from '../composables/useDialog';

const { showAlert, showConfirm } = useDialog();

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

const currentBuzzer = ref<any>(null);

const hasBuzzed = computed(() => {
  if (gameSettings.value.mode !== 'buzzer') return false;
  return !!currentBuzzer.value;
});



const isPlayersModalOpen = ref(false);

const gameSettings = ref({ blockDuration: 0, musicDuration: 15, duration: 30, mode: 'text' });

const pendingPoints = ref<Record<string, number>>({});
const lastAwardedPoints = ref<Record<string, number>>({});

const displayedPlayers = computed(() => {
  const result: Record<string, any> = {};
  for (const id in players.value) {
    const p = players.value[id];
    if (p.role === 'animator' || p.role === 'projector') continue;
    
    let guess = p.currentGuess;
    
    if (gameSettings.value.mode === 'buzzer' && currentBuzzer.value && currentBuzzer.value.playerId === id) {
      guess = {
        title: 'BUZZ',
        artist: 'Appuyé !',
        submittedAt: currentBuzzer.value.submittedAt
      };
    }
    
    result[id] = {
      ...p,
      currentGuess: guess,
      score: (p.score || 0) + (pendingPoints.value[id] || 0),
      pendingPoints: pendingPoints.value[id] || 0
    };
  }
  return result;
});



const playersWhoWonPoints = computed(() => {
  const result = [];
  for (const [id, points] of Object.entries(lastAwardedPoints.value)) {
    if (points > 0 && players.value[id]) {
      result.push({
        id,
        name: players.value[id].name,
        score: players.value[id].score,
        pointsGained: points
      });
    }
  }
  return result.sort((a, b) => b.pointsGained - a.pointsGained);
});

const lastPlayedTrack = computed(() => {
  if (playedTracks.value.length === 0) return null;
  const lastId = playedTracks.value[playedTracks.value.length - 1];
  return localTracks.value.find(t => t.id === lastId) || null;
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

const musicProgress = ref(0);
const musicTimeLeft = ref(0);
let animationFrameId: number | null = null;
const preferredSource = ref('soundcloud');
const lastGameId = ref<string | null>(localStorage.getItem('minihost_last_game'));

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




const logout = async () => {
  if (await showConfirm({ title: "Se déconnecter ?", message: "Vous devrez vous reconnecter pour utiliser la régie.", confirmText: "Déconnexion", confirmVariant: "danger" })) {
    email.value = '';
    password.value = '';
    
    try {
      await fetch('http://127.0.0.1:5000/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: null, password: null })
      });
    } catch {
      console.warn("Could not clear credentials from config.json");
    }
    
    // We try to sign out from firebase if we were authenticated
    try {
      if (typeof animatorService.signOut === 'function') {
        await animatorService.signOut();
      }
    } catch (e) {
      console.warn(e);
    }
    
    isLoggedIn.value = false;
    viewState.value = 'home';
  }
};

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
      blockDuration: settings.blockDuration || 0,
      musicDuration: settings.musicDuration || 15,
      duration: settings.duration,
      mode: settings.mode
    };
  }

  if (lastGameId.value) {
    try {
      await animatorService.deleteGame(lastGameId.value);
    } catch {
      console.warn("Could not delete previous game");
    }
  }

  const game = await animatorService.createGame(gameSettings.value);
  gameId.value = game.gameId;
  gameSecret.value = game.secret;
  status.value = 'waiting';
  currentSource.value = preferredSource.value;
  viewState.value = 'game';
  
  if (musicManager.activeProviderName !== currentSource.value) {
    try {
      await musicManager.setProvider(currentSource.value);
    } catch {
      console.warn("Could not set music provider");
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
  } catch {
    console.warn("Could not save game.json");
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
  } catch {
    console.warn("Could not save lastGameId to backend");
  }
  
  animatorService.listenToPlayers(gameId.value, (newPlayers) => {
    players.value = newPlayers;
  });
  animatorService.listenToBuzzer(gameId.value, (buzzerData) => {
    currentBuzzer.value = buzzerData;
  });
};

const resumeGame = async () => {
  if (!lastGameId.value) return;
  gameId.value = lastGameId.value;
  
  try {
    const gameData = await animatorService.getGame(gameId.value);
    
    if (!gameData) {
      await showAlert({ title: "Partie introuvable", message: "Cette partie n'existe plus !" });
      lastGameId.value = null;
      return;
    }

    if (gameData.status) {
      status.value = gameData.status;
    } else {
      status.value = 'waiting';
    }
  } catch {
    console.warn("Could not fetch game status from Firebase, falling back to 'waiting'");
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
  } catch {
    console.warn("Could not load game.json");
  }
  
  animatorService.listenToPlayers(gameId.value, (newPlayers) => {
    players.value = newPlayers;
  });
  animatorService.listenToBuzzer(gameId.value, (buzzerData) => {
    currentBuzzer.value = buzzerData;
  });
};

const leaveGame = async () => {
  if (isProjectorOpen.value) {
    await toggleProjector();
  }
  try {
    await musicManager.stop();
  } catch {
    console.warn("Could not stop music");
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
  } catch {
    console.warn("Could not save settings to backend");
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
    } catch {
      console.warn("Could not open projector via backend");
      window.open(`/public?game=${gameId.value}`, '_blank', 'width=1280,height=720');
    }
    isProjectorOpen.value = true;
  } else {
    try {
      await fetch('http://127.0.0.1:5000/api/projector/close', {
        method: 'POST'
      });
    } catch {
      console.warn("Could not close projector via backend");
    }
    isProjectorOpen.value = false;
  }
};



const selectTrack = (track: Track) => {
  selectedTrack.value = track;
  nextTrackInfo.value.answer = `${track.title} - ${track.artist}`;
};

let currentStartTime = 0;
let hasMusicStopped = false;

const playMusic = async () => {
  if (!selectedTrack.value) return;
  
  try {
    console.log("startGame triggered with track:", selectedTrack.value);
    
    // Unlock audio context safely
    if (typeof musicManager.activate === 'function') {
      console.log("Activating music manager...");
      musicManager.activate().catch(() => console.warn("Activate error"));
    }
    
    console.log("Setting status to playing...");
    status.value = 'playing';
    const delay = 3000;
    const startTime = getServerTime() + delay;
    currentStartTime = startTime;
    
    await animatorService.clearCurrentBuzzer(gameId.value);

    hasMusicStopped = false;

    await animatorService.updateGameState(gameId.value, 'playing', {
      startTime: startTime,
      duration: gameSettings.value.duration * 1000,
      musicDuration: gameSettings.value.musicDuration * 1000,
      blockDuration: (gameSettings.value.blockDuration || 0) * 1000,
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
      } catch {
        console.warn("Could not save played tracks");
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
      await showAlert({ title: "Erreur de lecture", message: "Erreur de lecture : " + err.message });
      stopMusic();
    }
  } catch (err: any) {
    await showAlert({ title: "Erreur lors du lancement", message: "Erreur lors du lancement : " + err.message });
  }
};

const stopMusic = async () => {
  await musicManager.stop();
  status.value = 'reviewing';
  await animatorService.updateGameState(gameId.value, 'reviewing');
};

const pauseMusic = async () => {
  await musicManager.pause();
  status.value = 'reviewing';
  await animatorService.updateGameState(gameId.value, 'reviewing');
};

const resumeMusic = async () => {
  let playerIdToBlock = null;
  if (gameSettings.value.mode === 'buzzer' && currentBuzzer.value) {
    playerIdToBlock = currentBuzzer.value.playerId;
  }

  if (playerIdToBlock) {
    await setPlayerBlock(playerIdToBlock, 1);
    await animatorService.clearPlayerGuess(gameId.value, playerIdToBlock);
    await animatorService.clearCurrentBuzzer(gameId.value);
  }
  
  status.value = 'playing';
  await animatorService.updateGameState(gameId.value, 'playing');
  
  const now = getServerTime();
  if (currentStartTime && now >= currentStartTime + (gameSettings.value.musicDuration * 1000)) {
    hasMusicStopped = true;
  }
  
  if (!hasMusicStopped) {
    await musicManager.resume();
  }
};

const correctBuzzer = async () => {
  let playerIdToReward = null;
  if (gameSettings.value.mode === 'buzzer' && currentBuzzer.value) {
    playerIdToReward = currentBuzzer.value.playerId;
  }
  
  if (playerIdToReward) {
    award(playerIdToReward, 1);
  }
  
  await revealResults();
};

const autoCorrect = () => {
  if (!nextTrackInfo.value.answer) return;
  const target = nextTrackInfo.value.answer.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  for (const id in players.value) {
    const guess = players.value[id]?.currentGuess;
    if (guess && guess.title) {
      const gTitle = guess.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      const gArtist = (guess.artist || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      
      const guessFull = gTitle + gArtist;
      
      // Basic fuzzy check: if the target includes the main part of the title or vice versa
      if (gTitle.length > 2 && (target.includes(gTitle) || gTitle.includes(target))) {
        if (!pendingPoints.value[id]) award(id, 1);
      } else if (guessFull.length > 2 && (target.includes(guessFull) || guessFull.includes(target))) {
        if (!pendingPoints.value[id]) award(id, 1);
      }
    }
  }
};

let autoStopTimer: ReturnType<typeof setTimeout> | null = null;

const startProgressLoop = () => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  
  const loop = () => {
    if (status.value !== 'playing') return;
    
    const now = getServerTime();
    if (currentStartTime) {
      const elapsed = now - currentStartTime;
      const total = gameSettings.value.duration * 1000;
      musicProgress.value = Math.min(100, Math.max(0, (elapsed / total) * 100));
      musicTimeLeft.value = Math.max(0, Math.ceil((total - elapsed) / 1000));
    }
    
    animationFrameId = requestAnimationFrame(loop);
  };
  
  loop();
};

watch(() => status.value, (newStatus) => {
  if (newStatus === 'playing') {
    startProgressLoop();
    if (autoStopTimer) clearTimeout(autoStopTimer);
    const checkTimer = () => {
      if (status.value !== 'playing') return;
      const now = getServerTime();
      
      if (currentStartTime && !hasMusicStopped && now >= currentStartTime + (gameSettings.value.musicDuration * 1000)) {
        musicManager.pause();
        hasMusicStopped = true;
      }

      if (currentStartTime && now >= currentStartTime + (gameSettings.value.duration * 1000)) {
        stopMusic();
      } else {
        autoStopTimer = setTimeout(checkTimer, 500);
      }
    };
    checkTimer();
  } else {
    if (autoStopTimer) clearTimeout(autoStopTimer);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  }
});

watch(() => currentBuzzer.value, (newBuzzer) => {
  if (status.value === 'playing' && newBuzzer && gameSettings.value.mode === 'buzzer') {
    pauseMusic();
  }
});

watch(() => players.value, (newPlayers) => {
  if (status.value === 'playing' && newPlayers) {
    const playerIds = Object.keys(newPlayers);
    if (playerIds.length > 0) {
      if (gameSettings.value.mode === 'buzzer') {
        const allBlocked = playerIds.every(id => {
          const p = (newPlayers as Record<string, any>)[id];
          return p.blockedTurns === -1 || p.blockedTurns > 0;
        });
        if (allBlocked && playerIds.length > 0) {
          stopMusic();
        }
      } else {
        const allSubmitted = playerIds.every(id => (newPlayers as Record<string, any>)[id].currentGuess);
        if (allSubmitted) {
          stopMusic();
        }
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
  lastAwardedPoints.value = { ...pendingPoints.value };
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
  
  // Decrement blocked turns when the round is fully revealed/finished
  await animatorService.decrementBlockedTurns(gameId.value);
};

const nextRound = async () => {
  status.value = 'waiting';
  nextTrackInfo.value.answer = '';
  searchQuery.value = '';
  pendingPoints.value = {};
  
  try {
    await animatorService.clearPlayerAnswers(gameId.value);
  } catch {
    console.warn("Could not clear player answers");
  }
  selectedTrack.value = null;
  await animatorService.updateGameState(gameId.value, 'waiting');
};

const endGame = async () => {
  if (await showConfirm({ title: "Arrêter la partie ?", message: "La partie sera définitivement terminée et vous serez redirigé vers les résultats finaux.", confirmText: "Arrêter", confirmVariant: "danger" })) {
    status.value = 'finished';
    try { await musicManager.stop(); } catch { console.warn("Could not stop music"); }
    await animatorService.updateGameState(gameId.value, 'finished');
  }
};

const restartGame = async () => {
  if (await showConfirm({ title: "Recommencer la partie ?", message: "Voulez-vous vraiment recommencer la partie à zéro ? Les joueurs connectés seront conservés.", confirmText: "Recommencer", confirmVariant: "primary" })) {
    status.value = 'waiting';
    try { await musicManager.stop(); } catch { console.warn("Could not stop music"); }
    nextTrackInfo.value.answer = '';
    searchQuery.value = '';
    selectedTrack.value = null;
    pendingPoints.value = {};
    
    try {
      await animatorService.resetPlayers(gameId.value);
    } catch {
      console.warn("Could not reset players");
    }
    await animatorService.updateGameState(gameId.value, 'waiting', null);
    
    playedTracks.value = [];
    try {
      await fetch('http://127.0.0.1:5000/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localTracks: localTracks.value, playedTracks: [], settings: gameSettings.value })
      });
    } catch(e) {
      console.warn("Could not reset game.json", e);
    }
  }
};

const removePlayer = async (playerId: string) => {
  if (await showConfirm({ title: "Supprimer le joueur ?", message: "Voulez-vous vraiment expulser ce joueur de la partie ?", confirmText: "Supprimer", confirmVariant: "danger" })) {
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


