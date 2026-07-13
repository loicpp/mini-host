<template>
  <div id="app" class="app-container">
    <div class="app-version">v{{ version }}</div>
    <header>
      <h1>🎶 Blind Test</h1>
    </header>

    <main>
      <!-- Error messages -->
      <div v-if="error" class="error-banner">{{ error }}</div>

      <!-- State: Loading -->
      <div v-if="state === 'loading'" class="loading-spinner">
        <div class="spinner"></div>
        <p>Connexion en cours...</p>
      </div>

      <!-- State: Login -->
      <div v-else-if="state === 'login'">
        <Login @join="handleJoin" :gameId="gameId" />
      </div>

      <!-- State: Game Room -->
      <div v-else-if="state === 'in-game'">
        <GameRoom 
          :game="game" 
          :playerId="playerId" 
          @submit="handleGuess" 
          @buzz="handleBuzz"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { gameService } from './services/gameService';
import Login from './components/Login.vue';
import GameRoom from './components/GameRoom.vue';

const state = ref('loading');
const error = ref('');
const gameId = ref('');
const secret = ref('');
const playerId = ref('');
const game = ref(null);
const version = import.meta.env.VITE_APP_VERSION || '0.0.0';

onMounted(async () => {
  // Extract gameId and secret from URL e.g. ?game=1234&secret=abcd
  const params = new URLSearchParams(window.location.search);
  const id = params.get('game');
  const sec = params.get('secret');
  
  if (!id || !sec) {
    error.value = "Lien invalide. Veuillez scanner le QR code de l'animateur.";
    state.value = 'error';
    return;
  }
  
  gameId.value = id;
  secret.value = sec;

  try {
    // Authenticate anonymously (restores existing session if available)
    await gameService.signIn();
    
    // Start listening to the game state immediately
    gameService.listenToGame(gameId.value, (newGameState) => {
      if (newGameState) {
        game.value = newGameState;
        
        // Check if player is already registered in this game
        const uid = gameService.getCurrentUserId();
        if (uid && newGameState.players && newGameState.players[uid]) {
          playerId.value = uid;
          state.value = 'in-game';
          error.value = '';
        } else if (state.value === 'loading' || state.value === 'error') {
          // If not registered, show login screen
          state.value = 'login';
        }
      } else {
        error.value = "La partie a été fermée par l'animateur.";
        state.value = 'error';
      }
    });
  } catch (e) {
    error.value = "Impossible de se connecter au serveur.";
    state.value = 'error';
  }
});

const handleJoin = async (playerName) => {
  try {
    state.value = 'loading';
    error.value = '';
    
    // Pass the secret to the database. If it's wrong, Firebase rules will reject the write.
    playerId.value = await gameService.joinGame(gameId.value, secret.value, playerName);
    // The listenToGame callback will automatically switch state to 'in-game' once the DB updates
  } catch (e) {
    console.error(e);
    error.value = "Code secret invalide ou partie inexistante. Veuillez rescanner le QR Code.";
    state.value = 'login';
  }
};

const handleGuess = async (guess) => {
  try {
    await gameService.submitGuess(gameId.value, guess.title, guess.artist);
  } catch (e) {
    console.error("Failed to submit guess:", e);
  }
};

const handleBuzz = async (callback) => {
  try {
    const success = await gameService.buzz(gameId.value);
    callback(success);
  } catch (e) {
    console.error("Failed to buzz:", e);
    callback(false);
  }
};
</script>

<style>
/* Global CSS in style.css */
.error-banner {
  background: var(--danger-color, #ff1744);
  color: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: bold;
}
.app-version {
  position: absolute;
  top: 10px;
  right: 15px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.8rem;
  font-weight: bold;
  z-index: 100;
}
</style>
