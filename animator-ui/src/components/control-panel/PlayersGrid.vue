<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
    <Card 
      v-for="(player, id) in filteredPlayers" :key="id" 
      :className="`p-4 flex flex-col gap-3 transition-all duration-300 ${
        player.pendingPoints > 0 ? 'border-emerald-400 bg-emerald-50/50 shadow-[0_0_15px_rgba(52,211,153,0.3)]' : 
        player.pendingPoints < 0 ? 'border-red-400 bg-red-50/50 shadow-[0_0_15px_rgba(248,113,113,0.3)]' : 
        'bg-white'
      }`"
    >
      <div class="flex justify-between items-center pb-2 border-b border-[rgba(0,0,0,0.06)]">
        <h4 class="font-bold text-primary truncate max-w-[150px]">{{ player.name }}</h4>
        <span class="font-black text-[#FFBA49] tabular-nums">{{ player.score || 0 }} pts</span>
      </div>
      
      <div class="min-h-[80px] bg-muted/50 rounded-xl p-3 flex flex-col justify-center" v-if="player.currentGuess">
        <p class="font-bold text-emerald-600 text-sm mb-1 leading-tight">{{ player.currentGuess.title }}</p>
        <p class="text-xs text-muted-foreground">{{ player.currentGuess.artist }}</p>
        <p class="text-[10px] text-muted-foreground/60 text-right mt-1">{{ formatTime(player.currentGuess.submittedAt) }}</p>
      </div>
      <div class="min-h-[80px] bg-muted/50 rounded-xl p-3 flex flex-col justify-center items-center" v-else>
        <p class="text-muted-foreground text-sm font-medium italic">Aucune réponse</p>
      </div>

      <div class="flex gap-2 justify-center mt-1" v-if="gameMode !== 'buzzer'">
        <button @click="$emit('award', id as string, 1)" class="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 font-bold hover:bg-emerald-200 transition-colors text-xs flex-1 shadow-sm">+1</button>
        <button @click="$emit('award', id as string, 0.5)" class="px-3 py-1.5 rounded-lg bg-[#fff6e0] text-[#d97706] font-bold hover:bg-[#fef3c7] transition-colors text-xs flex-1 shadow-sm">+0.5</button>
        <button @click="$emit('award', id as string, -1)" class="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 font-bold hover:bg-red-200 transition-colors text-xs flex-1 shadow-sm">-1</button>
      </div>
    </Card>
    
    <div v-if="Object.keys(filteredPlayers).length === 0 && gameMode === 'buzzer'" class="col-span-full text-center p-8 bg-muted/50 rounded-2xl border border-dashed border-muted-foreground/30 text-muted-foreground font-medium">
      Aucun joueur n'a buzzé pour le moment.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Card from '../ui/Card.vue';

const props = defineProps<{
  players: Record<string, any>;
  gameMode?: string;
}>();

defineEmits<{
  (e: 'award', playerId: string, points: number): void;
}>();

const formatTime = (ts: number) => {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString();
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
