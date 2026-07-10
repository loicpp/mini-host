<template>
  <div class="centered-panel">
    <button class="btn-back top-left-btn" @click="$emit('back')" title="Retourner à l'accueil">
      ⬅️ Quitter l'édition
    </button>
    <div class="settings-panel card glass" style="max-width: 800px; width: 100%;">
      <h2>📋 Mes Playlists</h2>
      <p class="settings-desc">Créez et gérez vos playlists de musiques SoundCloud pour vos Blind Tests.</p>
      
      <div v-if="!selectedPlaylist" class="playlist-list">
        <div class="input-group" style="display:flex; gap:10px; margin-bottom: 20px;">
          <input type="text" v-model="newPlaylistName" placeholder="Nom de la nouvelle playlist..." style="flex:1" class="modern-input" />
          <button class="btn btn-primary" @click="createPlaylist" :disabled="!newPlaylistName.trim()">Créer</button>
        </div>

        <div v-if="playlists.length === 0" class="empty-state">
          Aucune playlist pour le moment.
        </div>
        <div v-else class="tracks-list">
          <div v-for="pl in playlists" :key="pl.id" class="track-item" style="justify-content: space-between;">
            <div>
              <h4 style="margin:0; color:white;">{{ pl.name }}</h4>
              <p style="margin:0; color:rgba(255,255,255,0.6); font-size:0.9rem;">{{ pl.tracks.length }} titres</p>
            </div>
            <div style="display:flex; gap: 10px;">
              <button class="btn-sm btn-secondary" @click="editPlaylist(pl)">Éditer</button>
              <button class="btn-sm btn-danger" @click="deletePlaylist(pl.id)">X</button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="playlist-editor">
        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin:0; color: #ffc700;">Édition : {{ selectedPlaylist.name }} ({{ selectedPlaylist.tracks.length }} titres)</h3>
          <button class="btn-sm btn-secondary" @click="selectedPlaylist = null">⬅️ Retour aux playlists</button>
        </div>

        <div class="add-track-form" style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="margin-top:0;">Ajouter un titre (SoundCloud)</h4>
          <div style="display:flex; gap:10px; margin-bottom: 10px;">
            <input type="text" v-model="newTrack.title" placeholder="Titre du morceau" class="modern-input" style="flex:1" />
            <input type="text" v-model="newTrack.artist" placeholder="Artiste" class="modern-input" style="flex:1" />
          </div>
          <div style="display:flex; gap:10px;">
            <input type="text" v-model="newTrack.url" placeholder="Lien SoundCloud complet" class="modern-input" style="flex:2" />
            <button class="btn btn-primary" @click="addTrack" :disabled="!newTrack.url.trim()">Ajouter</button>
          </div>
        </div>

        <div v-if="selectedPlaylist.tracks.length === 0" class="empty-state">
          Cette playlist est vide.
        </div>
        <div v-else class="tracks-list" style="max-height: 300px; overflow-y: auto; padding-right: 10px;">
          <div v-for="(track, index) in selectedPlaylist.tracks" :key="index" class="track-item" style="justify-content: space-between; padding: 10px;">
            <div>
              <h4 style="margin:0; color:white;">{{ track.title }} - {{ track.artist }}</h4>
              <p style="margin:0; color:rgba(255,255,255,0.6); font-size:0.8rem; overflow:hidden; text-overflow:ellipsis; max-width: 400px; white-space: nowrap;">{{ track.url }}</p>
            </div>
            <div style="display: flex; gap: 5px;">
              <button class="btn-sm btn-secondary" v-if="testingTrackUrl !== track.url" @click="testTrack(track.url)">Tester</button>
              <button class="btn-sm btn-action" v-else @click="stopTest">Stop</button>
              <button class="btn-sm btn-danger" @click="removeTrack(index)">Retirer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { musicManager } from '../../services/music/MusicManager';

defineEmits<{
  (e: 'back'): void;
}>();

interface Track {
  title: string;
  artist: string;
  url: string;
}

interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}

const playlists = ref<Playlist[]>([]);
const newPlaylistName = ref('');
const selectedPlaylist = ref<Playlist | null>(null);

const newTrack = ref<Track>({ title: '', artist: '', url: '' });

const testingTrackUrl = ref<string | null>(null);
const testingTrackId = ref<string | null>(null);
const testingTrackSource = ref<string>('youtube');

const getUrlSource = (url: string) => {
  if (url.includes("soundcloud.com")) return "soundcloud";
  return "youtube";
};

const extractYoutubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const extractSoundCloudId = (url: string): string | null => {
  if (url.includes("soundcloud.com")) return url;
  return null;
};

const testTrack = async (url: string) => {
  const source = getUrlSource(url);
  let id = null;
  if (source === 'youtube') id = extractYoutubeId(url);
  if (source === 'soundcloud') id = extractSoundCloudId(url);
  
  if (id) {
    testingTrackUrl.value = url;
    testingTrackId.value = id;
    testingTrackSource.value = source;
    try {
      await musicManager.play({
        id: id,
        title: "Test",
        artist: "Test",
        duration: 30000,
        source: source as 'soundcloud'
      });
    } catch(err) {
      console.error(err);
    }
  } else {
    alert("Lien invalide.");
  }
};

const stopTest = async () => {
  testingTrackUrl.value = null;
  testingTrackId.value = null;
  await musicManager.stop();
};

onMounted(async () => {
  try {
    const configRes = await fetch('http://127.0.0.1:5000/api/playlists');
    const data = await configRes.json();
    if (Array.isArray(data)) {
      playlists.value = data;
    } else if (data.playlists) {
      playlists.value = data.playlists; // backward compatibility
    }
  } catch(e) {
    console.warn("Could not load playlists", e);
  }
});

const saveToConfig = async () => {
  try {
    await fetch('http://127.0.0.1:5000/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(playlists.value)
    });
  } catch(e) {
    console.warn("Could not save playlists", e);
  }
};

const createPlaylist = async () => {
  if (!newPlaylistName.value.trim()) return;
  const newPl: Playlist = {
    id: Date.now().toString(),
    name: newPlaylistName.value.trim(),
    tracks: []
  };
  playlists.value.push(newPl);
  newPlaylistName.value = '';
  await saveToConfig();
};

const deletePlaylist = async (id: string) => {
  if (confirm("Voulez-vous vraiment supprimer cette playlist ?")) {
    playlists.value = playlists.value.filter(p => p.id !== id);
    await saveToConfig();
  }
};

const editPlaylist = (pl: Playlist) => {
  selectedPlaylist.value = pl;
};

const addTrack = async () => {
  if (!selectedPlaylist.value) return;
  if (!newTrack.value.url.trim()) return;
  
  selectedPlaylist.value.tracks.push({
    title: newTrack.value.title.trim() || 'Inconnu',
    artist: newTrack.value.artist.trim() || 'Inconnu',
    url: newTrack.value.url.trim()
  });
  
  newTrack.value = { title: '', artist: '', url: '' };
  await saveToConfig();
};

const removeTrack = async (index: number) => {
  if (!selectedPlaylist.value) return;
  selectedPlaylist.value.tracks.splice(index, 1);
  await saveToConfig();
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
.modern-input {
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 8px;
  outline: none;
}
.modern-input:focus {
  border-color: #ffc700;
}
.tracks-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.track-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
}
.empty-state {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  padding: 20px;
  font-style: italic;
}
</style>
