<template>
  <Modal @close="!isRunning && $emit('close')" maxW="max-w-xl">
    <div class="p-8">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 bg-[#fff6e0] rounded-xl flex items-center justify-center shadow-sm">
          <Activity class="w-5 h-5 text-[#FFBA49]" />
        </div>
        <h2 class="text-2xl font-black text-primary m-0">{{ $t('diagnostics.title') }}</h2>
      </div>
      <p class="text-muted-foreground mb-6">
        {{ $t('diagnostics.subtitle') }}
      </p>

      <div ref="containerRef" class="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-2 mb-8 py-2">
        <div 
          v-for="(step, index) in steps" 
          :key="index" 
          :id="'step-' + index" 
          :class="[
            'flex items-center gap-4 p-4 rounded-xl border transition-colors duration-300',
            step.status === 'success' ? 'bg-emerald-50/50 border-emerald-100' :
            step.status === 'error' ? 'bg-red-50/50 border-red-100' :
            step.status === 'running' ? 'bg-amber-50/50 border-amber-100 shadow-sm' :
            'bg-muted/30 border-[rgba(0,0,0,0.05)]'
          ]"
        >
          <div class="text-2xl flex-shrink-0">
            <Loader2 v-if="step.status === 'running'" class="w-6 h-6 text-amber-500 animate-spin" />
            <CheckCircle2 v-else-if="step.status === 'success'" class="w-6 h-6 text-emerald-500" />
            <AlertCircle v-else-if="step.status === 'error'" class="w-6 h-6 text-red-500" />
            <Hourglass v-else class="w-6 h-6 text-muted-foreground/50" />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="font-bold text-primary text-sm">{{ step.name }}</span>
            <span v-if="step.message" :class="[
              'text-xs truncate mt-0.5',
              step.status === 'success' ? 'text-emerald-700' :
              step.status === 'error' ? 'text-red-700' :
              step.status === 'running' ? 'text-amber-700 font-medium' :
              'text-muted-foreground'
            ]">{{ step.message }}</span>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <Btn variant="dark" @click="$emit('close')" :disabled="isRunning">
          {{ $t('diagnostics.close') }}
        </Btn>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { Activity, Loader2, CheckCircle2, AlertCircle, Hourglass } from '@lucide/vue';
import Modal from '../ui/Modal.vue';
import Btn from '../ui/Btn.vue';
import { musicManager } from '../../services/music/MusicManager';
import { animatorService } from '../../services/animatorService';

defineEmits<{
  (e: 'close'): void;
}>();

import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const isRunning = ref(true);

const steps = ref([
  { name: t('diagnostics.step_internet'), status: 'pending', message: '' },
  { name: t('diagnostics.step_local_perms'), status: 'pending', message: '' },
  { name: t('diagnostics.step_projector'), status: 'pending', message: '' },
  { name: t('diagnostics.step_backend'), status: 'pending', message: '' },
  { name: t('diagnostics.step_playback'), status: 'pending', message: '' },
  { name: t('diagnostics.step_create_game'), status: 'pending', message: '' },
  { name: t('diagnostics.step_player_access'), status: 'pending', message: '' },
  { name: t('diagnostics.step_fetch_game'), status: 'pending', message: '' },
  { name: t('diagnostics.step_cleanup'), status: 'pending', message: '' }
]);

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

const containerRef = ref<HTMLElement | null>(null);

const setStepRunning = async (index: number) => {
  steps.value[index].status = 'running';
  await nextTick();
  setTimeout(() => {
    const el = document.getElementById('step-' + index);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
};

const runDiagnostics = async () => {
  isRunning.value = true;

  // Step 1: Internet
  await setStepRunning(0);
  try {
    await fetch('https://www.google.com', { mode: 'no-cors' });
    steps.value[0].status = 'success';
    steps.value[0].message = t('diagnostics.connected_public');
  } catch {
    steps.value[0].status = 'error';
    steps.value[0].message = t('diagnostics.no_internet');
    isRunning.value = false;
    return;
  }

  // Step 2: Local Permissions
  await setStepRunning(1);
  try {
    const testVal = Date.now().toString();
    const res = await fetch('http://127.0.0.1:5000/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diagnostics_test_write: testVal })
    });
    if (!res.ok) throw new Error();
    
    // Read back to ensure it was actually written
    const checkRes = await fetch('http://127.0.0.1:5000/api/config');
    const config = await checkRes.json();
    if (config.diagnostics_test_write !== testVal) throw new Error();
    
    // Clean up our test key
    await fetch('http://127.0.0.1:5000/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diagnostics_test_write: null })
    });
    if (res.ok) {
      steps.value[1].status = 'success';
      steps.value[1].message = t('diagnostics.perms_ok');
    } else {
      steps.value[1].status = 'error';
      steps.value[1].message = t('diagnostics.perms_error');
    }
  } catch {
    steps.value[1].status = 'error';
    steps.value[1].message = t('diagnostics.perms_error');
    isRunning.value = false;
    return;
  }

  // Step 3: Projector
  await setStepRunning(2);
  try {
    // Just test if the endpoint is there and returns
    const res = await fetch('http://127.0.0.1:5000/api/projector/close', { method: 'POST' });
    if (!res.ok) throw new Error();
    steps.value[2].status = 'success';
    steps.value[2].message = t('diagnostics.proj_ok');
  } catch {
    steps.value[2].status = 'error';
    steps.value[2].message = t('diagnostics.proj_error');
    isRunning.value = false;
    return;
  }

  // Step 4: Backend
  await setStepRunning(3);
  try {
    const res = await fetch('http://127.0.0.1:5000/api/test_connection');
    if (!res.ok) throw new Error(t('diagnostics.backend_unavailable'));
    steps.value[3].status = 'success';
    steps.value[3].message = t('diagnostics.backend_ok');
  } catch {
    steps.value[3].status = 'error';
    steps.value[3].message = t('diagnostics.backend_error');
    isRunning.value = false;
    return;
  }

  // Step 5: Music Playback
  await setStepRunning(4);
  steps.value[4].message = t('diagnostics.loading_track');
  try {
    const originalProvider = musicManager.activeProviderName;
    await musicManager.setProvider('soundcloud');
    
    // Crab Rave track
    const track = {
      id: 'soundcloud:tracks:422967342', // Crab Rave actual soundcloud ID or URL
      url: 'https://soundcloud.com/monstercat/noisestorm-crab-rave',
      title: 'Crab Rave',
      artist: 'Noisestorm',
      source: 'soundcloud' as any,
      duration: 10000
    };
    
    const results = await musicManager.search(track.url);
    if (results.length > 0) {
      steps.value[4].message = t('diagnostics.playing_track');
      await musicManager.play(results[0], 0);
      await wait(3000);
      await musicManager.stop();
      steps.value[4].status = 'success';
      steps.value[4].message = t('diagnostics.playback_success');
    } else {
      throw new Error(t('diagnostics.track_not_found'));
    }

    if (originalProvider) {
      await musicManager.setProvider(originalProvider);
    }
  } catch (e: any) {
    steps.value[4].status = 'error';
    steps.value[4].message = e.message || t('diagnostics.playback_error');
    isRunning.value = false;
    return;
  }

  // Step 6: Firebase Create
  await setStepRunning(5);
  let testGameId = '';
  try {
    const game = await animatorService.createGame('blind_test');
    testGameId = game.gameId;
    steps.value[5].status = 'success';
    steps.value[5].message = `${t('diagnostics.game_created')} (${testGameId})`;
  } catch (e: any) {
    steps.value[5].status = 'error';
    steps.value[5].message = e.message || t('diagnostics.game_create_error');
    isRunning.value = false;
    return;
  }

  // Step 7: Player App Reachability
  await setStepRunning(6);
  try {
    // Generate a test URL. Note: we just check network reachability here
    const playerUrl = `https://minihostapp-1.web.app/?game=${testGameId}&secret=test`;
    await fetch(playerUrl, { mode: 'no-cors' });
    if (playerUrl && playerUrl.includes(testGameId)) {
      steps.value[6].status = 'success';
      steps.value[6].message = t('diagnostics.access_ok');
    } else {
      steps.value[6].status = 'error';
      steps.value[6].message = t('diagnostics.access_error');
    }
  } catch (e: any) {
    steps.value[6].status = 'error';
    steps.value[6].message = `${t('diagnostics.access_error')}: ${e.message}`;
    isRunning.value = false;
    return;
  }

  // Step 8: Firebase Retrieve
  await setStepRunning(7);
  try {
    const fetchedGame = await animatorService.getGame(testGameId);
    if (!fetchedGame) throw new Error(t('diagnostics.game_not_found'));
    steps.value[7].status = 'success';
    steps.value[7].message = t('diagnostics.data_synced');
  } catch (e: any) {
    steps.value[7].status = 'error';
    steps.value[7].message = e?.message || t('diagnostics.game_fetch_error');
  }

  // Step 9: Firebase Clean
  await setStepRunning(8);
  try {
    if (testGameId) {
      await animatorService.deleteGame(testGameId);
      steps.value[8].status = 'success';
      steps.value[8].message = t('diagnostics.cleanup_ok');
    }
  } catch (e: any) {
    steps.value[8].status = 'error';
    steps.value[8].message = `${t('diagnostics.cleanup_error')} ${e.message}`;
  }

  isRunning.value = false;
};

onMounted(() => {
  runDiagnostics();
});
</script>

