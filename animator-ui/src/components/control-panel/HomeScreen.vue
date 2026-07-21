<template>
  <div class="flex flex-col items-center pt-24 h-full w-full relative">
    <div class="max-w-lg w-full px-4 flex flex-col gap-4">
      <!-- Title -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-black text-primary mb-2">Régie</h1>
        <p class="text-muted-foreground font-medium">Gérez votre partie de Blind Test</p>
      </div>

      <!-- btn 1: Nouvelle Partie -->
      <button class="relative group w-full text-left outline-none" @click="$emit('create-game')">
        <div class="absolute inset-0 bg-[#FFBA49] rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-300 translate-y-1.5"></div>
        <div class="relative flex items-center p-4 bg-[#FFBA49] group-hover:bg-[#ffaa00] group-hover:-translate-y-1 group-hover:shadow-lg transition-all duration-300 rounded-2xl shadow-sm border border-[#f0aa30]">
          <div class="w-12 h-12 rounded-xl bg-white/25 flex items-center justify-center text-[#3F4739] mr-5 shrink-0">
            <Zap class="w-5 h-5" />
          </div>
          <span class="text-lg font-bold text-[#3F4739] flex-1">Nouvelle Partie</span>
          <ChevronRight class="w-5 h-5 text-[#3F4739]/50 group-hover:text-[#3F4739]/80 transition-colors mr-2 shrink-0" />
        </div>
      </button>

      <!-- btn 2: Reprendre -->
      <button v-if="lastGameId" class="group flex items-center p-4 bg-white hover:bg-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm text-left outline-none" @click="$emit('resume-game')">
        <div class="w-12 h-12 rounded-xl bg-[#fff6e0] flex items-center justify-center text-[#FFBA49] mr-5 shrink-0">
          <RefreshCw class="w-5 h-5" />
        </div>
        <span class="text-lg font-bold text-primary flex-1">Reprendre la partie</span>
        <span class="px-3 py-1 bg-[#fff6e0] text-[#3F4739] font-bold text-[11px] rounded-lg tracking-wider uppercase mr-2 border border-[#fef3c7]">{{ lastGameId }}</span>
      </button>

      <!-- btn 3: Playlists -->
      <button class="group flex items-center p-4 bg-white hover:bg-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm text-left outline-none" @click="$emit('open-playlists')">
        <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 mr-5 shrink-0">
          <ListMusic class="w-5 h-5" />
        </div>
        <span class="text-lg font-bold text-primary flex-1">Mise en place (Playlists)</span>
        <ChevronRight class="w-5 h-5 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors mr-2 shrink-0" />
      </button>

      <!-- btn 4: Diagnostics -->
      <button class="group flex items-center p-4 bg-white hover:bg-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm text-left outline-none" @click="$emit('run-diagnostics')">
        <div class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 mr-5 shrink-0">
          <Activity class="w-5 h-5" />
        </div>
        <span class="text-lg font-bold text-primary flex-1">Lancer les diagnostics</span>
        <ChevronRight class="w-5 h-5 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors mr-2 shrink-0" />
      </button>

      <!-- btn 5: Settings -->
      <button class="group flex items-center p-4 bg-white hover:bg-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm text-left outline-none" @click="$emit('open-settings')">
        <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 mr-5 shrink-0">
          <Settings class="w-5 h-5" />
        </div>
        <span class="text-lg font-bold text-primary flex-1">Paramètres globaux</span>
        <ChevronRight class="w-5 h-5 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors mr-2 shrink-0" />
      </button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { Settings, Zap, RefreshCw, ListMusic, ChevronRight, Activity } from '@lucide/vue';

defineProps<{
  lastGameId: string;
}>();

defineEmits<{
  (e: 'open-settings'): void;
  (e: 'create-game'): void;
  (e: 'resume-game'): void;
  (e: 'open-playlists'): void;
  (e: 'run-diagnostics'): void;
}>();
</script>
