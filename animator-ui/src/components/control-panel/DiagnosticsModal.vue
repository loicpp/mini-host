<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h2 style="color: #ffc700; margin-top: 0;">🧪 Diagnostics du Système</h2>
      <p style="color: rgba(255,255,255,0.8); margin-bottom: 20px;">
        Vérification en cours des différents services et de la lecture audio...
      </p>

      <ul class="diagnostic-list">
        <li v-for="(step, index) in steps" :key="index" :id="'step-' + index" class="diagnostic-item" :class="step.status">
          <span class="icon">
            {{ step.status === 'pending' ? '⏳' : step.status === 'running' ? '🔄' : step.status === 'success' ? '✅' : '❌' }}
          </span>
          <div class="details">
            <span class="title">{{ step.name }}</span>
            <span v-if="step.message" class="message">{{ step.message }}</span>
          </div>
        </li>
      </ul>

      <div style="margin-top: 30px; text-align: right;">
        <button class="btn btn-secondary" @click="$emit('close')" :disabled="isRunning">
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
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

const setStepRunning = async (index: number) => {
  steps.value[index].status = 'running';
  await nextTick();
  const el = document.getElementById('step-' + index);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

const runDiagnostics = async () => {
  isRunning.value = true;

  // Step 1: Internet
  await setStepRunning(0);
  try {
    await fetch('https://www.google.com', { mode: 'no-cors' });
    steps.value[0].status = 'success';
    steps.value[0].message = 'Connecté au réseau public';
  } catch (_e: any) {
    steps.value[0].status = 'error';
    steps.value[0].message = 'Pas de connexion Internet';
    isRunning.value = false;
    return;
  }

  // Step 2: Local Permissions
  await setStepRunning(1);
  try {
    const res = await fetch('http://127.0.0.1:5000/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diagnostics_test_write: true })
    });
    if (!res.ok) throw new Error();
    steps.value[1].status = 'success';
    steps.value[1].message = 'Sauvegardes possibles';
  } catch (_e: any) {
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
  } catch (_e: any) {
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
  } catch (_e: any) {
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
  } catch (_e: any) {
    steps.value[7].status = 'error';
    steps.value[7].message = _e.message || "Erreur de récupération";
  }

  // Step 9: Firebase Clean
  await setStepRunning(8);
  try {
    await animatorService.deleteGame(testGameId);
    steps.value[8].status = 'success';
    steps.value[8].message = 'Partie supprimée';
  } catch (_e: any) {
    steps.value[8].status = 'error';
    steps.value[8].message = _e.message || "Erreur de nettoyage";
  }

  isRunning.value = false;
};

onMounted(() => {
  runDiagnostics();
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.modal-content {
  background: #1e1e2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  color: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.diagnostic-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 350px;
  overflow-y: auto;
  padding-right: 10px;
  padding-bottom: 20px;
  scroll-padding-bottom: 20px;
  scroll-padding-top: 20px;
}
.diagnostic-list::-webkit-scrollbar {
  width: 6px;
}
.diagnostic-list::-webkit-scrollbar-thumb {
  background-color: rgba(255,255,255,0.2);
  border-radius: 4px;
}
.diagnostic-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  transition: background 0.3s;
}
.diagnostic-item.success {
  background: rgba(0, 255, 100, 0.1);
}
.diagnostic-item.error {
  background: rgba(255, 50, 50, 0.1);
}
.diagnostic-item.running {
  background: rgba(255, 200, 0, 0.1);
}
.icon {
  font-size: 1.5rem;
}
.details {
  display: flex;
  flex-direction: column;
}
.title {
  font-weight: 600;
}
.message {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.6);
}
</style>
