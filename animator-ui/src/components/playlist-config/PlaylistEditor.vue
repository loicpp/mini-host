<template>
  <div class="flex flex-col">
    <div class="flex justify-between items-center mb-6 pb-4 border-b border-[rgba(0,0,0,0.05)]">
      <Btn variant="soft" size="sm" @click="$emit('back')">
        <ChevronLeft class="w-4 h-4 mr-1" /> {{ $t('playlists.back') }}
      </Btn>
      <div class="flex items-center gap-3">
        <div v-if="isEditingName" class="flex items-center gap-2">
          <span class="text-[#FFBA49] font-bold text-xl">{{ $t('playlists.editing') }}</span>
          <input 
            type="text" 
            v-model="editingName" 
            @keydown.enter="saveName" 
            @keydown.esc="isEditingName = false" 
            class="px-3 py-1 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#FFBA49] text-xl font-bold text-primary shadow-sm min-w-[250px]" 
          />
          <Btn size="sm" variant="primary" @click="saveName">{{ $t('playlists.ok') }}</Btn>
          <Btn size="sm" variant="soft" @click="isEditingName = false">{{ $t('playlists.cancel') }}</Btn>
        </div>
        <h3 v-else class="text-xl font-bold text-primary m-0 flex items-center gap-2 group cursor-pointer" @click="startEditName">
          <span class="text-[#FFBA49]">{{ $t('playlists.editing') }}</span> 
          <span>{{ playlist.name }}</span>
          <Edit3 class="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          <Badge color="gray" class="ml-2">{{ playlist.tracks.length }} {{ $t('playlists.tracks') }}</Badge>
        </h3>
      </div>
    </div>

    <TrackAdder 
      :playlistType="playlist.type"
      :newTrack="newTrack"
      @update:newTrack="$emit('update:newTrack', $event)"
      :duplicateWarning="duplicateWarning"
      @reset-duplicate-warning="$emit('reset-duplicate-warning')"
      @clear="$emit('clear-selected-track')"
      @add-sc-track="$emit('add-track')"
      @add-local-file="$emit('add-local-file')"
      @add-local-folder="$emit('add-local-folder')"
      @confirm-local="$emit('confirm-local')"
    />

    <TrackList 
      :tracks="playlist.tracks"
      :testingTrackUrl="testingTrackUrl"
      :testDuration="testDuration"
      @update:testDuration="$emit('update:testDuration', $event)"
      @test="$emit('test', $event)"
      @stop-test="$emit('stop-test')"
      @remove="$emit('remove', $event)"
      @update-track="(index, track) => $emit('update-track', index, track)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ChevronLeft, Edit3 } from '@lucide/vue';
import Btn from '../ui/Btn.vue';
import Badge from '../ui/Badge.vue';
import TrackAdder from './TrackAdder.vue';
import TrackList from './TrackList.vue';
import { Playlist, Track } from '../../types/playlist';

const props = defineProps<{
  playlist: Playlist;
  newTrack: Track;
  duplicateWarning: string | null;
  testingTrackUrl: string | null;
  testDuration: number;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'update-playlist-name', name: string): void;
  (e: 'update:newTrack', track: Track): void;
  (e: 'reset-duplicate-warning'): void;
  (e: 'clear-selected-track'): void;
  (e: 'add-track'): void;
  (e: 'add-local-file'): void;
  (e: 'add-local-folder'): void;
  (e: 'confirm-local'): void;
  (e: 'update:testDuration', val: number): void;
  (e: 'test', url: string): void;
  (e: 'stop-test'): void;
  (e: 'remove', index: number): void;
  (e: 'update-track', index: number, track: Track): void;
}>();

const isEditingName = ref(false);
const editingName = ref('');

const startEditName = () => {
  editingName.value = props.playlist.name;
  isEditingName.value = true;
};

const saveName = () => {
  const newName = editingName.value.trim();
  if (newName) {
    emit('update-playlist-name', newName);
  }
  isEditingName.value = false;
};
</script>
