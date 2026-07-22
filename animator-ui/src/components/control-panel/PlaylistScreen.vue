<template>
  <div class="flex flex-col items-center justify-start min-h-full w-full relative py-12 px-6">
    <button class="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-primary font-bold text-sm transition-colors z-10" @click="handleBack">
      <ChevronLeft class="w-4 h-4" /> {{ $t('playlists.quit_edition') }}
    </button>
    
    <div class="bg-white p-10 rounded-3xl border border-[rgba(0,0,0,0.08)] shadow-xl w-full max-w-4xl">
      <h2 class="text-3xl font-black text-primary text-center mb-2 flex items-center justify-center gap-3">
        <ListMusic class="w-8 h-8 text-[#FFBA49]" /> {{ $t('playlists.title') }}
      </h2>
      <p class="text-muted-foreground text-center mb-8">{{ $t('playlists.subtitle') }}</p>
      
      <div v-if="!selectedPlaylist" class="flex flex-col">
        <div class="flex gap-4 mb-8">
          <input type="text" v-model="newPlaylistName" :placeholder="$t('playlists.new_placeholder')" class="flex-1 px-4 py-3 bg-muted rounded-xl border-none text-foreground focus:ring-2 focus:ring-[#FFBA49] transition-shadow outline-none font-medium" />
          <select v-model="newPlaylistType" class="px-4 py-3 bg-muted rounded-xl border-none text-foreground focus:ring-2 focus:ring-[#FFBA49] outline-none font-medium font-bold">
            <option value="soundcloud">{{ $t('playlists.type_soundcloud') }}</option>
            <option value="local">{{ $t('playlists.type_local') }}</option>
          </select>
          <Btn variant="primary" @click="createPlaylist" :disabled="!newPlaylistName.trim()">
            <Plus class="w-4 h-4 mr-2" /> {{ $t('playlists.create') }}
          </Btn>
        </div>

        <div v-if="playlists.length === 0" class="text-center p-8 bg-muted/50 rounded-2xl border border-dashed border-muted-foreground/30 text-muted-foreground font-medium italic">
          {{ $t('playlists.empty') }}
        </div>
        <div v-else class="flex flex-col gap-3">
          <div v-for="pl in playlists" :key="pl.id" class="flex items-center justify-between p-4 bg-muted/50 border border-[rgba(0,0,0,0.05)] rounded-2xl hover:bg-muted transition-colors">
            <div>
              <h4 class="font-bold text-primary text-lg m-0 flex items-center gap-2">
                <span v-if="pl.type === 'local'" title="Playlist Locale">📁</span>
                <span v-else title="Playlist SoundCloud">☁️</span>
                {{ pl.name }}
              </h4>
              <p class="text-muted-foreground text-sm m-0">{{ pl.tracks.length }} {{ $t('playlists.tracks') }}</p>
            </div>
            <div class="flex gap-2">
              <Btn variant="ghost-yellow" size="sm" @click="editPlaylist(pl)">
                <Edit3 class="w-4 h-4 mr-2" /> {{ $t('playlists.edit') }}
              </Btn>
              <button class="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors" @click="deletePlaylist(pl.id)" :title="$t('playlists.delete')">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col">
        <div class="flex justify-between items-center mb-6 pb-4 border-b border-[rgba(0,0,0,0.05)]">
          <Btn variant="soft" size="sm" @click="closeEdition">
            <ChevronLeft class="w-4 h-4 mr-1" /> {{ $t('playlists.back') }}
          </Btn>
          <div class="flex items-center gap-3">
            <div v-if="isEditingPlaylistName" class="flex items-center gap-2">
              <span class="text-[#FFBA49] font-bold text-xl">{{ $t('playlists.editing') }}</span>
              <input type="text" v-model="editingPlaylistName" @keydown.enter="savePlaylistName" @keydown.esc="isEditingPlaylistName = false" class="px-3 py-1 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#FFBA49] text-xl font-bold text-primary shadow-sm min-w-[250px]" />
              <Btn size="sm" variant="primary" @click="savePlaylistName()">OK</Btn>
              <Btn size="sm" variant="soft" @click="isEditingPlaylistName = false">Annuler</Btn>
            </div>
            <h3 v-else class="text-xl font-bold text-primary m-0 flex items-center gap-2 group cursor-pointer" @click="startEditPlaylistName">
              <span class="text-[#FFBA49]">{{ $t('playlists.editing') }}</span> 
              <span>{{ selectedPlaylist.name }}</span>
              <Edit3 class="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              <Badge color="gray" class="ml-2">{{ selectedPlaylist.tracks.length }} {{ $t('playlists.tracks') }}</Badge>
            </h3>
          </div>
        </div>

        <!-- Add Track Form Unified -->
        <div :class="selectedPlaylist.type === 'local' ? 'bg-amber-50/50 border-amber-100' : 'bg-blue-50/50 border-blue-100'" class="border p-5 rounded-2xl mb-8">
          <div class="flex justify-between items-center mb-4">
            <h4 v-if="selectedPlaylist.type === 'local'" class="font-bold text-amber-800 flex items-center gap-2 m-0"><FolderOpen class="w-4 h-4" /> {{ $t('playlists.add_local') }}</h4>
            <h4 v-else class="font-bold text-blue-800 flex items-center gap-2 m-0"><PlusCircle class="w-4 h-4" /> {{ $t('playlists.add_sc') }}</h4>
            
            <Btn v-if="selectedPlaylist.type === 'local'" size="sm" variant="secondary" @click="addLocalFolder">
              <FolderPlus class="w-4 h-4 mr-1" /> Importer un dossier
            </Btn>
          </div>
          
          <div v-if="!newTrack.title" class="relative mb-4 z-10">
            <input 
              type="text" 
              v-model="searchQuery" 
              @input="handleSearch"
              @keydown.enter="applyCustomSearch"
              @keydown.esc="suggestions = []"
              @blur="handleSearchBlur"
              placeholder="Rechercher sur iTunes (ou tapez Titre - Artiste et Entrée)" 
              class="w-full px-4 py-3 bg-white rounded-xl border text-foreground focus:ring-2 transition-shadow outline-none font-medium shadow-sm"
              :class="selectedPlaylist.type === 'local' ? 'border-amber-100 focus:ring-amber-400' : 'border-blue-100 focus:ring-blue-400'"
            />
            <div v-if="isSearching" class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" :class="selectedPlaylist.type === 'local' ? 'border-amber-200' : 'border-blue-200'"></div>
            
            <ul v-if="suggestions.length > 0" class="absolute top-full left-0 right-0 mt-2 bg-white border border-[rgba(0,0,0,0.08)] rounded-xl shadow-2xl overflow-hidden max-h-[250px] overflow-y-auto z-50">
                <li 
                  v-for="(item, index) in suggestions" 
                  :key="index"
                  @click="selectSuggestion(item)"
                  class="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer border-b border-muted transition-colors last:border-b-0"
                  :title="item.title + ' - ' + item.artist"
                >
                  <img v-if="item.coverUrl" :src="item.coverUrl" alt="cover" class="w-10 h-10 rounded-md object-cover flex-shrink-0 bg-muted" />
                  <div class="flex flex-col min-w-0">
                    <span class="font-bold text-primary truncate text-sm">{{ item.title }}</span>
                    <span class="text-xs text-muted-foreground truncate">{{ item.artist }}</span>
                  </div>
                </li>
            </ul>
          </div>
          
          <div v-else class="flex flex-col gap-4">
            <div class="bg-white p-3 rounded-xl border flex items-center justify-between shadow-sm" :class="selectedPlaylist.type === 'local' ? 'border-amber-100' : 'border-blue-100'">
                <div>
                   <strong class="block" :class="selectedPlaylist.type === 'local' ? 'text-amber-900' : 'text-blue-900'">{{ newTrack.title }}</strong>
                   <span v-if="newTrack.artist" class="text-sm" :class="selectedPlaylist.type === 'local' ? 'text-amber-700' : 'text-blue-700'">{{ newTrack.artist }}</span>
                </div>
                <button @click="clearSelectedTrack" class="text-muted-foreground hover:text-red-500 font-bold px-2 py-1 bg-red-50 rounded-lg text-xs">Annuler</button>
            </div>
            
            <div class="flex gap-4" v-if="!selectedPlaylist.type || selectedPlaylist.type === 'soundcloud'">
              <input type="text" v-model="newTrack.url" @input="duplicateWarning = null; forceAdd = false;" :placeholder="$t('playlists.sc_url')" class="flex-2 w-full px-4 py-3 bg-white rounded-xl border border-blue-100 text-foreground focus:ring-2 focus:ring-blue-400 transition-shadow outline-none font-medium shadow-sm" />
              <Btn variant="primary" @click="addTrack" :disabled="!newTrack.url.trim()">{{ $t('playlists.add') }}</Btn>
            </div>
            
            <div class="flex gap-4" v-else>
              <Btn variant="dark" @click="addLocalTrackWithMetadata">
                <FileAudio class="w-4 h-4 mr-2" /> 
                {{ pendingLocalPath ? 'Confirmer l\'ajout du fichier' : 'Associer un fichier MP3' }}
              </Btn>
            </div>
            
            <div v-if="duplicateWarning" class="mt-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              {{ duplicateWarning }}
            </div>
          </div>
        </div>

        <div v-if="selectedPlaylist.tracks.length === 0" class="text-center p-8 bg-muted/50 rounded-2xl border border-dashed border-muted-foreground/30 text-muted-foreground font-medium italic">
          {{ $t('playlists.playlist_empty') }}
        </div>
        <div v-else>
          <div class="flex justify-end items-center mb-4 gap-3 bg-muted/30 p-3 rounded-xl border border-[rgba(0,0,0,0.03)]">
            <label class="text-muted-foreground font-bold text-sm flex items-center gap-2"><PlayCircle class="w-4 h-4" /> {{ $t('playlists.test_duration') }}</label>
            <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[rgba(0,0,0,0.08)] shadow-sm">
              <input type="number" v-model.number="testDuration" min="1" max="100" step="1" class="w-12 text-center border-none outline-none font-bold text-primary" />
              <span class="text-xs text-muted-foreground font-bold uppercase tracking-wider">{{ $t('playlists.sec') }}</span>
            </div>
          </div>
          
          <div class="flex flex-col gap-3">
            <div v-for="(track, index) in selectedPlaylist.tracks" :key="index" class="flex items-center justify-between p-4 bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div class="flex flex-col min-w-0 pr-4 w-1/2">
                <div v-if="editingTrackIndex === index" class="flex flex-col gap-2 w-full bg-slate-50 p-3 rounded-xl border border-slate-200 relative">
                  <div class="relative z-50">
                    <input 
                      type="text" 
                      v-model="editSearchQuery" 
                      @input="handleEditSearch"
                      @keydown.enter="saveEditTrack"
                      @keydown.esc="editSuggestions = []"
                      @blur="handleEditBlur"
                      placeholder="Rechercher sur iTunes (ou tapez Titre - Artiste et Entrée)" 
                      class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 text-sm font-bold text-primary shadow-sm"
                    />
                    <div v-if="isEditSearching" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                    
                    <ul v-if="editSuggestions.length > 0" class="absolute bottom-full left-0 right-0 mb-1 bg-white border border-[rgba(0,0,0,0.08)] rounded-xl shadow-xl overflow-hidden max-h-[200px] overflow-y-auto z-50 flex flex-col-reverse">
                        <li 
                          v-for="(item, sIdx) in editSuggestions" 
                          :key="sIdx"
                          @click="selectEditSuggestion(item)"
                          class="flex items-center gap-3 p-2 hover:bg-muted cursor-pointer border-b border-muted transition-colors last:border-b-0"
                          :title="item.title + ' - ' + item.artist"
                        >
                          <img v-if="item.coverUrl" :src="item.coverUrl" alt="cover" class="w-8 h-8 rounded-md object-cover flex-shrink-0 bg-muted" />
                          <div class="flex flex-col min-w-0">
                            <span class="font-bold text-primary truncate text-sm">{{ item.title }}</span>
                            <span class="text-xs text-muted-foreground truncate">{{ item.artist }}</span>
                          </div>
                        </li>
                    </ul>
                  </div>
                  
                  <div class="flex gap-2 mt-1">
                    <Btn size="sm" variant="primary" @click="saveEditTrack()">{{ $t('playlists.ok') }}</Btn>
                    <Btn size="sm" variant="soft" @click="cancelEditTrack()">{{ $t('playlists.cancel') }}</Btn>
                  </div>
                </div>
                <div v-else class="flex flex-col gap-1 w-full group">
                  <h4 class="font-bold text-primary m-0 flex items-center" :title="track.title + ' - ' + track.artist">
                    <span class="truncate">{{ track.title }} - {{ track.artist }}</span>
                    <BadgeCheck v-if="track.isCertified" class="w-4 h-4 text-blue-500 fill-blue-50 shrink-0 ml-1" title="Validé par iTunes" />
                  </h4>
                  <p class="text-xs text-muted-foreground m-0 truncate w-full" :title="track.url" dir="rtl" style="text-align: left;">{{ track.url }}</p>
                  <button @click="startEditTrack(index, track)" class="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 w-max mt-1 outline-none">
                    <Edit3 class="w-3 h-3"/> {{ $t('playlists.edit_info') }}
                  </button>
                </div>
              </div>
              <div class="flex gap-2 shrink-0">
                <Btn v-if="testingTrackUrl !== track.url" variant="ghost-yellow" size="sm" className="w-[100px]" @click="testTrack(track.url)">
                  <Play class="w-4 h-4 mr-2 shrink-0" /> {{ $t('playlists.test') }}
                </Btn>
                <Btn v-else variant="dark" size="sm" className="w-[100px] bg-[#FFBA49] hover:bg-[#f0aa30] text-[#3F4739] border-none" @click="stopTest">
                  <Square class="w-4 h-4 mr-2 shrink-0 fill-current" /> {{ $t('playlists.testing') }}
                </Btn>
                <button class="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors" @click="removeTrack(index)" :title="$t('playlists.remove')">
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
import { ChevronLeft, ListMusic, Plus, Edit3, Trash2, PlusCircle, PlayCircle, Play, Square, FolderOpen, FileAudio, FolderPlus, BadgeCheck } from '@lucide/vue';
import jsmediatags from 'jsmediatags';
import Btn from '../ui/Btn.vue';
import Badge from '../ui/Badge.vue';
import { musicManager } from '../../services/music/MusicManager';
import { itunesService } from '../../services/itunesService';
import { useDialog } from '../../composables/useDialog';
import { useI18n } from 'vue-i18n';

const { showAlert, showConfirm } = useDialog();
const { t } = useI18n();

const emit = defineEmits<{
  (e: 'back'): void;
}>();

interface Track {
  id?: string;
  source?: string;
  title: string;
  artist: string;
  url: string;
  isCertified?: boolean;
}

interface Playlist {
  id: string;
  name: string;
  type?: 'soundcloud' | 'local';
  tracks: Track[];
}

const playlists = ref<Playlist[]>([]);
const newPlaylistName = ref('');
const newPlaylistType = ref<'soundcloud' | 'local'>('soundcloud');
const selectedPlaylist = ref<Playlist | null>(null);

const isEditingPlaylistName = ref(false);
const editingPlaylistName = ref('');

const startEditPlaylistName = () => {
  if (!selectedPlaylist.value) return;
  editingPlaylistName.value = selectedPlaylist.value.name;
  isEditingPlaylistName.value = true;
};

const savePlaylistName = async () => {
  if (!selectedPlaylist.value) return;
  const newName = editingPlaylistName.value.trim();
  if (newName) {
    selectedPlaylist.value.name = newName;
    await saveToConfig();
  }
  isEditingPlaylistName.value = false;
};

const deletedTrackInfo = ref<{ track: Track, index: number, playlistId: string } | null>(null);
let deleteToastTimeout: number | null = null;

const newTrack = ref<Track>({ title: '', artist: '', url: '', isCertified: false });

const duplicateWarning = ref<string | null>(null);
const forceAdd = ref(false);
const pendingLocalPath = ref<string | null>(null);

const checkForDuplicate = (track: Track, urlToCheck?: string): string | null => {
  if (!selectedPlaylist.value) return null;
  const tracks = selectedPlaylist.value.tracks;
  
  if (urlToCheck && tracks.some(t => t.url === urlToCheck)) {
    return "Cette URL ou ce fichier est déjà dans la playlist. Cliquez à nouveau pour forcer l'ajout.";
  }
  
  const title = track.title?.toLowerCase().trim();
  const artist = track.artist?.toLowerCase().trim();
  if (title && tracks.some(t => t.title.toLowerCase().trim() === title && t.artist.toLowerCase().trim() === artist)) {
    return "Une musique avec ce même titre et artiste est déjà dans la playlist. Cliquez à nouveau pour forcer l'ajout.";
  }
  
  return null;
};

const editingTrackIndex = ref<number | null>(null);
const editingTrackData = ref<{title: string, artist: string, isCertified?: boolean}>({ title: '', artist: '', isCertified: false });

const editSearchQuery = ref('');
const editSuggestions = ref<{title: string, artist: string, coverUrl: string}[]>([]);
const isEditSearching = ref(false);
const editSearchTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

const handleEditSearch = () => {
  clearTimeout(editSearchTimeout.value as any);
  editSuggestions.value = [];
  
  if (editSearchQuery.value.trim().length < 2) {
    isEditSearching.value = false;
    return;
  }

  isEditSearching.value = true;
  editSearchTimeout.value = setTimeout(async () => {
    editSuggestions.value = await itunesService.search(editSearchQuery.value);
    isEditSearching.value = false;
  }, 500);
};

const handleEditBlur = () => {
  setTimeout(() => {
    editSuggestions.value = [];
  }, 200);
};

const selectEditSuggestion = async (item: {title: string, artist: string}) => {
  editingTrackData.value.title = item.title;
  editingTrackData.value.artist = item.artist;
  editingTrackData.value.isCertified = true;
  editSearchQuery.value = '';
  editSuggestions.value = [];
  await saveEditTrack();
};

const applyCustomEditSearch = () => {
  if (!editSearchQuery.value.trim()) return;
  
  const customText = editSearchQuery.value.trim();
  let title = customText;
  let artist = '';
  
  if (customText.includes('-')) {
    const parts = customText.split('-');
    title = parts[0].trim();
    artist = parts.slice(1).join('-').trim();
  }
  
  editingTrackData.value.title = title;
  editingTrackData.value.artist = artist;
  editingTrackData.value.isCertified = false;
  
  editSearchQuery.value = '';
  editSuggestions.value = [];
};

const cancelEditTrack = () => {
  editingTrackIndex.value = null;
  editSearchQuery.value = '';
  editSuggestions.value = [];
};

const searchQuery = ref('');
const suggestions = ref<{title: string, artist: string, coverUrl: string}[]>([]);
const isSearching = ref(false);
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

const handleSearch = () => {
  duplicateWarning.value = null;
  forceAdd.value = false;
  pendingLocalPath.value = null;
  
  clearTimeout(searchTimeout.value as any);
  suggestions.value = [];
  
  if (searchQuery.value.trim().length < 2) {
    isSearching.value = false;
    return;
  }

  isSearching.value = true;
  searchTimeout.value = setTimeout(async () => {
    suggestions.value = await itunesService.search(searchQuery.value);
    isSearching.value = false;
  }, 500);
};

const handleSearchBlur = () => {
  setTimeout(() => {
    suggestions.value = [];
  }, 200);
};

const selectSuggestion = (item: {title: string, artist: string}) => {
  newTrack.value.title = item.title;
  newTrack.value.artist = item.artist;
  newTrack.value.isCertified = true;
  searchQuery.value = '';
  suggestions.value = [];
};

const applyCustomSearch = () => {
  if (!searchQuery.value.trim()) return;
  
  const customText = searchQuery.value.trim();
  let title = customText;
  let artist = '';
  
  if (customText.includes('-')) {
    const parts = customText.split('-');
    title = parts[0].trim();
    artist = parts.slice(1).join('-').trim();
  }
  
  newTrack.value.title = title;
  newTrack.value.artist = artist;
  newTrack.value.isCertified = false;
  
  searchQuery.value = '';
  suggestions.value = [];
};

const clearSelectedTrack = () => {
  newTrack.value.title = '';
  newTrack.value.artist = '';
  newTrack.value.url = '';
  newTrack.value.isCertified = false;
  duplicateWarning.value = null;
  forceAdd.value = false;
  pendingLocalPath.value = null;
};
const startEditTrack = (index: number, track: Track) => {
  editingTrackIndex.value = index;
  editingTrackData.value = { title: track.title, artist: track.artist, isCertified: track.isCertified };
  editSearchQuery.value = `${track.title} - ${track.artist}`;
  editSuggestions.value = [];
};

const saveEditTrack = async () => {
  if (editSearchQuery.value.trim()) {
     applyCustomEditSearch();
  }
  
  if (editingTrackIndex.value !== null && selectedPlaylist.value) {
    const track = selectedPlaylist.value.tracks[editingTrackIndex.value];
    track.title = editingTrackData.value.title;
    track.artist = editingTrackData.value.artist;
    track.isCertified = editingTrackData.value.isCertified;
    editingTrackIndex.value = null;
    await saveToConfig();
  }
};

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
  const source = selectedPlaylist.value?.type === 'local' ? 'local' : getUrlSource(url);
  let id = null;
  if (source === 'youtube') id = extractYoutubeId(url);
  else if (source === 'soundcloud') id = extractSoundCloudId(url);
  else if (source === 'local') id = url;
  
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
        source: source as any
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
    await showAlert({ title: t('dialogs.invalid_link_sc.title'), message: t('dialogs.invalid_link_sc.message') });
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
    type: newPlaylistType.value,
    tracks: []
  };
  playlists.value.push(newPl);
  newPlaylistName.value = '';
  await saveToConfig();
};

const deletePlaylist = async (id: string) => {
  if (await showConfirm({ title: t('dialogs.delete_playlist.title'), message: t('dialogs.delete_playlist.message'), confirmText: t('dialogs.delete_playlist.confirm'), confirmVariant: "danger" })) {
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
  if (!newTrack.value.url.trim() || !selectedPlaylist.value) return;
  
  const url = newTrack.value.url.trim();
  
  if (!forceAdd.value) {
    const warning = checkForDuplicate(newTrack.value, url);
    if (warning) {
      duplicateWarning.value = warning;
      forceAdd.value = true;
      return;
    }
  }
  
  const source = getUrlSource(url);
  let id = null;
  if (source === 'youtube') id = extractYoutubeId(url);
  if (source === 'soundcloud') id = extractSoundCloudId(url);
  
  if (!id) {
    await showAlert({ title: t('dialogs.invalid_url.title'), message: t('dialogs.invalid_url.message') });
    return;
  }
  
  selectedPlaylist.value.tracks.push({
    id: id,
    title: newTrack.value.title.trim() || 'Titre Inconnu',
    artist: newTrack.value.artist.trim() || 'Artiste Inconnu',
    source: source as any,
    url: url,
    isCertified: newTrack.value.isCertified
  });
  clearSelectedTrack();
  await saveToConfig();
};

const addLocalTrackWithMetadata = async () => {
  if (!selectedPlaylist.value) return;
  
  if (pendingLocalPath.value) {
    selectedPlaylist.value.tracks.push({
      id: pendingLocalPath.value,
      title: newTrack.value.title.trim() || 'Titre Inconnu',
      artist: newTrack.value.artist.trim() || 'Artiste Inconnu',
      url: pendingLocalPath.value,
      source: 'local',
      isCertified: newTrack.value.isCertified
    });
    clearSelectedTrack();
    await saveToConfig();
    return;
  }
  
  if (!forceAdd.value) {
    const warning = checkForDuplicate(newTrack.value);
    if (warning) {
      duplicateWarning.value = warning;
      forceAdd.value = true;
      return;
    }
  }
  
  try {
    const res = await fetch('http://127.0.0.1:5000/api/dialog/file');
    const paths = await res.json();
    if (Array.isArray(paths) && paths.length > 0) {
      const path = paths[0];
      
      const pathWarning = checkForDuplicate(newTrack.value, path);
      if (pathWarning && pathWarning.includes('URL ou ce fichier')) {
         duplicateWarning.value = pathWarning;
         pendingLocalPath.value = path;
         forceAdd.value = true;
         return;
      }
      
      selectedPlaylist.value.tracks.push({
        id: path,
        title: newTrack.value.title.trim() || 'Titre Inconnu',
        artist: newTrack.value.artist.trim() || 'Artiste Inconnu',
        url: path,
        source: 'local',
        isCertified: newTrack.value.isCertified
      });
      
      clearSelectedTrack();
      await saveToConfig();
    }
  } catch (_e) {
    console.error("Error opening file dialog", _e);
  }
};

const readTagsFromUrl = (url: string): Promise<{title: string, artist: string} | null> => {
  return new Promise((resolve) => {
    jsmediatags.read(url, {
      onSuccess: (tag: any) => {
        resolve({
          title: tag.tags.title,
          artist: tag.tags.artist
        });
      },
      onError: () => {
        resolve(null);
      }
    });
  });
};

const addLocalPaths = async (paths: string[]) => {
  if (!selectedPlaylist.value || paths.length === 0) return;
  
  let addedCount = 0;
  
  for (const path of paths) {
    if (selectedPlaylist.value.tracks.some(t => t.url === path)) continue;

    const filename = path.split(/[\/\\]/).pop() || '';
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    
    let title = nameWithoutExt;
    let artist = "Artiste Inconnu";
    
    try {
      const streamUrl = `http://127.0.0.1:5000/api/stream?path=${encodeURIComponent(path)}`;
      const tags = await readTagsFromUrl(streamUrl);
      if (tags) {
        if (tags.title) title = tags.title;
        if (tags.artist) artist = tags.artist;
      }
    } catch (_e) {
      console.warn("Could not read tags for", path);
    }
    
    const newTrackData = {
      id: path,
      title: title.trim() || 'Titre Inconnu',
      artist: artist.trim() || 'Artiste Inconnu',
      url: path,
      source: 'local' as const
    };
    
    if (!checkForDuplicate(newTrackData, path)) {
      selectedPlaylist.value.tracks.push(newTrackData);
      addedCount++;
    }
  }
  
  if (addedCount > 0) {
    await saveToConfig();
  }
  
  await showAlert({ 
    title: 'Import terminé', 
    message: `${addedCount} musique(s) importée(s) avec succès.` 
  });
};

const addLocalFolder = async () => {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/dialog/folder');
    const paths = await res.json();
    if (Array.isArray(paths) && paths.length > 0) {
      await addLocalPaths(paths);
    }
  } catch (_e) {
    console.error("Error opening folder dialog", _e);
  }
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


