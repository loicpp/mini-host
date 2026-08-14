<template>
  <div class="flex flex-col">
    <div class="flex gap-4 mb-8">
      <TextInput 
        id="input-new-playlist"
        v-model="newPlaylistName" 
        :placeholder="$t('playlists.new_placeholder')" 
        wrapperClass="flex-1" 
        inputClass="bg-muted px-4 py-3 rounded-xl border-none font-medium text-foreground"
        focusClass="focus:ring-2 focus:ring-[#FFBA49]"
        clearable 
        :maxLength="50" 
      />
      <div id="div-playlist-type" class="w-48 shrink-0">
        <CustomSelect 
          v-model="newPlaylistType" 
          :options="[
            { value: 'soundcloud', label: $t('playlists.type_soundcloud') },
            { value: 'local', label: $t('playlists.type_local') }
          ]"
        />
      </div>
      <Btn id="btn-create-playlist" variant="primary" @click="handleCreate" :disabled="!newPlaylistName.trim()">
        <Plus class="w-4 h-4 mr-2" /> {{ $t('playlists.create') }}
      </Btn>
      <Btn id="btn-generate-playlist" variant="ghost-yellow" @click="$emit('open-generator')">
        <Wand2 class="w-4 h-4 mr-2" /> {{ $t('playlists.generate') }}
      </Btn>
    </div>

    <div v-if="playlists.length === 0" class="text-center p-8 bg-muted/50 rounded-2xl border border-dashed border-muted-foreground/30 text-muted-foreground font-medium italic">
      {{ $t('playlists.empty') }}
    </div>
    
    <div id="div-playlists" v-else class="flex flex-col gap-3">
      <div v-for="pl in playlists" :key="pl.id" class="flex items-center justify-between p-4 bg-muted/50 border border-[rgba(0,0,0,0.05)] rounded-2xl hover:bg-muted transition-colors">
        <div>
          <h4 class="font-bold text-primary text-lg m-0 flex items-center gap-2">
            <span v-if="pl.type === 'local'" title="Playlist Locale">📁</span>
            <span v-else-if="pl.type === 'soundcloud'" title="Playlist SoundCloud">☁️</span>
            <span v-else title="Type de playlist invalide" class="text-red-500 font-bold">{{ $t('playlists.invalid_type') }}</span>
            {{ pl.name }}
          </h4>
          <p class="text-muted-foreground text-sm m-0">{{ pl.tracks.length }} {{ $t('playlists.tracks') }}</p>
        </div>
        <div class="flex gap-2">
          <Btn class="btn-edit-playlists" variant="ghost-yellow" size="sm" @click="$emit('edit', pl)">
            <Edit3 class="w-4 h-4 mr-2" /> {{ $t('playlists.edit') }}
          </Btn>
          <button class="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors" @click="$emit('delete', pl.id)" :title="$t('playlists.delete')">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Plus, Wand2, Edit3, Trash2 } from '@lucide/vue';
import Btn from '../ui/Btn.vue';
import CustomSelect from '../ui/CustomSelect.vue';
import TextInput from '../ui/TextInput.vue';
import { Playlist } from '../../types/playlist';

defineProps<{
  playlists: Playlist[];
}>();

const emit = defineEmits<{
  (e: 'create', name: string, type: 'soundcloud' | 'local'): void;
  (e: 'open-generator'): void;
  (e: 'edit', playlist: Playlist): void;
  (e: 'delete', id: string): void;
}>();

const newPlaylistName = ref('');
const newPlaylistType = ref<'soundcloud' | 'local'>('soundcloud');

const handleCreate = () => {
  emit('create', newPlaylistName.value, newPlaylistType.value);
  newPlaylistName.value = '';
};
</script>
