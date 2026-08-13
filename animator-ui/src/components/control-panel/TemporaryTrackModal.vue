<template>
  <Modal v-if="isOpen" @close="$emit('close')" maxW="max-w-xl" overflowClass="overflow-visible">
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-primary flex items-center gap-2">
          <Search class="w-5 h-5 text-[#FFBA49]" /> 
          {{ $t('local_tracks.add_temp_track') }}
        </h2>
        <button @click="$emit('close')" class="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"><X class="w-5 h-5" /></button>
      </div>
      
      <TrackAdder 
        :playlistType="currentSource === 'soundcloud' ? 'soundcloud' : 'local'"
        :newTrack="tempNewTrack"
        :initialSearchQuery="initialQuery"
        :autofocusSearch="true"
        @update:newTrack="tempNewTrack = $event"
        :duplicateWarning="tempDuplicateWarning"
        @reset-duplicate-warning="tempDuplicateWarning = null"
        @clear="clearTempTrack"
        @add-sc-track="addTempScTrack"
        @add-local-file="addTempLocalFile"
        @add-local-folder="addTempLocalFolder"
        @confirm-local="confirmTempLocalTrack"
      />
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { Search, X } from '@lucide/vue';
import Modal from '../ui/Modal.vue';
import TrackAdder from '../playlist-config/TrackAdder.vue';
import { useTemporaryTrackEditor } from '../../composables/useTemporaryTrackEditor';
import { currentSource } from '../../composables/state';
import type { Track } from '../../services/music/MusicProvider';

defineProps<{
  isOpen: boolean;
  initialQuery?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'track-added', track: Track): void;
}>();

const {
  tempNewTrack, tempDuplicateWarning, clearTempTrack, addTempScTrack,
  addTempLocalFile, addTempLocalFolder, confirmTempLocalTrack
} = useTemporaryTrackEditor((track) => {
  emit('close');
  emit('track-added', track);
});
</script>
