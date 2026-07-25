<template>
  <div class="flex flex-col items-center justify-center min-h-full w-full relative p-6">
    <button class="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-primary font-bold text-sm transition-colors z-10" @click="$emit('back')">
      <ChevronLeft class="w-4 h-4" /> {{ $t('setup.back') }}
    </button>
    
    <div class="w-full max-w-5xl">
      <h2 class="text-4xl font-black text-primary text-center mb-2">{{ $t('setup.title') }}</h2>
      <p class="text-muted-foreground text-center mb-12">{{ $t('setup.subtitle') }}</p>
      
      <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
        <SelectionCard
          :title="$t('setup.playlists')"
          :description="$t('setup.playlists_desc')"
          themeColor="#10b981"
          themeBg="#ebf8f2"
          @click="$emit('select-setup', 'playlists')"
        >
          <template #icon><ListMusic class="w-10 h-10" /></template>
        </SelectionCard>

        <SelectionCard
          :title="$t('setup.images')"
          :description="$t('setup.images_desc')"
          disabled
        >
          <template #icon><Image class="w-10 h-10" /></template>
        </SelectionCard>

        <SelectionCard
          :title="$t('setup.questions')"
          :description="$t('setup.questions_desc')"
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
