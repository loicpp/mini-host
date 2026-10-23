<template>
  <div class="flex flex-col items-center min-h-full w-full relative p-6">
    <!-- Top Bar: Back Button -->
    <BackButton @click="$emit('back')" class="absolute top-6 left-6">
      {{ $t('history.back') }}
    </BackButton>

    <div class="flex flex-col items-center pt-6 pb-16 w-full max-w-4xl">
      <!-- Header -->
      <div class="text-center mb-10 w-full">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mb-4 shadow-sm border border-amber-100">
          <History class="w-7 h-7" />
        </div>
        <h1 class="text-3xl font-black text-primary mb-2">{{ $t('history.title') }}</h1>
        <p class="text-muted-foreground font-medium max-w-lg mx-auto">{{ $t('history.subtitle') }}</p>
      </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
      <Loader2 class="w-8 h-8 animate-spin text-amber-500" />
      <p class="font-medium">{{ $t('history.loading') }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="history.length === 0" class="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
      <div class="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground/60 mb-6">
        <Trophy class="w-10 h-10 stroke-[1.5]" />
      </div>
      <h2 class="text-xl font-bold text-primary mb-2">{{ $t('history.empty_title') }}</h2>
      <p class="text-sm text-muted-foreground leading-relaxed">{{ $t('history.empty_desc') }}</p>
    </div>

    <!-- Games List -->
    <div v-else class="flex flex-col gap-4 w-full">
      <div 
        v-for="(game, index) in history" 
        :key="`${game.id}-${game.endedAt}-${index}`"
        class="bg-card border border-border/70 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div class="flex flex-col gap-1.5 flex-1 min-w-0">
          <div class="flex items-center gap-3 flex-wrap">
            <span class="px-3 py-1 bg-amber-50 text-amber-700 font-bold text-xs rounded-lg tracking-wider uppercase border border-amber-200/60">
              #{{ game.id }}
            </span>
            <span class="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Calendar class="w-4 h-4 text-muted-foreground shrink-0" />
              {{ formatDate(game.endedAt) }}
            </span>
            <span class="text-sm text-muted-foreground flex items-center gap-1">
              <Clock class="w-3.5 h-3.5 shrink-0" />
              {{ formatTime(game.endedAt) }}
            </span>
          </div>

          <div class="flex items-center gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
            <span class="flex items-center gap-1.5 font-medium">
              <Users class="w-4 h-4 text-primary/70 shrink-0" />
              {{ $t('history.players_count', { count: game.players.length }) }}
            </span>
            <span v-if="game.players.length > 0" class="flex items-center gap-1.5 text-amber-600 font-semibold truncate max-w-[280px]">
              <Trophy class="w-3.5 h-3.5 shrink-0" />
              {{ $t('history.winner_preview', { name: game.players[0].name, score: game.players[0].score }) }}
            </span>
          </div>
        </div>

        <button 
          @click="selectedGame = game"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-sm transition-all duration-200 hover:shadow shrink-0 w-full sm:w-auto justify-center"
        >
          <Trophy class="w-4 h-4" />
          <span>{{ $t('history.view_leaderboard') }}</span>
        </button>
      </div>
    </div>

    <!-- Leaderboard Modal -->
    <Modal v-if="selectedGame" maxW="max-w-lg" @close="selectedGame = null">
      <div class="p-6 flex flex-col">
        <!-- Modal Header -->
        <div class="flex items-start justify-between pb-4 border-b border-border/60">
          <div class="flex flex-col gap-1">
            <h3 class="text-xl font-bold text-primary flex items-center gap-2">
              <Trophy class="w-5 h-5 text-amber-500" />
              {{ $t('history.leaderboard_title') }}
            </h3>
            <p class="text-xs text-muted-foreground">
              #{{ selectedGame.id }} • {{ formatDate(selectedGame.endedAt) }} {{ $t('history.at_time') }} {{ formatTime(selectedGame.endedAt) }}
            </p>
          </div>
          <button 
            @click="selectedGame = null" 
            class="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Leaderboard Table / List -->
        <div class="py-4 max-h-[60vh] overflow-y-auto flex flex-col gap-2">
          <div 
            v-for="player in selectedGame.players" 
            :key="player.position"
            :class="[
              'flex items-center justify-between p-3 rounded-xl border transition-colors',
              player.position === 1 ? 'bg-amber-50/80 border-amber-200 text-amber-950 font-bold' :
              player.position === 2 ? 'bg-slate-50 border-slate-200 text-slate-900 font-semibold' :
              player.position === 3 ? 'bg-amber-900/5 border-amber-800/20 text-amber-950 font-semibold' :
              'bg-card border-border/50 text-foreground'
            ]"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-8 flex items-center justify-center shrink-0">
                <Medal v-if="player.position === 1" class="w-5 h-5 text-amber-500 fill-amber-500/20" />
                <Medal v-else-if="player.position === 2" class="w-5 h-5 text-slate-400 fill-slate-400/20" />
                <Medal v-else-if="player.position === 3" class="w-5 h-5 text-amber-700 fill-amber-700/20" />
                <span v-else class="text-xs font-bold text-muted-foreground">#{{ player.position }}</span>
              </div>
              <span class="truncate font-semibold">{{ player.name }}</span>
            </div>

            <div class="text-right shrink-0 pl-3">
              <span class="font-bold tabular-nums">{{ player.score }}</span>
              <span class="text-xs text-muted-foreground ml-1">{{ $t('history.pts') }}</span>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="pt-4 border-t border-border/60 flex justify-end">
          <button 
            @click="selectedGame = null"
            class="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold text-sm transition-colors"
          >
            {{ $t('history.close') }}
          </button>
        </div>
      </div>
    </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { History, Calendar, Clock, Users, Trophy, Medal, X, Loader2 } from '@lucide/vue';
import BackButton from '../ui/BackButton.vue';
import Modal from '../ui/Modal.vue';
import { localBackendService, GameHistoryEntry } from '../../services/localBackendService';
import { useUiStore } from '../../core/domain/general/stores/ui';

defineEmits<{
  (e: 'back'): void;
}>();

const { currentLanguage } = useUiStore();
const history = ref<GameHistoryEntry[]>([]);
const loading = ref(true);
const selectedGame = ref<GameHistoryEntry | null>(null);

onMounted(async () => {
  loading.value = true;
  try {
    history.value = await localBackendService.loadHistory();
  } catch (e) {
    console.warn("Could not load game history", e);
    history.value = [];
  } finally {
    loading.value = false;
  }
});

const getLocale = () => (currentLanguage.value === 'fr' ? 'fr-FR' : 'en-US');

const formatDate = (isoString: string) => {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(getLocale(), {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return isoString;
  }
};

const formatTime = (isoString: string) => {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString(getLocale(), {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
};
</script>
