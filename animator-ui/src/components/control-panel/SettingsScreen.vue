<template>
  <div class="centered-panel">
    <div class="settings-panel card glass">
      <h2>Paramètres Audio</h2>
      <p class="settings-desc">Sélectionnez la source de musique qui sera utilisée par défaut pour vos parties.</p>
      
      <div class="input-group">
        <label>Source Audio :</label>
        <select v-model="localSource" class="modern-select">
          <option value="soundcloud">☁️ Lien SoundCloud</option>
          <option value="local">📁 Fichier Audio (MP3 Local)</option>
        </select>
      </div>

      <div class="settings-actions">
        <button class="btn btn-secondary" @click="$emit('back')">⬅️ Retour</button>
        <button class="btn btn-primary" @click="$emit('save')">Sauvegarder</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  preferredSource: string;
}>();

const emit = defineEmits<{
  (e: 'update:preferredSource', val: string): void;
  (e: 'back'): void;
  (e: 'save'): void;
}>();

const localSource = ref(props.preferredSource);

watch(localSource, (newVal) => {
  emit('update:preferredSource', newVal);
});
watch(() => props.preferredSource, (newVal) => {
  localSource.value = newVal;
});
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
.settings-panel {
  max-width: 500px;
  width: 100%;
  padding: 40px;
}
.settings-panel h2 {
  font-size: 2rem;
  color: #ffc700;
  margin-bottom: 10px;
}
.settings-desc {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
}
.modern-select {
  width: 100%;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 8px;
  font-size: 1.1rem;
  outline: none;
}
.modern-select option {
  background: #2b2b40;
}
.settings-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  gap: 15px;
}
.settings-actions .btn {
  flex: 1;
}
.btn-block {
  width: 100%;
}
</style>
