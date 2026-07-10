<template>
  <div class="centered-panel">
    <button class="settings-btn" @click="$emit('open-settings')" title="Paramètres">
      ⚙️
    </button>
    
    <div class="welcome-box">
      <h1>Bienvenue dans la Régie</h1>
      <p>Prêt à animer un Blind Test inoubliable ?</p>
      
      <div class="home-actions">
        <button class="btn btn-primary btn-lg" @click="$emit('create-game')">
          ✨ Nouvelle Partie
        </button>
        
        <button class="btn btn-secondary btn-lg" v-if="lastGameId" @click="$emit('resume-game')">
          🔄 Reprendre la partie ({{ lastGameId }})
        </button>
        
        <button class="btn btn-action btn-lg" @click="$emit('open-playlists')">
          📋 Mise en place (Playlists)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  lastGameId: string;
}>();

defineEmits<{
  (e: 'open-settings'): void;
  (e: 'create-game'): void;
  (e: 'resume-game'): void;
  (e: 'open-playlists'): void;
}>();
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
.welcome-box {
  text-align: center;
  background: rgba(43, 43, 64, 0.6);
  padding: 50px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 600px;
}
.settings-btn {
  position: absolute;
  top: 30px;
  right: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 1.8rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}
.settings-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(45deg);
}
.welcome-box h1 {
  font-size: 3rem;
  color: #ffc700;
  margin-bottom: 10px;
}
.welcome-box p {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40px;
}
.home-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}
.btn-lg {
  padding: 15px 30px;
  font-size: 1.2rem;
  width: 100%;
  max-width: 350px;
}
</style>
