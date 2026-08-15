<template>
  <div class="flex flex-col">
    <div class="flex justify-between items-center mb-6 pb-4 border-b border-[rgba(0,0,0,0.05)]">
      <BackButton @click="$emit('back')" id="btn-playlist-back">
        {{ $t('playlists.back') }}
      </BackButton>
      <div class="flex items-center gap-3">
        <div v-if="isEditingName" class="flex items-center gap-2">
          <span class="text-[#FFBA49] font-bold text-xl">{{ $t('playlists.editing') }}</span>
          <TextInput 
            ref="nameInput"
            v-model="editingName" 
            @keydown.enter="saveName" 
            @keydown.esc="isEditingName = false" 
            inputClass="bg-white border border-slate-200 text-xl shadow-sm px-3 py-1 rounded-lg font-bold text-primary"
            focusClass="focus:border-[#FFBA49] focus:ring-1 focus:ring-[#FFBA49]"
            wrapperClass="w-fit min-w-[250px]"
            clearable
            :maxLength="50"
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
      :autofocusSearch="true"
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
import { ref, nextTick } from 'vue';
import { Edit3 } from '@lucide/vue';
import Btn from '../../ui/Btn.vue';
import BackButton from '../../ui/BackButton.vue';
import Badge from '../../ui/Badge.vue';
import TextInput from '../../ui/TextInput.vue';
import TrackAdder from './TrackAdder.vue';
import TrackList from './TrackList.vue';
import { Playlist, Track } from '../../../core/domain/setup/types/playlist';

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
const nameInput = ref<any>(null);

const startEditName = async () => {
  editingName.value = props.playlist.name;
  isEditingName.value = true;
  await nextTick();
  nameInput.value?.focus();
};

const saveName = () => {
  const newName = editingName.value.trim().substring(0, 50);
  if (newName) {
    emit('update-playlist-name', newName);
  }
  isEditingName.value = false;
};
</script>
