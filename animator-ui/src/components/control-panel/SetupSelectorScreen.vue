<template>
  <div class="flex flex-col items-center justify-center min-h-full w-full relative p-6">
    <button class="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-primary font-bold text-sm transition-colors z-10" @click="$emit('back')">
      <ChevronLeft class="w-4 h-4" /> Retour
    </button>
    
    <div class="w-full max-w-5xl">
      <h2 class="text-4xl font-black text-primary text-center mb-2">Mise en place</h2>
      <p class="text-muted-foreground text-center mb-12">Configurez les éléments qui seront utilisés dans vos parties.</p>
      
      <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
        <SelectionCard
          title="Playlists"
          description="Gérez vos musiques pour le Blind Test."
          themeColor="#10b981"
          themeBg="#ebf8f2"
          @click="$emit('select-setup', 'playlists')"
        >
          <template #icon><ListMusic class="w-10 h-10" /></template>
        </SelectionCard>

        <SelectionCard
          title="Images"
          description="Configurez des banques d'images pour vos Quiz visuels."
          disabled
        >
          <template #icon><Image class="w-10 h-10" /></template>
        </SelectionCard>

        <SelectionCard
          title="Questions"
          description="Créez des listes de questions textuelles pour les Quiz."
          disabled
        >
          <template #icon><HelpCircle class="w-10 h-10" /></template>
        </SelectionCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ListMusic, Image, HelpCircle } from '@lucide/vue';
import SelectionCard from '../ui/SelectionCard.vue';

defineEmits<{
  (e: 'back'): void;
  (e: 'select-setup', setupType: string): void;
}>();
</script>
