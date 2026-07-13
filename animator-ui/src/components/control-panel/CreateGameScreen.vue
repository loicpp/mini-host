<template>
  <div class="centered-panel">
    <button class="btn-back top-left-btn" @click="$emit('back')" title="Retourner à l'accueil">
      ⬅️ Retour
    </button>
    <div class="settings-panel card glass" style="max-width: 600px; width: 100%;">
      <h2>Nouvelle Partie</h2>
      <p class="settings-desc">Configurez les paramètres de votre partie.</p>
      
      <div class="form-group">
        <label>Temps de réponse (secondes) :</label>
        <input type="number" v-model.number="settings.duration" min="1" max="120" step="1" class="modern-input" />
      </div>

      <div class="form-group">
        <label>Mode de jeu :</label>
        <select v-model="settings.mode" class="modern-input">
          <option value="buzzer">Buzzer (Le premier qui clique répond)</option>
          <option value="text">Saisie de la musique (Chacun tape sa réponse)</option>
        </select>
      </div>

      <div class="form-group">
        <label>Playlist :</label>
        <select v-model="settings.playlist" class="modern-input">
          <option :value="null">Aucune</option>
          <option v-for="pl in playlists" :key="pl.id" :value="pl">
            {{ pl.name }} ({{ pl.tracks.length }} titres)
          </option>
        </select>
      </div>
      
      <button class="btn btn-primary btn-lg" style="width: 100%; margin-top: 20px;" @click="startGame">
        Créer la partie
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'start-game', settings: any): void;
}>();

const playlists = ref<any[]>([]);

const settings = ref({
  duration: 30,
  mode: 'text',
  playlist: null as any
});

onMounted(async () => {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/playlists');
    const data = await res.json();
    if (Array.isArray(data)) {
      playlists.value = data;
    } else if (data.playlists) {
      playlists.value = data.playlists;
    }
  } catch(e) {
    console.warn("Could not load playlists for game creation", e);
  }
});

let durationTimeout: ReturnType<typeof setTimeout> | null = null;

watch(() => settings.value.duration, () => {
  if (durationTimeout) {
    clearTimeout(durationTimeout);
  }

  durationTimeout = setTimeout(() => {
    if ((settings.value.duration as any) === '' || (settings.value.duration as any) === null) {
      settings.value.duration = 1;
      return;
    }
    
    const num = Number(settings.value.duration);
    if (num < 1) {
      settings.value.duration = 1;
    } else if (!Number.isInteger(num)) {
      settings.value.duration = Math.floor(num);
    }
  }, 2000);
});

const startGame = () => {
  let duration = Math.floor(Number(settings.value.duration));
  if (isNaN(duration) || duration <= 0) {
    duration = 1; // force to at least 1 if 0 or invalid
  }
  settings.value.duration = duration;
  emit('start-game', settings.value);
};
</script>

<style scoped>
.centered-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: white;
  width: 100%;
  position: relative;
}
.top-left-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
}
.btn-back {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0;
  transition: color 0.3s;
}
.btn-back:hover {
  color: #f1416c;
}
.settings-panel {
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.settings-panel h2 {
  font-size: 2.5rem;
  color: #ffc700;
  margin: 0;
  text-align: center;
}
.settings-desc {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10px;
  text-align: center;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-group label {
  font-weight: bold;
  color: #eee;
}
.modern-input {
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 8px;
  outline: none;
  font-size: 1.1rem;
}
.modern-input:focus {
  border-color: #ffc700;
}
</style>
