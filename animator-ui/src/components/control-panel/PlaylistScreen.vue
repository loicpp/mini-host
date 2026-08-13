<template>
  <div class="flex flex-col items-center justify-start min-h-full w-full relative py-12 px-6">
    <BackButton @click="handleBack" class="absolute top-6 left-6">
      {{ $t('playlists.quit_edition') }}
    </BackButton>
    
    <div class="bg-white p-10 rounded-3xl border border-[rgba(0,0,0,0.08)] shadow-xl w-full max-w-4xl">
      <h2 class="text-3xl font-black text-primary text-center mb-2 flex items-center justify-center gap-3">
        <ListMusic class="w-8 h-8 text-[#FFBA49]" /> {{ $t('playlists.title') }}
      </h2>
      <p class="text-muted-foreground text-center mb-8">{{ $t('playlists.subtitle') }}</p>
      
      <PlaylistList 
        v-if="!selectedPlaylist"
        :playlists="playlists"
        @create="createPlaylist"
        @open-generator="showGeneratorModal = true"
        @edit="editPlaylist"
        @delete="deletePlaylist"
      />
      
      <PlaylistEditor
        v-else
        :playlist="selectedPlaylist"
        :newTrack="newTrack"
        @update:newTrack="newTrack = $event"
        :duplicateWarning="duplicateWarning"
        @reset-duplicate-warning="duplicateWarning = null; forceAdd = false"
        :testingTrackUrl="testingTrackUrl"
        :testDuration="testDuration"
        @update:testDuration="testDuration = $event"
        @back="closeEdition"
        @update-playlist-name="handleUpdatePlaylistName"
        @clear-selected-track="clearSelectedTrack"
        @add-track="addTrack"
        @add-local-file="addLocalTrackFileFirst"
        @add-local-folder="addLocalFolder"
        @confirm-local="confirmLocalTrackAdded"
        @test="testTrack"
        @stop-test="stopTest"
        @remove="removeTrack"
        @update-track="handleUpdateTrack"
      />
    </div>

    <!-- Undo Toast -->
    <transition enter-active-class="transition ease-out duration-300" enter-from-class="transform translate-y-full opacity-0" enter-to-class="transform translate-y-0 opacity-100" leave-active-class="transition ease-in duration-200" leave-from-class="transform translate-y-0 opacity-100" leave-to-class="transform translate-y-full opacity-0">
      <div v-if="deletedTrackInfo" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#3F4739] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-4 z-50">
        <span class="font-medium text-sm">{{ $t('playlists.track_deleted') }}</span>
        <button @click="undoDelete(playlists)" class="font-bold text-[#FFBA49] hover:text-[#ffb02e] hover:underline transition-all text-sm outline-none">{{ $t('playlists.cancel') }}</button>
      </div>
    </transition>

    <PlaylistGeneratorModal 
      :show="showGeneratorModal"
      :isGenerating="isGenerating"
      @close="showGeneratorModal = false"
      @generate="handleGenerate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ListMusic } from '@lucide/vue';

import PlaylistList from '../playlist-config/PlaylistList.vue';
import PlaylistEditor from '../playlist-config/PlaylistEditor.vue';
import PlaylistGeneratorModal from '../playlist-config/PlaylistGeneratorModal.vue';
import BackButton from '../ui/BackButton.vue';

import { usePlaylists } from '../../composables/usePlaylists';
import { usePlaylistEditor } from '../../composables/usePlaylistEditor';
import { Playlist, Track } from '../../types/playlist';

const emit = defineEmits<{
  (e: 'back'): void;
}>();

const showGeneratorModal = ref(false);

const { 
  playlists, 
  isGenerating, 
  loadPlaylists, 
  saveToConfig, 
  createPlaylist, 
  deletePlaylist, 
  generatePlaylist 
} = usePlaylists();

const {
  selectedPlaylist,
  newTrack,
  duplicateWarning,
  forceAdd,
  deletedTrackInfo,
  testingTrackUrl,
  testDuration,
  addTrack,
  confirmLocalTrackAdded,
  addLocalTrackFileFirst,
  addLocalFolder,
  removeTrack,
  undoDelete,
  testTrack,
  stopTest,
  clearSelectedTrack,
  clearToast
} = usePlaylistEditor(saveToConfig);

onMounted(() => {
  loadPlaylists();
});

const editPlaylist = (pl: Playlist) => {
  clearToast();
  clearSelectedTrack();
  selectedPlaylist.value = pl;
};

const closeEdition = () => {
  selectedPlaylist.value = null;
  clearSelectedTrack();
  clearToast();
};

const handleBack = () => {
  closeEdition();
  emit('back');
};

const handleUpdatePlaylistName = async (newName: string) => {
  if (selectedPlaylist.value) {
    selectedPlaylist.value.name = newName;
    await saveToConfig();
  }
};

const handleUpdateTrack = async (index: number, track: Track) => {
  if (selectedPlaylist.value) {
    selectedPlaylist.value.tracks[index] = track;
    await saveToConfig();
  }
};

const handleGenerate = async (theme: string, limit: number) => {
  const success = await generatePlaylist(theme, limit);
  if (success) {
    showGeneratorModal.value = false;
  }
};
</script>
