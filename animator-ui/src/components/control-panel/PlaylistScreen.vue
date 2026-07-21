<template>
  <div class="flex flex-col items-center justify-start min-h-full w-full relative py-12 px-6">
    <button class="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-primary font-bold text-sm transition-colors z-10" @click="handleBack" title="Retourner à l'accueil">
      <ChevronLeft class="w-4 h-4" /> Quitter l'édition
    </button>
    
    <div class="bg-white p-10 rounded-3xl border border-[rgba(0,0,0,0.08)] shadow-xl w-full max-w-4xl">
      <h2 class="text-3xl font-black text-primary text-center mb-2 flex items-center justify-center gap-3">
        <ListMusic class="w-8 h-8 text-[#FFBA49]" /> Mes Playlists
      </h2>
      <p class="text-muted-foreground text-center mb-8">Créez et gérez vos playlists de musiques SoundCloud pour vos Blind Tests.</p>
      
      <div v-if="!selectedPlaylist" class="flex flex-col">
        <div class="flex gap-4 mb-8">
          <input type="text" v-model="newPlaylistName" placeholder="Nom de la nouvelle playlist..." class="flex-1 px-4 py-3 bg-muted rounded-xl border-none text-foreground focus:ring-2 focus:ring-[#FFBA49] transition-shadow outline-none font-medium" />
          <Btn variant="primary" @click="createPlaylist" :disabled="!newPlaylistName.trim()">
            <Plus class="w-4 h-4 mr-2" /> Créer
          </Btn>
        </div>

        <div v-if="playlists.length === 0" class="text-center p-8 bg-muted/50 rounded-2xl border border-dashed border-muted-foreground/30 text-muted-foreground font-medium italic">
          Aucune playlist pour le moment.
        </div>
        <div v-else class="flex flex-col gap-3">
          <div v-for="pl in playlists" :key="pl.id" class="flex items-center justify-between p-4 bg-muted/50 border border-[rgba(0,0,0,0.05)] rounded-2xl hover:bg-muted transition-colors">
            <div>
              <h4 class="font-bold text-primary text-lg m-0">{{ pl.name }}</h4>
              <p class="text-muted-foreground text-sm m-0">{{ pl.tracks.length }} titres</p>
            </div>
            <div class="flex gap-2">
              <Btn variant="ghost-yellow" size="sm" @click="editPlaylist(pl)">
                <Edit3 class="w-4 h-4 mr-2" /> Éditer
              </Btn>
              <button class="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors" @click="deletePlaylist(pl.id)" title="Supprimer la playlist">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col">
        <div class="flex justify-between items-center mb-6 pb-4 border-b border-[rgba(0,0,0,0.05)]">
          <Btn variant="soft" size="sm" @click="closeEdition">
            <ChevronLeft class="w-4 h-4 mr-1" /> Retour aux playlists
          </Btn>
          <h3 class="text-xl font-bold text-primary m-0 flex items-center gap-2">
            <span class="text-[#FFBA49]">Édition :</span> {{ selectedPlaylist.name }} 
            <Badge color="gray">{{ selectedPlaylist.tracks.length }} titres</Badge>
          </h3>
        </div>

        <div class="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl mb-8">
          <h4 class="font-bold text-blue-800 mb-4 flex items-center gap-2"><PlusCircle class="w-4 h-4" /> Ajouter un titre (SoundCloud)</h4>
          <div class="flex gap-4 mb-4">
            <input type="text" v-model="newTrack.title" placeholder="Titre du morceau" class="flex-1 px-4 py-3 bg-white rounded-xl border border-blue-100 text-foreground focus:ring-2 focus:ring-blue-400 transition-shadow outline-none font-medium shadow-sm" />
            <input type="text" v-model="newTrack.artist" placeholder="Artiste" class="flex-1 px-4 py-3 bg-white rounded-xl border border-blue-100 text-foreground focus:ring-2 focus:ring-blue-400 transition-shadow outline-none font-medium shadow-sm" />
          </div>
          <div class="flex gap-4">
            <input type="text" v-model="newTrack.url" placeholder="Lien SoundCloud complet" class="flex-2 w-full px-4 py-3 bg-white rounded-xl border border-blue-100 text-foreground focus:ring-2 focus:ring-blue-400 transition-shadow outline-none font-medium shadow-sm" />
            <Btn variant="primary" @click="addTrack" :disabled="!newTrack.url.trim()">Ajouter</Btn>
          </div>
        </div>

        <div v-if="selectedPlaylist.tracks.length === 0" class="text-center p-8 bg-muted/50 rounded-2xl border border-dashed border-muted-foreground/30 text-muted-foreground font-medium italic">
          Cette playlist est vide.
        </div>
        <div v-else>
          <div class="flex justify-end items-center mb-4 gap-3 bg-muted/30 p-3 rounded-xl border border-[rgba(0,0,0,0.03)]">
            <label class="text-muted-foreground font-bold text-sm flex items-center gap-2"><PlayCircle class="w-4 h-4" /> Durée d'écoute (Test) :</label>
            <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[rgba(0,0,0,0.08)] shadow-sm">
              <input type="number" v-model.number="testDuration" min="1" max="100" step="1" class="w-12 text-center border-none outline-none font-bold text-primary" />
              <span class="text-xs text-muted-foreground font-bold uppercase tracking-wider">sec</span>
            </div>
          </div>
          
          <div class="flex flex-col gap-3">
            <div v-for="(track, index) in selectedPlaylist.tracks" :key="index" class="flex items-center justify-between p-4 bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div class="flex flex-col min-w-0 pr-4">
                <h4 class="font-bold text-primary m-0 truncate">{{ track.title }} - {{ track.artist }}</h4>
                <p class="text-xs text-muted-foreground m-0 mt-1 truncate max-w-[400px]">{{ track.url }}</p>
              </div>
              <div class="flex gap-2 shrink-0">
                <Btn v-if="testingTrackUrl !== track.url" variant="ghost-yellow" size="sm" className="w-[100px]" @click="testTrack(track.url)">
                  <Play class="w-4 h-4 mr-2 shrink-0" /> Tester
                </Btn>
                <Btn v-else variant="dark" size="sm" className="w-[100px] bg-[#FFBA49] hover:bg-[#f0aa30] text-[#3F4739] border-none" @click="stopTest">
                  <Square class="w-4 h-4 mr-2 shrink-0 fill-current" /> Stop
                </Btn>
                <button class="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors" @click="removeTrack(index)" title="Supprimer la musique">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Undo Toast -->
    <transition enter-active-class="transition ease-out duration-300" enter-from-class="transform translate-y-full opacity-0" enter-to-class="transform translate-y-0 opacity-100" leave-active-class="transition ease-in duration-200" leave-from-class="transform translate-y-0 opacity-100" leave-to-class="transform translate-y-full opacity-0">
      <div v-if="deletedTrackInfo" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#3F4739] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-4 z-50">
        <span class="font-medium text-sm">Musique supprimée</span>
        <button @click="undoDelete" class="font-bold text-[#FFBA49] hover:text-[#ffb02e] hover:underline transition-all text-sm outline-none">Annuler</button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ChevronLeft, ListMusic, Plus, Edit3, Trash2, PlusCircle, PlayCircle, Play, Square } from '@lucide/vue';
import Btn from '../ui/Btn.vue';
import Badge from '../ui/Badge.vue';
import { musicManager } from '../../services/music/MusicManager';
import { useDialog } from '../../composables/useDialog';

const { showAlert, showConfirm } = useDialog();

const emit = defineEmits<{
  (e: 'back'): void;
}>();

interface Track {
  id?: string;
  source?: string;
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

const deletedTrackInfo = ref<{ track: Track, index: number, playlistId: string } | null>(null);
let deleteToastTimeout: number | null = null;

const newTrack = ref<Track>({ title: '', artist: '', url: '' });

const testingTrackUrl = ref<string | null>(null);
const testingTrackId = ref<string | null>(null);
const testingTrackSource = ref<string>('youtube');
const testDuration = ref<number>(30);
const testTimeout = ref<number | null>(null);

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
    let dur = Math.floor(testDuration.value);
    if (isNaN(dur) || dur < 1) dur = 1;
    if (dur > 100) dur = 100;
    testDuration.value = dur;

    try {
      if (testingTrackUrl.value) {
        await stopTest();
      }
      testingTrackUrl.value = url;
      testingTrackId.value = id;
      testingTrackSource.value = source;
      
      await musicManager.play({
        id: id,
        title: "Test",
        artist: "Test",
        duration: dur * 1000,
        source: source as 'soundcloud'
      });
      
      testTimeout.value = window.setTimeout(() => {
        if (testingTrackUrl.value === url) {
          stopTest();
        }
      }, dur * 1000);
    } catch(err) {
      console.error(err);
    }
  } else {
    await showAlert({ title: "Lien invalide", message: "Le lien fourni n'est pas un lien SoundCloud ou YouTube valide." });
  }
};

const stopTest = async () => {
  testingTrackUrl.value = null;
  testingTrackId.value = null;
  if (testTimeout.value !== null) {
    window.clearTimeout(testTimeout.value);
    testTimeout.value = null;
  }
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
  if (await showConfirm({ title: "Supprimer la playlist ?", message: "Voulez-vous vraiment supprimer cette playlist ? Cette action est irréversible.", confirmText: "Supprimer", confirmVariant: "danger" })) {
    playlists.value = playlists.value.filter(p => p.id !== id);
    await saveToConfig();
  }
};

const clearToast = () => {
  deletedTrackInfo.value = null;
  if (deleteToastTimeout) {
    clearTimeout(deleteToastTimeout);
    deleteToastTimeout = null;
  }
};

const handleBack = () => {
  clearToast();
  emit('back');
};

const closeEdition = () => {
  selectedPlaylist.value = null;
  clearToast();
};

const editPlaylist = (pl: Playlist) => {
  clearToast();
  selectedPlaylist.value = pl;
};

const addTrack = async () => {
  if (!selectedPlaylist.value) return;
  if (!newTrack.value.url.trim()) return;
  
  const url = newTrack.value.url.trim();
  const source = getUrlSource(url);
  let id = null;
  if (source === 'youtube') id = extractYoutubeId(url);
  if (source === 'soundcloud') id = extractSoundCloudId(url);
  
  if (!id) {
    await showAlert({ title: "URL invalide", message: "Impossible de reconnaître ce lien audio." });
    return;
  }
  
  selectedPlaylist.value.tracks.push({
    id: id,
    title: newTrack.value.title.trim() || 'Inconnu',
    artist: newTrack.value.artist.trim() || 'Inconnu',
    source: source as any,
    url: url
  });
  
  newTrack.value = { title: '', artist: '', url: '', id: '', source: 'soundcloud' };
  await saveToConfig();
};

const removeTrack = async (index: number) => {
  if (!selectedPlaylist.value) return;
  const track = selectedPlaylist.value.tracks[index];
  
  selectedPlaylist.value.tracks.splice(index, 1);
  await saveToConfig();

  deletedTrackInfo.value = { track, index, playlistId: selectedPlaylist.value.id };
  
  if (deleteToastTimeout) clearTimeout(deleteToastTimeout);
  deleteToastTimeout = window.setTimeout(() => {
    deletedTrackInfo.value = null;
  }, 3000);
};

const undoDelete = async () => {
  if (!deletedTrackInfo.value) return;
  
  const { track, index, playlistId } = deletedTrackInfo.value;
  
  const pl = playlists.value.find(p => p.id === playlistId);
  if (pl) {
    pl.tracks.splice(index, 0, track);
    await saveToConfig();
  }
  
  deletedTrackInfo.value = null;
  if (deleteToastTimeout) clearTimeout(deleteToastTimeout);
};
</script>


