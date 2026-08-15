<template>
  <div class="flex w-full h-screen bg-muted/30 text-foreground overflow-hidden font-sans">
    <!-- Disconnection Warning Modal (Blocks UI entirely) -->
    <div v-if="!isBackendConnected" class="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-4">
      <div class="bg-card text-card-foreground p-8 rounded-2xl shadow-2xl max-w-md w-full flex flex-col items-center text-center border border-red-500/20">
        <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <span class="text-4xl">⚠️</span>
        </div>
        <h2 class="text-2xl font-bold text-red-600 mb-3">{{ $t('control_panel.backend_disconnected_title') }}</h2>
        <p class="text-muted-foreground mb-6">
          {{ $t('control_panel.backend_disconnected') }}
        </p>
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ $t('control_panel.reconnecting') }}
        </div>
      </div>
    </div>
    
    
    <router-view />

    <!-- Global Tutorial Exit Button -->
    <button 
      v-if="isTutorialActive" 
      @click="handleExitClick"
      class="fixed bottom-6 right-6 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full shadow-lg flex items-center gap-2 transition-transform transform hover:scale-105"
      style="z-index: 100000; pointer-events: auto !important;"
    >
      <XCircle class="w-5 h-5" />
      {{ $t('tutorial.buttons.exit') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useUiStore } from '../core/domain/general/stores/ui';
import { useBackendConnection } from '../core/domain/general/useBackendConnection';
import { useTutorial } from '../core/domain/tutorial/useTutorial';
import { useDialog } from '../core/domain/general/useDialog';
import { useI18n } from 'vue-i18n';
import { XCircle } from '@lucide/vue';
import { updateService } from '../services/updateService';

import { useGameSession } from '../core/domain/games/useGameSession';

const { isBackendConnected, isProjectorOpen } = useUiStore();


const { startConnectionMonitor, stopConnectionMonitor } = useBackendConnection();
const { isTutorialActive, exitTutorial } = useTutorial();
const { showConfirm } = useDialog();
const { t } = useI18n();
const { closeProjector } = useGameSession();

const handleExitClick = async () => {
  const confirmed = await showConfirm({
    title: t('dialogs.exit_tutorial.title'),
    message: t('dialogs.exit_tutorial.message'),
    confirmText: t('tutorial.buttons.exit'),
    confirmVariant: 'danger'
  });
  
  if (confirmed) {
    exitTutorial();
  }
};

onMounted(() => {
  startConnectionMonitor();
  
  window.addEventListener('projector-closed-native', async () => {
    isProjectorOpen.value = false;
    await closeProjector();
  });

  checkUpdates();
});

async function checkUpdates() {
  try {
    const update = await updateService.checkForUpdates();
    if (update.available) {
      const confirmed = await showConfirm({
        title: t('update.title'),
        message: t('update.message', { latest: update.latestVersion, current: update.currentVersion }),
        confirmText: t('update.see_latest'),
        cancelText: t('update.ok'),
        confirmVariant: 'primary'
      });

      if (confirmed) {
        window.open('https://github.com/loicpp/mini-host/releases/latest', '_blank');
      }
    }
  } catch (error) {
    console.error('Erreur réseau lors de la vérification des mises à jour:', error);
  }
}

onUnmounted(() => {
  stopConnectionMonitor();
});
</script>
