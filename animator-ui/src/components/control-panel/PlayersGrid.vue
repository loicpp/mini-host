<template>
  <div class="players-grid">
    <div v-for="(player, id) in filteredPlayers" :key="id" class="player-card" :class="{'awarded-points': player.pendingPoints > 0, 'penalized-points': player.pendingPoints < 0}">
      <div class="p-header">
        <h4>{{ player.name }}</h4>
        <span class="score">{{ player.score || 0 }} pts</span>
      </div>
      
      <div class="p-guess" v-if="player.currentGuess">
        <p class="guess-title">{{ player.currentGuess.title }}</p>
        <p class="guess-artist">{{ player.currentGuess.artist }}</p>
        <p class="guess-time">{{ formatTime(player.currentGuess.submittedAt) }}</p>
      </div>
      <div class="p-guess empty" v-else>
        <p>Aucune réponse</p>
      </div>

      <div class="p-actions" v-if="gameMode !== 'buzzer'">
        <button @click="$emit('award', id as string, 1)" class="btn-sm btn-success">+1</button>
        <button @click="$emit('award', id as string, 0.5)" class="btn-sm btn-warning">+0.5</button>
        <button @click="$emit('award', id as string, -1)" class="btn-sm btn-danger">-1</button>
      </div>
    </div>
    
    <div v-if="Object.keys(filteredPlayers).length === 0 && gameMode === 'buzzer'" style="text-align: center; width: 100%; color: #888; padding: 20px;">
      Aucun joueur n'a buzzé.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

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

<style scoped>
.awarded-points {
  border: 2px solid #2ecc71 !important;
  box-shadow: 0 0 15px rgba(46, 204, 113, 0.4) !important;
}
.penalized-points {
  border: 2px solid #e74c3c !important;
  box-shadow: 0 0 15px rgba(231, 76, 60, 0.4) !important;
}
</style>
