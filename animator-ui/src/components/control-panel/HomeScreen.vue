<template>
  <div class="flex flex-col items-center pt-24 h-full w-full relative">
    <div id="home-screen" class="max-w-lg w-full px-4 flex flex-col gap-4">
      <!-- Title -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-black text-primary mb-2">{{ $t('home.title') }}</h1>
        <p class="text-muted-foreground font-medium">{{ $t('home.subtitle') }}</p>
      </div>

      <!-- btn 1: Nouvelle Partie -->
      <button id="btn-create-game" class="relative group w-full text-left outline-none" @click="$emit('create-game')">
        <div class="absolute inset-0 bg-[#FFBA49] rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-300 translate-y-1.5"></div>
        <div class="relative flex items-center p-4 bg-[#FFBA49] group-hover:bg-[#ffaa00] group-hover:-translate-y-1 group-hover:shadow-lg transition-all duration-300 rounded-2xl shadow-sm border border-[#f0aa30]">
          <div class="w-12 h-12 rounded-xl bg-white/25 flex items-center justify-center text-[#3F4739] mr-5 shrink-0">
            <Zap class="w-5 h-5" />
          </div>
          <span class="text-lg font-bold text-[#3F4739] flex-1">{{ $t('home.new_game') }}</span>
          <ChevronRight class="w-5 h-5 text-[#3F4739]/50 group-hover:text-[#3F4739]/80 transition-colors mr-2 shrink-0" />
        </div>
      </button>

      <!-- btn 2: Reprendre -->
      <MenuActionBtn 
        v-if="lastGameId"
        :title="$t('home.resume_game')"
        colorClass="bg-[#fff6e0] text-[#FFBA49]"
        @click="$emit('resume-game')"
      >
        <template #icon><RefreshCw class="w-5 h-5" /></template>
        <template #extra>
          <span class="px-3 py-1 bg-[#fff6e0] text-[#3F4739] font-bold text-[11px] rounded-lg tracking-wider uppercase mr-2 border border-[#fef3c7]">{{ lastGameId }}</span>
        </template>
      </MenuActionBtn>

      <!-- btn 3: Setup -->
      <MenuActionBtn 
        id="btn-setup"
        :title="$t('home.setup')"
        colorClass="bg-purple-50 text-purple-500"
        @click="$emit('open-setup')"
      >
        <template #icon><Database class="w-5 h-5" /></template>
      </MenuActionBtn>

      <!-- btn 4: Diagnostics -->
      <MenuActionBtn 
        id="btn-diagnostics"
        :title="$t('home.diagnostics')"
        colorClass="bg-gray-100 text-gray-500"
        @click="$emit('run-diagnostics')"
      >
        <template #icon><Activity class="w-5 h-5" /></template>
      </MenuActionBtn>

      <!-- btn 5: Settings -->
      <MenuActionBtn 
        id="btn-settings"
        :title="$t('home.settings')"
        colorClass="bg-blue-50 text-blue-500"
        @click="$emit('open-settings')"
      >
        <template #icon><Settings class="w-5 h-5" /></template>
      </MenuActionBtn>
    </div>

    <!-- Tutorial Floating Button -->
    <button 
      v-if="!isTutorialActive"
      @click="startTutorial"
      class="fixed bottom-6 right-6 z-[50] w-14 h-14 bg-gradient-to-tr from-blue-500 to-cyan-400 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 group"
      :title="$t('tutorial.buttons.launch')"
    >
      <HelpCircle class="w-7 h-7" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Settings, Zap, RefreshCw, Database, Activity, ChevronRight, HelpCircle } from '@lucide/vue';
import MenuActionBtn from '../ui/MenuActionBtn.vue';
import { useTutorial } from '../../composables/useTutorial';

const { startTutorial, isTutorialActive } = useTutorial();

defineProps<{
  lastGameId: string | null;
}>();

defineEmits<{
  (e: 'create-game'): void;
  (e: 'resume-game'): void;
  (e: 'open-setup'): void;
  (e: 'run-diagnostics'): void;
  (e: 'open-settings'): void;
}>();
</script>
