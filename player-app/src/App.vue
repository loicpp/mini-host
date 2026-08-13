<template>
  <div class="min-h-screen bg-[#f5f6fa] dark:bg-background flex items-start justify-center p-4 pt-8 md:pt-16 font-sans text-foreground">
    <div class="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[rgba(0,0,0,0.05)] overflow-hidden relative">
      <div class="absolute top-3 right-4 text-xs font-bold text-muted-foreground z-10">v{{ version }}</div>
      
      <!-- Header -->
      <header class="pt-8 pb-4 text-center relative">
        <div class="absolute top-3 left-4 z-10">
          <select v-model="$i18n.locale" class="bg-transparent text-xs font-bold text-muted-foreground outline-none cursor-pointer">
            <option value="fr">FR</option>
            <option value="en">EN</option>
          </select>
        </div>
        <h1 class="text-3xl font-black text-primary tracking-tight flex items-center justify-center gap-2">
          <img src="/blindtest.svg" alt="logo" class="w-8 h-8" /> Blind Test
        </h1>
      </header>

      <main class="p-6 pt-2">
        <!-- Error messages -->
        <div v-if="error" class="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-semibold border border-red-100 flex items-center gap-2">
          <span>⚠️</span> {{ error }}
        </div>

        <!-- State: Loading -->
        <div v-if="state === 'loading'" class="flex flex-col items-center justify-center py-10 gap-4">
          <div class="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
          <p class="text-muted-foreground font-medium">{{ $t('app.loading') }}</p>
        </div>

        <!-- State: Login -->
        <div v-else-if="state === 'login'">
          <Login @join="handleJoin" :gameId="gameId" />
        </div>

        <!-- State: Game Room -->
        <div v-else-if="state === 'in-game'">
          <component 
            :is="activePlayerComponent"
            :game="game" 
            :playerId="playerId" 
            @submit="handleGuess" 
            @buzz="handleBuzz"
          />
        </div>
      </main>
      
      <footer class="pb-6 text-center">
        <button @click="showLicenses = true" class="text-xs text-muted-foreground hover:text-primary underline underline-offset-2 transition-colors">
          {{ $t('app.licenses') }}
        </button>
      </footer>
      
      <LicensesModal v-if="showLicenses" @close="showLicenses = false" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { gameService } from './services/gameService';
import { authService } from './services/authService';
import Login from './components/Login.vue';
import BlindTestPlayer from './components/games/blind-test/BlindTestPlayer.vue';
import LicensesModal from './components/ui/LicensesModal.vue';

const activePlayerComponent = computed(() => {
  if (game.value && game.value.gameType === 'blind_test') {
    return BlindTestPlayer;
  }
  return BlindTestPlayer; // Fallback
});

const { t } = useI18n();
const state = ref('loading');
const error = ref('');
const showLicenses = ref(false);
const gameId = ref('');
const secret = ref('');
const playerId = ref('');
const game = ref(null);
const version = import.meta.env.VITE_APP_VERSION || '0.0.0';

onMounted(async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('game');
  const sec = params.get('secret');
  
  if (!id || !sec) {
    error.value = t('app.invalid_link');
    state.value = 'error';
    return;
  }
  
  gameId.value = id;
  secret.value = sec;

  try {
    await authService.signIn();
    gameService.listenToGame(gameId.value, (newGameState) => {
      if (newGameState) {
        game.value = newGameState;
        const uid = gameService.getCurrentUserId();
        if (uid && newGameState.players && newGameState.players[uid]) {
          playerId.value = uid;
          state.value = 'in-game';
          error.value = '';
        } else if (state.value === 'in-game') {
          // If the player was in-game and is no longer in the players list, they were kicked.
          error.value = t('app.kicked');
          state.value = 'login';
        } else if (state.value === 'loading' || state.value === 'error') {
          state.value = 'login';
        }
      } else {
        error.value = t('app.game_closed');
        state.value = 'error';
      }
    });
  } catch (_e) {
    error.value = t('app.connection_error');
    state.value = 'error';
  }
});

const handleJoin = async (playerName) => {
  try {
    state.value = 'loading';
    error.value = '';
    playerId.value = await gameService.joinGame(gameId.value, secret.value, playerName);
  } catch (e) {
    console.error(e);
    error.value = t('app.join_error');
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

