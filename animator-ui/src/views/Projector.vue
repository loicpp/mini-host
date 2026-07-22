<template>
  <div class="flex flex-col h-screen w-screen bg-[#13111C] text-white overflow-hidden font-sans" @dblclick="toggleFullscreen">
    <!-- Header with QR Code -->
    <header class="flex justify-between items-center px-12 py-6">
      <div v-if="gameId && secret && game?.status !== 'waiting'" class="flex items-center gap-6 bg-white/5 p-3 rounded-2xl backdrop-blur-md border border-white/10">
        <img :src="qrCodeUrl" alt="QR Code" class="w-20 h-20 bg-white p-1 rounded-xl" />
        <div class="flex flex-col">
          <p class="text-white/70 text-sm m-0">{{ $t('projector.scan_to_play') }}</p>
          <h2 class="text-[#FFBA49] text-2xl font-black m-0 tracking-widest">{{ gameId }}</h2>
        </div>
      </div>
      <div v-else></div> <!-- Placeholder for flex spacing -->
      <div class="flex items-center gap-4">
        <img src="/favicon.svg" alt="Logo" class="h-16 w-16 rounded-2xl object-cover border-2 border-[#FFBA49] shadow-[0_0_15px_rgba(255,186,73,0.4)]" />
        <h1 class="text-4xl font-black bg-gradient-to-r from-[#FFBA49] to-[#ff4d4d] bg-clip-text text-transparent m-0">Blind Test</h1>
      </div>
    </header>

    <!-- Main Display Area -->
    <main class="flex-1 flex justify-center items-center text-center overflow-y-auto py-8">
      <div v-if="!game" class="animate-pulse">
        <h1 class="text-4xl font-bold text-white/70">{{ $t('projector.connecting') }}</h1>
      </div>

      <div v-else-if="game.status === 'waiting'" class="w-full max-w-6xl flex flex-col items-center">
        <div v-if="gameId && secret" class="flex items-center gap-12 bg-white/5 p-8 rounded-3xl backdrop-blur-md border border-white/10 mb-8 shadow-2xl">
          <img :src="qrCodeUrl" alt="QR Code" class="w-64 h-64 bg-white p-4 rounded-3xl m-0 shadow-lg" />
          <div class="text-left flex flex-col justify-center">
            <h2 class="text-white text-4xl font-bold mb-2">{{ $t('projector.join_game') }}</h2>
            <div class="text-[#FFBA49] text-8xl font-black tracking-[0.2em] mb-2 drop-shadow-[0_0_20px_rgba(255,186,73,0.5)]">{{ gameId }}</div>
            <p class="text-white/80 text-2xl m-0">{{ $t('projector.scan_to_join') }}</p>
          </div>
        </div>

        <h1 class="text-6xl font-black text-white mb-8">{{ $t('projector.get_ready') }}</h1>
        
        <div class="w-full">
          <h3 class="text-white/80 text-2xl mb-6 font-medium">{{ $t('projector.players_present') }} ({{ Object.keys(game.players || {}).length }})</h3>
          <div class="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
            <span v-for="(player, id) in game.players" :key="id" class="bg-white/15 px-6 py-3 rounded-full text-2xl font-bold backdrop-blur-sm border border-white/20 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
              {{ player.name }}
            </span>
          </div>
        </div>
      </div>

      <div v-else-if="game.status === 'playing'" class="w-full flex flex-col items-center">
        <div v-if="isBuffering" class="flex flex-col items-center">
          <h1 class="text-5xl text-[#FFBA49] font-black mb-8">{{ $t('projector.music_starts_in') }}</h1>
          <div class="text-9xl font-black text-white animate-pulse">{{ bufferTimeLeft }}</div>
        </div>
        <div v-else class="flex flex-col items-center">
          <div class="relative w-[40vh] h-[40vh] mb-8">
            <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
              <defs>
                <mask id="drain-mask">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="white" stroke-width="10" stroke-dasharray="283" :stroke-dashoffset="dashOffsetTotal" style="transition: stroke-dashoffset 0.1s linear;"></circle>
                </mask>
              </defs>
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8"></circle>
              
              <g mask="url(#drain-mask)">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#00d2ff" stroke-width="8"></circle>
                <circle cx="50" cy="50" r="45" fill="none" stroke="#FFBA49" stroke-width="8" :stroke-dasharray="unblockedDashArray"></circle>
                <circle cx="50" cy="50" r="45" fill="none" stroke="#ff4d4d" stroke-width="8" :stroke-dasharray="reflectionDashArray"></circle>
              </g>
            </svg>
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vh] font-black tabular-nums drop-shadow-lg">
              {{ timeLeft }}
            </div>
          </div>
          <div class="flex justify-center gap-6 mb-8 bg-white/5 px-6 py-3 rounded-full backdrop-blur-md">
            <div class="flex items-center gap-2 text-xl text-white/90 font-medium" v-if="blockTotalTime > 0">
              <span class="w-4 h-4 rounded-full bg-[#00d2ff] shadow-[0_0_10px_rgba(0,210,255,0.5)]"></span> {{ $t('projector.block') }}
            </div>
            <div class="flex items-center gap-2 text-xl text-white/90 font-medium" v-if="musicTotalTime > blockTotalTime">
              <span class="w-4 h-4 rounded-full bg-[#FFBA49] shadow-[0_0_10px_rgba(255,186,73,0.5)]"></span> {{ $t('projector.music') }}
            </div>
            <div class="flex items-center gap-2 text-xl text-white/90 font-medium" v-if="totalTime > musicTotalTime">
              <span class="w-4 h-4 rounded-full bg-[#ff4d4d] shadow-[0_0_10px_rgba(255,77,77,0.5)]"></span> {{ $t('projector.reflection') }}
            </div>
          </div>
          <h1 class="text-5xl font-black text-white tracking-wide">{{ $t('projector.your_turn') }}</h1>
        </div>
      </div>

      <div v-else-if="game.status === 'reviewing'" class="w-full flex flex-col items-center">
        <h1 class="text-7xl font-black text-red-400 mb-6 drop-shadow-md">{{ $t('projector.time_up') }}</h1>
        <p class="text-3xl text-white/80">{{ $t('projector.reviewing') }}</p>
      </div>

      <div v-else-if="game.status === 'results'" class="w-full max-w-4xl flex flex-col items-center">
        <h1 class="text-6xl font-black text-emerald-400 mb-8 drop-shadow-md">{{ $t('projector.results') }}</h1>
        <div class="bg-white/10 p-10 rounded-3xl mb-12 border-2 border-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.3)] w-full">
          <h2 class="text-5xl font-bold text-white m-0 leading-tight">{{ game.currentTrack?.answer || $t('projector.unknown_answer') }}</h2>
        </div>
        <div class="w-full">
          <p class="text-2xl text-white/70 mb-6 font-medium text-left px-4">{{ $t('projector.leaderboard') }}</p>
          <ul class="flex flex-col gap-4 w-full m-0 p-0">
            <li v-for="(player, index) in allPlayersSorted" :key="player.id" class="flex justify-between items-center bg-white/10 px-8 py-5 rounded-2xl text-3xl shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4">
              <span class="font-black text-[#FFBA49] w-16 text-left">#{{ index + 1 }}</span>
              <span class="flex-1 text-left font-bold">{{ player.name }}</span>
              <span class="font-black text-emerald-400">{{ player.score || 0 }} {{ $t('gameroom.pts') }}</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div v-else-if="game.status === 'finished'" class="w-full max-w-5xl flex flex-col items-center">
        <h1 class="text-7xl font-black text-emerald-400 mb-16 drop-shadow-lg">{{ $t('projector.podium') }}</h1>
        
        <div class="flex justify-center items-end gap-6 mb-16 h-[40vh] w-full px-8">
          <div v-for="(player, index) in topThreePlayers" :key="player.id" :class="[
            'bg-white/10 rounded-t-3xl flex flex-col items-center pt-6 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] relative w-1/3 animate-in fade-in slide-in-from-bottom-8',
            index === 0 ? 'h-full border-t-[6px] border-[#ffd700] bg-gradient-to-t from-[#ffd700]/10 to-[#ffd700]/30 z-30' :
            index === 1 ? 'h-[75%] border-t-[6px] border-[#c0c0c0] bg-gradient-to-t from-[#c0c0c0]/10 to-[#c0c0c0]/30 z-20' :
            'h-[55%] border-t-[6px] border-[#cd7f32] bg-gradient-to-t from-[#cd7f32]/10 to-[#cd7f32]/30 z-10'
          ]">
            <div class="text-6xl mb-3 drop-shadow-md">{{ ['🥇', '🥈', '🥉'][index] }}</div>
            <div class="text-4xl font-bold text-white text-center break-words px-4 w-full">{{ player.name }}</div>
            <div class="text-2xl text-white/80 mt-3 font-medium">{{ player.score || 0 }} {{ $t('gameroom.pts') }}</div>
          </div>
        </div>
        
        <div class="w-full max-w-3xl" v-if="otherPlayers.length > 0">
          <h3 class="text-2xl text-white/70 mb-6 font-medium text-left px-4">{{ $t('projector.rest_of_leaderboard') }}</h3>
          <ul class="flex flex-col gap-3 w-full m-0 p-0">
            <li v-for="(player, index) in otherPlayers" :key="player.id" class="flex justify-between items-center bg-white/10 px-8 py-4 rounded-2xl text-2xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2">
              <span class="font-bold text-white/50 w-16 text-left">#{{ index + 4 }}</span>
              <span class="flex-1 text-left font-medium">{{ player.name }}</span>
              <span class="font-bold text-emerald-400">{{ player.score || 0 }} {{ $t('gameroom.pts') }}</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { db, auth, getServerTime } from '../firebase';
import { ref as dbRef, onValue } from 'firebase/database';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const gameId = ref('');
const secret = ref('');
const game = ref<Record<string, any> | null>(null);
const apiPort = ref<number | null>(null);

const timeLeft = ref(0);
const timeLeftMusic = ref(0);
const bufferTimeLeft = ref(0);
const isBuffering = ref(false);
const totalTime = ref(30);
const musicTotalTime = ref(15);
const blockTotalTime = ref(0);
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

const dashOffsetTotal = computed(() => {
  const c = Math.PI * (45 * 2);
  const pct = timeLeft.value / totalTime.value;
  return ((1 - pct) * c);
});

const unblockedDashArray = computed(() => {
  const c = Math.PI * (45 * 2);
  const unblockedTime = Math.max(0, totalTime.value - blockTotalTime.value);
  const ratio = Math.min(1, Math.max(0, unblockedTime / Math.max(1, totalTime.value)));
  const dashLength = ratio * c;
  return `${dashLength} ${c}`;
});

const reflectionDashArray = computed(() => {
  const c = Math.PI * (45 * 2);
  const reflectionTime = Math.max(0, totalTime.value - musicTotalTime.value);
  const ratio = Math.min(1, Math.max(0, reflectionTime / Math.max(1, totalTime.value)));
  const dashLength = ratio * c;
  return `${dashLength} ${c}`;
});

onMounted(async () => {
  const params = new URLSearchParams(window.location.search);
  gameId.value = params.get('game') || '';
  const portParam = params.get('api_port');
  if (portParam) {
    apiPort.value = parseInt(portParam);
  }
  
  if (!gameId.value) return;

  // Make sure we have read access. Wait for auth state to resolve first
  // so we don't accidentally overwrite an existing animator session
  // if the projector shares the same browser context.
  await new Promise<void>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (!user) {
        try {
          await signInAnonymously(auth);
        } catch(e) {
          console.error(e);
        }
      }
      resolve();
    });
  });

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
      const mDuration = track.musicDuration || track.duration;
      const bDuration = track.blockDuration || 0;
      musicTotalTime.value = mDuration / 1000;
      blockTotalTime.value = bDuration / 1000;
      startTimer(track.startTime, track.duration, mDuration);
    }
  } else {
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }
  }
});

const startTimer = (startTime: number, duration: number, musicDuration: number) => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }
  
  const updateTimer = () => {
    const now = getServerTime();
    
    if (now < startTime) {
      isBuffering.value = true;
      timeLeft.value = Math.ceil(duration / 1000);
      timeLeftMusic.value = Math.ceil(musicDuration / 1000);
      bufferTimeLeft.value = Math.ceil((startTime - now) / 1000);
    } else {
      isBuffering.value = false;
      const elapsed = now - startTime;
      const remaining = Math.max(0, duration - elapsed);
      const remainingMusic = Math.max(0, musicDuration - elapsed);
      timeLeft.value = Math.ceil(remaining / 1000);
      timeLeftMusic.value = Math.ceil(remainingMusic / 1000);
      
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

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      console.error("Échec du plein écran HTML5 :", err.message);
    });
  } else {
    document.exitFullscreen();
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'F11') {
    event.preventDefault();
    toggleFullscreen();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>


