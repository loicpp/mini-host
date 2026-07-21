<template>
  <div class="flex flex-col gap-5">
    <div class="text-center mb-2">
      <h2 class="text-2xl font-bold text-primary mb-1">Rejoindre la partie</h2>
      <p class="text-muted-foreground text-sm">
        Partie: <span class="font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-md tracking-wider">{{ gameId }}</span>
      </p>
    </div>
    
    <form @submit.prevent="submitName" class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <label for="playerName" class="text-sm font-semibold text-primary">Votre Pseudo</label>
        <input 
          id="playerName"
          v-model="name" 
          type="text" 
          placeholder="Ex: Mozart, Daft Punk..." 
          required 
          autocomplete="off"
          maxlength="20"
          class="w-full px-4 py-3 bg-muted rounded-xl border-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-[#FFBA49] transition-shadow outline-none"
        />
      </div>
      <button type="submit" class="w-full py-3.5 bg-[#FFBA49] hover:bg-[#f0aa30] text-[#3F4739] rounded-xl font-bold text-lg transition-colors shadow-sm active:scale-[0.98]">
        Jouer !
      </button>
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
