<template>
  <div class="flex flex-col items-center justify-center min-h-full w-full relative p-6">
    <button class="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-primary font-bold text-sm transition-colors z-10" @click="$emit('back')">
      <ChevronLeft class="w-4 h-4" /> {{ $t('game_selector.back') }}
    </button>
    
    <div class="w-full max-w-5xl">
      <h2 class="text-4xl font-black text-primary text-center mb-2">{{ $t('game_selector.title') }}</h2>
      <p class="text-muted-foreground text-center mb-12">{{ $t('game_selector.subtitle') }}</p>
      
      <div id="game-type-selector" class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <SelectionCard
          id="blind-test-game"
          :title="$t('game_selector.blind_test')"
          :description="$t('game_selector.blind_test_desc')"
          themeColor="#FFBA49"
          themeBg="#fff6e0"
          @click="$emit('select-game', 'blind_test')"
        >
          <template #icon><Music class="w-10 h-10" /></template>
        </SelectionCard>

        <SelectionCard
          :title="$t('game_selector.quiz')"
          :description="$t('game_selector.quiz_desc')"
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
