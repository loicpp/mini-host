<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
    <Card 
      v-for="(player, id) in filteredPlayers" :key="id" 
      :className="`p-4 flex flex-col gap-3 transition-all duration-300 border-2 ${
        player.pendingPoints === 1 ? 'border-emerald-400 bg-emerald-50/50 shadow-[0_0_15px_rgba(52,211,153,0.3)]' : 
        player.pendingPoints === 0.5 ? 'border-amber-400 bg-amber-50/50 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 
        player.pendingPoints === -1 ? 'border-red-400 bg-red-50/50 shadow-[0_0_15px_rgba(248,113,113,0.3)]' : 
        'border-[rgba(0,0,0,0.07)] bg-white'
      }`"
    >
      <div class="flex justify-between items-center pb-2 border-b border-[rgba(0,0,0,0.06)]">
        <h4 class="font-bold text-primary truncate max-w-[150px]">{{ player.name }}</h4>
        <span class="font-black text-[#FFBA49] tabular-nums">{{ player.score || 0 }} {{ $t('gameroom.pts') }}</span>
      </div>
      
      <div class="min-h-[80px] bg-muted/50 rounded-xl p-3 flex flex-col justify-center" v-if="player.currentGuess">
        <p class="font-bold text-emerald-600 text-sm mb-1 leading-tight">{{ player.currentGuess.title }}</p>
        <p class="text-xs text-muted-foreground">{{ player.currentGuess.artist }}</p>
        <p class="text-[10px] text-muted-foreground/60 text-right mt-1">{{ formatTime(player.currentGuess.submittedAt) }}</p>
      </div>
      <div class="min-h-[80px] bg-muted/50 rounded-xl p-3 flex flex-col justify-center items-center" v-else>
        <p class="text-muted-foreground text-sm font-medium italic">{{ $t('players_grid.no_answer') }}</p>
      </div>

      <div class="flex flex-col gap-2 mt-1" v-if="gameMode !== 'buzzer'">
        <div class="flex gap-2 justify-center">
          <button 
            @click="$emit('award', id as string, 1)" 
            :disabled="player.pendingPoints === 1"
            :class="['px-3 py-1.5 rounded-lg font-bold transition-colors text-xs flex-1',
              player.pendingPoints === 1 ? 'bg-gray-100 text-gray-400 cursor-default shadow-none' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-sm'
            ]">+1</button>
          <button 
            @click="$emit('award', id as string, 0.5)" 
            :disabled="player.pendingPoints === 0.5"
            :class="['px-3 py-1.5 rounded-lg font-bold transition-colors text-xs flex-1',
              player.pendingPoints === 0.5 ? 'bg-gray-100 text-gray-400 cursor-default shadow-none' : 'bg-[#fff6e0] text-[#d97706] hover:bg-[#fef3c7] shadow-sm'
            ]">+0.5</button>
          <button 
            @click="$emit('award', id as string, -1)" 
            :disabled="player.pendingPoints === -1"
            :class="['px-3 py-1.5 rounded-lg font-bold transition-colors text-xs flex-1',
              player.pendingPoints === -1 ? 'bg-gray-100 text-gray-400 cursor-default shadow-none' : 'bg-red-100 text-red-700 hover:bg-red-200 shadow-sm'
            ]">-1</button>
        </div>
        <button 
          @click="$emit('award', id as string, 0)" 
          :class="['px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-colors text-xs w-full shadow-sm',
            (player.pendingPoints !== 0 && player.pendingPoints !== undefined) ? 'visible' : 'invisible'
          ]">
          {{ $t('players_grid.cancel_points') }}
        </button>
      </div>
    </Card>
    
    <div v-if="Object.keys(filteredPlayers).length === 0 && gameMode === 'buzzer'" class="col-span-full text-center p-8 bg-muted/50 rounded-2xl border border-dashed border-muted-foreground/30 text-muted-foreground font-medium">
      {{ $t('players_grid.no_buzzer') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Card from '../ui/Card.vue';
import { currentStartTime } from '../../composables/state';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  players: Record<string, any>;
  gameMode?: string;
}>();

defineEmits<{
  (e: 'award', playerId: string, points: number): void;
}>();

const formatTime = (ts: number) => {
  if (!ts) return '';
  if (currentStartTime.value > 0) {
    const diff = (ts - currentStartTime.value) / 1000;
    return t('players_grid.submitted_at', { time: diff.toFixed(1) });
  }
  return '';
};

const filteredPlayers = computed(() => {
  if (props.gameMode === 'buzzer') {
    const result: Record<string, any> = {};
    for (const id in props.players) {
      if (props.players[id].currentGuess) {
        result[id] = props.players[id];
      }
    }
    return result;
  }
  return props.players;
});
</script>
