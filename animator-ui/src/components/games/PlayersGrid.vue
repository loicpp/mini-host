<template>
  <div class="w-full flex-1 min-h-0 flex flex-col gap-4">
    <div class="flex justify-end w-full shrink-0" v-if="gameMode !== 'buzzer'">
      <label class="flex items-center cursor-pointer gap-2 select-none group">
        <span class="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{{ $t('players_grid.sort_uncorrected') }}</span>
        <div class="relative">
          <input type="checkbox" v-model="sortUncorrectedFirst" class="sr-only" />
          <div :class="['block w-10 h-6 rounded-full transition-colors duration-300', sortUncorrectedFirst ? 'bg-[#FFBA49]' : 'bg-gray-200']"></div>
          <div class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm" :class="{'translate-x-4': sortUncorrectedFirst}"></div>
        </div>
      </label>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full flex-1 min-h-0 overflow-y-auto pr-2 pb-4">
      <Card 
        v-for="player in filteredPlayers" :key="player.id" 
      :className="`p-4 flex flex-col gap-3 transition-all duration-300 border-2 ${openBonusPlayerId === player.id ? 'z-20 relative' : 'relative'} ${
        player.isBonus ? 'border-purple-400 bg-purple-50/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]' :
        (player.pendingPoints !== undefined && player.pendingPoints >= 1) ? 'border-emerald-400 bg-emerald-50/50 shadow-[0_0_15px_rgba(52,211,153,0.3)]' : 
        player.pendingPoints === 0.5 ? 'border-amber-400 bg-amber-50/50 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 
        (player.pendingPoints !== undefined && player.pendingPoints < 0) ? 'border-red-400 bg-red-50/50 shadow-[0_0_15px_rgba(248,113,113,0.3)]' : 
        'border-[rgba(0,0,0,0.07)] bg-white'
      }`"
    >
      <div class="flex justify-between items-center pb-2 border-b border-[rgba(0,0,0,0.06)]">
        <h4 class="font-bold text-primary truncate max-w-[150px]">{{ player.name }}</h4>
        <span class="font-black text-[#FFBA49] tabular-nums">{{ player.score || 0 }} {{ $t('gameroom.pts') }}</span>
      </div>
      
      <div class="min-h-[80px] bg-muted/50 rounded-xl p-3 flex flex-col justify-center relative" v-if="player.currentGuess">
        <div v-if="player.autoCorrectResult === true" class="absolute top-2 right-2 flex items-center justify-center w-6 h-6 bg-emerald-100 rounded-full group" :title="$t('players_grid.correct_detected')">
          <Check class="w-4 h-4 text-emerald-600" strokeWidth="3" />
        </div>
        <div v-if="player.autoCorrectResult === false" class="absolute top-2 right-2 flex items-center justify-center w-6 h-6 bg-red-100 rounded-full group" :title="$t('players_grid.incorrect_detected')">
          <X class="w-4 h-4 text-red-600" strokeWidth="3" />
        </div>
        <p :class="[
          'font-bold text-sm mb-1 leading-tight mr-6',
          player.autoCorrectResult === true ? 'text-emerald-600' :
          player.autoCorrectResult === false ? 'text-red-600' :
          'text-primary'
        ]">{{ player.currentGuess.title }}</p>
        <p :class="[
          'text-xs mr-6',
          player.autoCorrectResult === true ? 'text-emerald-600/60' :
          player.autoCorrectResult === false ? 'text-red-600/60' :
          'text-muted-foreground'
        ]">{{ player.currentGuess.artist }}</p>
        <p class="text-[10px] text-muted-foreground/60 text-right mt-1">{{ formatTime(player.currentGuess.submittedAt) }}</p>
      </div>
      <div class="min-h-[80px] bg-muted/50 rounded-xl p-3 flex flex-col justify-center items-center" v-else>
        <p class="text-muted-foreground text-sm font-medium italic">{{ $t('players_grid.no_answer') }}</p>
      </div>

      <div class="flex flex-col gap-2 mt-1" v-if="gameMode !== 'buzzer'">
        <div class="flex gap-2 justify-center">
          <div class="relative flex flex-1">
            <button 
              @click="$emit('award', player.id as string, getCalculatedPoints(player.currentGuess?.submittedAt), false)" 
              :disabled="!player.isBonus && player.pendingPoints === getCalculatedPoints(player.currentGuess?.submittedAt)"
              :class="['px-2 py-1.5 rounded-l-lg font-bold transition-colors text-xs flex-1 flex flex-col items-center justify-center min-w-0',
                player.isBonus 
                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                  : player.pendingPoints === getCalculatedPoints(player.currentGuess?.submittedAt) 
                    ? 'bg-gray-100 text-gray-400 cursor-default shadow-none' 
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-sm'
              ]">
              <span class="truncate w-full text-center">{{ player.isBonus ? `+${player.pendingPoints} pts` : $t('players_grid.correct_answer') }}</span>
              <span v-if="player.isBonus" class="text-[9px] font-bold text-purple-600 uppercase tracking-wider leading-tight">{{ $t('control_panel.bonus') }}</span>
              <span v-else-if="gameMode === 'text' && gameSettings?.speedPoints" class="block text-[10px] opacity-75 mt-0.5 whitespace-nowrap">+{{ getCalculatedPoints(player.currentGuess?.submittedAt) }} {{ $t('gameroom.pts') }}</span>
            </button>
            <button 
              type="button" 
              @click.stop="toggleBonusMenu(player.id as string)"
              :title="$t('players_grid.bonus_options')"
              :class="['px-1.5 py-1.5 rounded-r-lg font-bold transition-colors text-xs border-l flex items-center justify-center shrink-0 cursor-pointer',
                player.isBonus 
                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200' 
                  : player.pendingPoints === getCalculatedPoints(player.currentGuess?.submittedAt) 
                    ? 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200 hover:text-gray-600' 
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 shadow-sm'
              ]">
              <ChevronDown class="w-3.5 h-3.5 transition-transform" :class="{ 'rotate-180': openBonusPlayerId === player.id }" />
            </button>

            <!-- Dropdown Menu -->
            <div 
              v-if="openBonusPlayerId === player.id" 
              class="absolute top-full left-0 mt-1 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-30 flex flex-col text-xs"
            >
              <div class="px-2.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles class="w-3 h-3 text-purple-500" />
                {{ $t('control_panel.bonus') }}
              </div>
              <button 
                v-for="bonus in [2, 3, 4, 5]" 
                :key="bonus" 
                @click.stop="selectBonus(player.id as string, bonus)" 
                :class="[
                  'px-3 py-1.5 text-left font-semibold hover:bg-purple-50 hover:text-purple-700 flex items-center justify-between transition-colors cursor-pointer',
                  (player.isBonus && player.pendingPoints === bonus) ? 'text-purple-700 bg-purple-50 font-bold' : 'text-gray-700'
                ]"
              >
                <span>+{{ bonus }} {{ $t('gameroom.pts') }}</span>
                <Sparkles v-if="player.isBonus && player.pendingPoints === bonus" class="w-3 h-3 text-purple-500" />
              </button>
            </div>
          </div>
          <button 
            @click="$emit('award', player.id as string, 0.5)" 
            :disabled="player.pendingPoints === 0.5"
            :class="['px-3 py-1.5 rounded-lg font-bold transition-colors text-xs flex-1',
              player.pendingPoints === 0.5 ? 'bg-gray-100 text-gray-400 cursor-default shadow-none' : 'bg-[#fff6e0] text-[#d97706] hover:bg-[#fef3c7] shadow-sm'
            ]">{{ $t('players_grid.partial_answer') }}</button>
          <button 
            @click="$emit('award', player.id as string, -1)" 
            :disabled="player.pendingPoints === -1"
            :class="['px-3 py-1.5 rounded-lg font-bold transition-colors text-xs flex-1',
              player.pendingPoints === -1 ? 'bg-gray-100 text-gray-400 cursor-default shadow-none' : 'bg-red-100 text-red-700 hover:bg-red-200 shadow-sm'
            ]">{{ $t('players_grid.wrong_answer') }}</button>
        </div>
        <button 
          @click="$emit('award', player.id as string, 0)" 
          :class="['px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-colors text-xs w-full shadow-sm',
            (player.pendingPoints !== 0 && player.pendingPoints !== undefined) ? 'visible' : 'invisible'
          ]">
          {{ $t('players_grid.cancel_points') }}
        </button>
      </div>
    </Card>
    
    <div v-if="filteredPlayers.length === 0 && gameMode === 'buzzer'" class="col-span-full text-center p-8 bg-muted/50 rounded-2xl border border-dashed border-muted-foreground/30 text-muted-foreground font-medium">
      {{ $t('players_grid.no_buzzer') }}
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { Check, X, ChevronDown, Sparkles } from '@lucide/vue';
import Card from '../ui/Card.vue';
import { useGameStore } from '../../core/domain/general/stores/game';
import { useMusicStore } from '../../core/domain/general/stores/music';
import { useI18n } from 'vue-i18n';
import { calculateSpeedPoints } from '../../core/domain/games/useGamePlayers';
import { isInfiniteDuration } from '../../core/domain/models/Game';

const { currentStartTime, gameSettings } = useGameStore();
const { currentTrackDuration } = useMusicStore();

const getCalculatedPoints = (submittedAt?: number) => {
  if (props.gameMode !== 'text' || !gameSettings.value?.speedPoints || !submittedAt || !currentStartTime.value) return 1;
  const effectiveT = (isInfiniteDuration(gameSettings.value?.duration) ? currentTrackDuration.value : gameSettings.value?.duration) || 15;
  return calculateSpeedPoints(submittedAt, currentStartTime.value, effectiveT);
};
const { t } = useI18n();

const props = defineProps<{
  players: Record<string, any>;
  gameMode?: string;
}>();

const emit = defineEmits<{
  (e: 'award', playerId: string, points: number, isBonus?: boolean): void;
}>();

const openBonusPlayerId = ref<string | null>(null);

const toggleBonusMenu = (playerId: string) => {
  openBonusPlayerId.value = openBonusPlayerId.value === playerId ? null : playerId;
};

const selectBonus = (playerId: string, bonus: number) => {
  emit('award', playerId, bonus, true);
  openBonusPlayerId.value = null;
};

const handleDocumentClick = () => {
  if (openBonusPlayerId.value) {
    openBonusPlayerId.value = null;
  }
};

onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick);
});

const formatTime = (ts: number) => {
  if (!ts) return '';
  if (currentStartTime.value > 0) {
    const diff = (ts - currentStartTime.value) / 1000;
    return t('players_grid.submitted_at', { time: diff.toFixed(1) });
  }
  return '';
};

const sortUncorrectedFirst = ref(false);

const filteredPlayers = computed(() => {
  let playerArray = [];
  for (const [id, player] of Object.entries(props.players)) {
    if (player.blockedTurns && player.blockedTurns !== 0) {
      continue;
    }
    if (props.gameMode === 'buzzer' && !player.currentGuess) {
      continue;
    }
    playerArray.push({ id, ...player });
  }

  if (sortUncorrectedFirst.value && props.gameMode !== 'buzzer') {
    playerArray.sort((a, b) => {
      const aCorrected = (a.pendingPoints !== undefined && a.pendingPoints !== 0) ? 1 : 0;
      const bCorrected = (b.pendingPoints !== undefined && b.pendingPoints !== 0) ? 1 : 0;
      return aCorrected - bCorrected;
    });
  }

  return playerArray;
});
</script>
