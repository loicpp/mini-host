<template>
  <Modal @close="!isRunning && $emit('close')" maxW="max-w-xl">
    <div class="p-8">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 bg-[#fff6e0] rounded-xl flex items-center justify-center shadow-sm">
          <Activity class="w-5 h-5 text-[#FFBA49]" />
        </div>
        <h2 class="text-2xl font-black text-primary m-0">Diagnostics du Système</h2>
      </div>
      <p class="text-muted-foreground mb-6">
        Vérification en cours des différents services et de la lecture audio...
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
          Fermer
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

const isRunning = ref(true);

const steps = ref([
  { name: 'Connectivité Internet', status: 'pending', message: '' },
  { name: 'Droits d\'écriture locaux', status: 'pending', message: '' },
  { name: 'Communication Projecteur', status: 'pending', message: '' },
  { name: 'Connexion au Backend Local', status: 'pending', message: '' },
  { name: 'Test de Lecture', status: 'pending', message: '' },
  { name: 'Création d\'une partie Firebase', status: 'pending', message: '' },
  { name: 'Test d\'accès joueur (URL)', status: 'pending', message: '' },
  { name: 'Récupération de la partie', status: 'pending', message: '' },
  { name: 'Nettoyage (Suppression)', status: 'pending', message: '' }
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
    steps.value[0].message = 'Connecté au réseau public';
  } catch {
    steps.value[0].status = 'error';
    steps.value[0].message = 'Pas de connexion Internet';
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
    
    steps.value[1].status = 'success';
    steps.value[1].message = 'Sauvegardes possibles';
  } catch {
    steps.value[1].status = 'error';
    steps.value[1].message = 'Dossier en lecture seule ?';
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
    steps.value[2].message = 'Prêt à projeter';
  } catch {
    steps.value[2].status = 'error';
    steps.value[2].message = 'Erreur d\'API Projecteur';
    isRunning.value = false;
    return;
  }

  // Step 4: Backend
  await setStepRunning(3);
  try {
    const res = await fetch('http://127.0.0.1:5000/api/test_connection');
    if (!res.ok) throw new Error("Backend indisponible");
    steps.value[3].status = 'success';
    steps.value[3].message = 'Connecté (127.0.0.1:5000)';
  } catch (e: any) {
    steps.value[3].status = 'error';
    steps.value[3].message = e.message;
    isRunning.value = false;
    return;
  }

  // Step 5: Music Playback
  await setStepRunning(4);
  steps.value[4].message = 'Chargement de la piste...';
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
      steps.value[4].message = 'Lecture en cours (3s)...';
      await musicManager.play(results[0], 0);
      await wait(3000);
      await musicManager.stop();
      steps.value[4].status = 'success';
      steps.value[4].message = 'Lecture réussie';
    } else {
      throw new Error("Piste introuvable");
    }

    if (originalProvider) {
      await musicManager.setProvider(originalProvider);
    }
  } catch (e: any) {
    steps.value[4].status = 'error';
    steps.value[4].message = e.message || 'Erreur de lecture';
    isRunning.value = false;
    return;
  }

  // Step 6: Firebase Create
  await setStepRunning(5);
  let testGameId = '';
  try {
    const game = await animatorService.createGame();
    testGameId = game.gameId;
    steps.value[5].status = 'success';
    steps.value[5].message = `Partie créée (${testGameId})`;
  } catch (e: any) {
    steps.value[5].status = 'error';
    steps.value[5].message = e.message || "Erreur de création";
    isRunning.value = false;
    return;
  }

  // Step 7: Player App Reachability
  await setStepRunning(6);
  try {
    // Generate a test URL. Note: we just check network reachability here
    const playerUrl = `https://minihostapp-1.web.app/?game=${testGameId}&secret=test`;
    await fetch(playerUrl, { mode: 'no-cors' });
    steps.value[6].status = 'success';
    steps.value[6].message = 'Interface joueur en ligne';
  } catch {
    steps.value[6].status = 'error';
    steps.value[6].message = 'Interface joueur inaccessible';
  }

  // Step 8: Firebase Retrieve
  await setStepRunning(7);
  try {
    const fetchedGame = await animatorService.getGame(testGameId);
    if (!fetchedGame) throw new Error("Partie non trouvée");
    steps.value[7].status = 'success';
    steps.value[7].message = `Données synchronisées`;
  } catch (e: any) {
    steps.value[7].status = 'error';
    steps.value[7].message = e?.message || "Erreur de récupération";
  }

  // Step 9: Firebase Clean
  await setStepRunning(8);
  try {
    await animatorService.deleteGame(testGameId);
    steps.value[8].status = 'success';
    steps.value[8].message = 'Partie supprimée';
  } catch (e: any) {
    steps.value[8].status = 'error';
    steps.value[8].message = e?.message || "Erreur de nettoyage";
  }

  isRunning.value = false;
};

onMounted(() => {
  runDiagnostics();
});
</script>

