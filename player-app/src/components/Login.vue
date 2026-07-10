<template>
  <div class="card login-card">
    <h2>Rejoindre la partie</h2>
    <p class="subtitle">Partie: <strong>{{ gameId }}</strong></p>
    
    <form @submit.prevent="submitName" class="login-form">
      <div class="input-group">
        <label for="playerName">Votre Pseudo</label>
        <input 
          id="playerName"
          v-model="name" 
          type="text" 
          placeholder="Ex: Mozart, Daft Punk..." 
          required 
          autocomplete="off"
          maxlength="20"
        />
      </div>
      <button type="submit" class="btn btn-primary btn-block">Jouer !</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  gameId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['join']);
const name = ref('');

const submitName = () => {
  if (name.value.trim().length > 0) {
    emit('join', name.value.trim());
  }
};
</script>
