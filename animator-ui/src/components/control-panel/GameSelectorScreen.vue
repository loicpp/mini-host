<template>
  <div class="flex flex-col items-center justify-center min-h-full w-full relative p-6">
    <button class="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-primary font-bold text-sm transition-colors z-10" @click="$emit('back')">
      <ChevronLeft class="w-4 h-4" /> {{ $t('create_game.back') }}
    </button>
    
    <div class="w-full max-w-5xl">
      <h2 class="text-4xl font-black text-primary text-center mb-2">Choisir un jeu</h2>
      <p class="text-muted-foreground text-center mb-12">Sélectionnez le type de jeu que vous souhaitez animer.</p>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <SelectionCard
          title="Blind Test"
          description="Le grand classique musical. Devinez l'artiste et le titre."
          themeColor="#FFBA49"
          themeBg="#fff6e0"
          @click="$emit('select-game', 'blind_test')"
        >
          <template #icon><Music class="w-10 h-10" /></template>
        </SelectionCard>

        <SelectionCard
          title="Quiz"
          description="Testez votre culture générale avec des questions variées."
          disabled
        >
          <template #icon><HelpCircle class="w-10 h-10" /></template>
        </SelectionCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, Music, HelpCircle } from '@lucide/vue';
import SelectionCard from '../ui/SelectionCard.vue';

defineEmits<{
  (e: 'back'): void;
  (e: 'select-game', gameType: string): void;
}>();
</script>
