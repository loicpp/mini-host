<template>
  <div class="players-grid">
    <div v-for="(player, id) in players" :key="id" class="player-card">
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

      <div class="p-actions">
        <button @click="$emit('award', id as string, 1)" class="btn-sm btn-success">+1</button>
        <button @click="$emit('award', id as string, 0.5)" class="btn-sm btn-warning">+0.5</button>
        <button @click="$emit('award', id as string, -1)" class="btn-sm btn-danger">-1</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  players: Record<string, any>;
}>();

defineEmits<{
  (e: 'award', playerId: string, points: number): void;
}>();

const formatTime = (ts: number) => {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString();
};
</script>

<style scoped>
</style>
