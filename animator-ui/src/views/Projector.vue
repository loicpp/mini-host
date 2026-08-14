<template>
  <div class="relative h-screen w-screen bg-[#13111C] text-white overflow-hidden font-sans select-none" @dblclick="toggleFullscreen">
    <div 
      class="absolute origin-top-left flex flex-col"
      :style="{ 
        width: '1920px', 
        height: '1080px', 
        transform: `scale(${scale})`, 
        left: `${(windowWidth - 1920 * scale) / 2}px`, 
        top: `${(windowHeight - 1080 * scale) / 2}px` 
      }"
    >
      <!-- Header with QR Code -->
      <header class="flex justify-between items-center px-12 py-6">
      <div v-if="gameId && secret && game?.data?.status !== 'waiting'" class="flex items-center gap-6 bg-white/5 p-3 rounded-2xl backdrop-blur-md border border-white/10">
        <img :src="qrCodeUrl" alt="QR Code" class="w-20 h-20 bg-white p-1 rounded-xl" />
        <div class="flex flex-col">
          <p class="text-white/70 text-sm m-0">{{ $t('projector.scan_to_play') }}</p>
          <h2 class="text-[#FFBA49] text-2xl font-black m-0 tracking-widest">{{ gameId }}</h2>
        </div>
      </div>
      <div v-else></div> <!-- Placeholder for flex spacing -->
      <div class="flex items-center gap-4">
        <img src="/blindtest.svg" alt="Logo" class="h-16 w-16 rounded-2xl object-cover border-2 border-[#FFBA49] shadow-[0_0_15px_rgba(255,186,73,0.4)]" />
        <h1 class="text-4xl font-black bg-gradient-to-r from-[#FFBA49] to-[#ff4d4d] bg-clip-text text-transparent m-0">Blind Test</h1>
      </div>
    </header>

    <!-- Main Display Area -->
    <main class="flex-1 flex justify-center items-center text-center overflow-hidden py-8">
      <div v-if="!game" class="animate-pulse">
        <h1 class="text-4xl font-bold text-white/70">{{ $t('projector.connecting') }}</h1>
      </div>

      <div v-else-if="game.data?.status === 'waiting'" class="w-full max-w-[1600px] flex flex-col items-center px-10">
        <div class="flex w-full gap-8 mb-6 justify-center items-stretch">
          <!-- QR Code Box -->
          <div v-if="gameId && secret" class="flex-[3] flex flex-row items-center justify-center gap-12 bg-white/5 p-8 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl">
            <img :src="qrCodeUrl" alt="QR Code" class="w-[380px] h-[380px] bg-white p-5 rounded-3xl m-0 shadow-xl" />
            <div class="text-left flex flex-col justify-center">
              <div class="text-[#FFBA49] text-8xl font-black tracking-[0.2em] mb-4 drop-shadow-[0_0_20px_rgba(255,186,73,0.5)]">{{ gameId }}</div>
              <p class="text-white/80 text-3xl m-0">{{ $t('projector.scan_to_join') }}</p>
            </div>
          </div>
          
          <!-- Rules Box -->
          <div v-if="game.data?.settings" class="flex-[2] flex flex-col justify-center text-left bg-white/5 p-8 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl">
            <h2 class="text-white text-3xl font-bold mb-6 flex items-center gap-3"><Info class="w-8 h-8 text-[#FFBA49]"/> {{ $t('projector.rules') }}</h2>
            
            <div class="mb-6">
               <p class="text-white/60 text-lg uppercase tracking-wider mb-2">{{ $t('create_game.game_mode') }}</p>
               <p class="text-2xl font-bold text-[#FFBA49]">{{ $t(`create_game.mode_${game.data.settings.mode}`) }}</p>
            </div>

            <div class="flex gap-4 w-full mb-6">
                <div class="flex-1 bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center shadow-inner" v-if="game.data.settings.blockDuration > 0">
                    <div class="text-[#00d2ff] text-sm font-bold mb-2 flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-[#00d2ff] shadow-[0_0_10px_rgba(0,210,255,0.5)]"></span>{{ $t('projector.block') }}</div>
                    <div class="text-4xl font-black text-white">{{ game.data.settings.blockDuration }}<span class="text-xl text-white/50 ml-1">s</span></div>
                </div>
                <div class="flex-1 bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center shadow-inner">
                    <div class="text-[#FFBA49] text-sm font-bold mb-2 flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-[#FFBA49] shadow-[0_0_10px_rgba(255,186,73,0.5)]"></span>{{ $t('projector.music') }}</div>
                    <div class="text-4xl font-black text-white">{{ game.data.settings.musicDuration }}<span class="text-xl text-white/50 ml-1">s</span></div>
                </div>
                <div class="flex-1 bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center shadow-inner" v-if="game.data.settings.duration > 0">
                    <div class="text-[#ff4d4d] text-sm font-bold mb-2 flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-[#ff4d4d] shadow-[0_0_10px_rgba(255,77,77,0.5)]"></span>{{ $t('projector.total_time') }}</div>
                    <div class="text-4xl font-black text-white">{{ game.data.settings.duration }}<span class="text-xl text-white/50 ml-1">s</span></div>
                </div>
            </div>

            <!-- Additional options -->
            <div class="flex flex-wrap gap-3" v-if="(game.data.settings.mode === 'text' && game.data.settings.allowSuggestions) || game.data.settings.penaltyOnWrongAnswer">
               <div class="flex items-center gap-2 bg-black/20 px-4 py-2.5 rounded-xl border border-white/5 shadow-inner" v-if="game.data.settings.mode === 'text' && game.data.settings.allowSuggestions">
                 <Lightbulb class="w-5 h-5 text-[#FFBA49]" />
                 <span class="font-medium text-white/90 text-sm">{{ $t('create_game.allow_suggestions') }}</span>
               </div>
               
               <div class="flex items-center gap-2 bg-black/20 px-4 py-2.5 rounded-xl border border-white/5 shadow-inner" v-if="game.data.settings.penaltyOnWrongAnswer">
                 <AlertTriangle class="w-5 h-5 text-[#ff4d4d]" /> 
                 <span class="font-medium text-white/90 text-sm">{{ $t('create_game.auto_correction_penalty') }}</span>
               </div>
            </div>
          </div>
        </div>

        <h1 class="text-6xl font-black text-white mb-6">{{ $t('projector.get_ready') }}</h1>
        
        <div class="w-full">
          <h3 class="text-white/80 text-2xl mb-4 font-medium">{{ $t('projector.players_present') }} ({{ Object.keys(game.players || {}).length }})</h3>
          <div class="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
            <span v-for="(player, id) in game.players" :key="id" class="bg-white/15 px-6 py-3 rounded-full text-2xl font-bold backdrop-blur-sm border border-white/20 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
              {{ player.name }}
            </span>
          </div>
        </div>
      </div>

      <div v-else-if="game.data?.status === 'playing'" class="w-full flex flex-col items-center">
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

      <div v-else-if="game.data?.status === 'reviewing'" class="w-full flex flex-col items-center">
        <h1 class="text-7xl font-black text-red-400 mb-6 py-4 flex items-center justify-center gap-4">
          <AlarmClock class="w-20 h-20" /> {{ $t('projector.time_up') }}
        </h1>
        <p class="text-3xl text-white/80">{{ $t('projector.reviewing') }}</p>
      </div>

      <div v-else-if="game.data?.status === 'results'" class="w-full max-w-4xl flex flex-col items-center">
        <h1 class="text-6xl font-black text-emerald-400 mb-8 py-4 flex items-center justify-center gap-4">
          <PartyPopper class="w-16 h-16" /> {{ $t('projector.results') }}
        </h1>
        <div class="bg-white/10 p-10 rounded-3xl mb-12 border-2 border-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.3)] w-full">
          <h2 class="text-5xl font-bold text-white m-0 leading-tight">{{ game.answer || $t('projector.unknown_answer') }}</h2>
        </div>
        <div class="w-full">
          <p class="text-2xl text-white/70 mb-6 font-medium text-left px-4">{{ $t('projector.leaderboard') }}</p>
          <ul class="flex flex-col gap-4 w-full m-0 p-0">
            <li v-for="(player, index) in allPlayersSorted.slice(0, 5)" :key="player.id" class="flex justify-between items-center bg-white/10 px-8 py-5 rounded-2xl text-3xl shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4">
              <span class="font-black text-[#FFBA49] w-16 text-left">#{{ index + 1 }}</span>
              <span class="flex-1 text-left font-bold">{{ player.name }}</span>
              <div class="flex items-center gap-6">
                <div class="flex items-center gap-2 font-bold text-xl justify-end w-16" :class="player.rankChange > 0 ? 'text-emerald-400' : player.rankChange < 0 ? 'text-red-400' : 'text-white/40'">
                  <template v-if="player.rankChange > 0">
                    <ChevronUp class="w-6 h-6" /> {{ player.rankChange }}
                  </template>
                  <template v-else-if="player.rankChange < 0">
                    <ChevronDown class="w-6 h-6" /> {{ Math.abs(player.rankChange) }}
                  </template>
                  <template v-else>
                    <Minus class="w-6 h-6" />
                  </template>
                </div>
                <span class="font-black text-emerald-400 w-32 text-right">{{ player.score || 0 }} {{ $t('gameroom.pts') }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
      
      <div v-else-if="game.data?.status === 'finished'" class="w-full max-w-5xl flex flex-col items-center">
        <h1 class="text-7xl font-black text-emerald-400 mb-16 flex items-center justify-center gap-6">
          <Trophy class="w-20 h-20" /> {{ $t('projector.podium') }} <Trophy class="w-20 h-20" />
        </h1>
        
        <div class="flex justify-center items-end gap-6 mb-16 h-[40vh] w-full px-8">
          <div v-for="player in topThreePlayers" :key="player.id" :class="[
            'bg-white/10 rounded-t-3xl flex flex-col items-center pt-6 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] relative w-1/3 animate-in fade-in slide-in-from-bottom-8',
            player.rank === 1 ? 'h-full border-t-[6px] border-[#ffd700] bg-gradient-to-t from-[#ffd700]/10 to-[#ffd700]/30 z-30' :
            player.rank === 2 ? 'h-[75%] border-t-[6px] border-[#c0c0c0] bg-gradient-to-t from-[#c0c0c0]/10 to-[#c0c0c0]/30 z-20' :
            'h-[55%] border-t-[6px] border-[#cd7f32] bg-gradient-to-t from-[#cd7f32]/10 to-[#cd7f32]/30 z-10'
          ]">
            <div class="mb-3 py-4 flex justify-center w-full">
              <Medal :class="[
                'w-16 h-16',
                player.rank === 1 ? 'text-[#ffd700] fill-[#ffd700]/30' : 
                player.rank === 2 ? 'text-[#e0e0e0] fill-[#e0e0e0]/30' : 
                'text-[#cd7f32] fill-[#cd7f32]/30'
              ]" stroke-width="2" />
            </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, watchEffect } from 'vue';
import { db, auth, getServerTime } from '../firebase';
import { ref as dbRef, onValue } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { AlarmClock, PartyPopper, Trophy, Medal, Info, Lightbulb, AlertTriangle, ChevronUp, ChevronDown, Minus } from '@lucide/vue';
import QRCode from 'qrcode';

let originalTitle = '';
let originalFavicon = '';

const gameId = ref('');
const secret = ref('');
const game = ref<Record<string, any> | null>(null);
const apiPort = ref<number | null>(null);

const windowWidth = ref(window.innerWidth);
const windowHeight = ref(window.innerHeight);
const scale = computed(() => {
  return Math.min(windowWidth.value / 1920, windowHeight.value / 1080);
});

const handleResize = () => {
  windowWidth.value = window.innerWidth;
  windowHeight.value = window.innerHeight;
};

const timeLeft = ref(0);
const timeLeftMusic = ref(0);
const bufferTimeLeft = ref(0);
const isBuffering = ref(false);
const totalTime = ref(30);
const musicTotalTime = ref(15);
const blockTotalTime = ref(0);
const timerInterval = ref<ReturnType<typeof setInterval> | null>(null);

const baseUrl = "https://minihostapp-1.web.app"; 

const qrCodeUrl = ref('');

watchEffect(async () => {
  if (gameId.value && secret.value) {
    const targetUrl = `${baseUrl}/?game=${gameId.value}&secret=${secret.value}`;
    try {
      qrCodeUrl.value = await QRCode.toDataURL(targetUrl, { width: 600, margin: 1 });
    } catch (e) {
      console.error('Erreur génération QR Code:', e);
      qrCodeUrl.value = '';
    }
  } else {
    qrCodeUrl.value = '';
  }
});

const allPlayersSorted = computed(() => {
  if (!game.value || !game.value.players) return [];
  const p = Object.keys(game.value?.players).map(id => ({
    id,
    ...game.value?.players[id]
  }));
  return p.sort((a, b) => {
    const scoreDiff = (b.score || 0) - (a.score || 0);
    if (scoreDiff !== 0) return scoreDiff;
    return (a.name || '').localeCompare(b.name || '');
  });
});

const topThreePlayers = computed(() => {
  const top = allPlayersSorted.value.slice(0, 3);
  const result = [];
  if (top.length > 1) result.push({ ...top[1], rank: 2 });
  if (top.length > 0) result.push({ ...top[0], rank: 1 });
  if (top.length > 2) result.push({ ...top[2], rank: 3 });
  return result;
});
const otherPlayers = computed(() => allPlayersSorted.value.slice(3, 5));

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
  
  // Set title and favicon for Projector
  originalTitle = document.title;
  const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
  if (link) {
    originalFavicon = link.href;
    link.href = '/blindtest.svg';
  }
  document.title = "Blind test";
  
  if (!gameId.value) return;

  // Make sure we have read access. Wait for auth state to resolve first
  // so we don't accidentally overwrite an existing animator session
  // if the projector shares the same browser context.
  await new Promise<void>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (!user) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        return;
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

watch(() => game.value?.data?.status, (newStatus) => {
  if (newStatus === 'playing') {
    const data = game.value?.data;
    if (data && data.startTime && data.settings?.duration) {
      totalTime.value = data.settings.duration;
      const mDuration = data.settings.musicDuration || data.settings.duration;
      const bDuration = data.settings.blockDuration || 0;
      musicTotalTime.value = mDuration;
      blockTotalTime.value = bDuration;
      startTimer(data.startTime, data.settings.duration * 1000, mDuration * 1000);
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
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('resize', handleResize);
  document.title = originalTitle;
  const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
  if (link && originalFavicon) {
    link.href = originalFavicon;
  }
});
</script>


