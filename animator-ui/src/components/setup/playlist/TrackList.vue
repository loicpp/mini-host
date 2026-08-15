<template>
  <div>
    <div v-if="tracks.length === 0" class="text-center p-8 bg-muted/50 rounded-2xl border border-dashed border-muted-foreground/30 text-muted-foreground font-medium italic">
      {{ $t('playlists.playlist_empty') }}
    </div>
    
    <div v-else>
      <div class="flex justify-end items-center mb-4 gap-3 bg-muted/30 p-3 rounded-xl border border-[rgba(0,0,0,0.03)]">
        <label class="text-muted-foreground font-bold text-sm flex items-center gap-2"><PlayCircle class="w-4 h-4" /> {{ $t('playlists.test_duration') }}</label>
        <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[rgba(0,0,0,0.08)] shadow-sm">
          <input type="number" :value="testDuration" @input="$emit('update:testDuration', Number(($event.target as HTMLInputElement).value))" @blur="$emit('update:testDuration', Math.min(Math.max(Number(($event.target as HTMLInputElement).value) || 1, 1), 100))" min="1" max="100" step="1" class="w-12 text-center border-none outline-none font-bold text-primary" />
          <span class="text-xs text-muted-foreground font-bold uppercase tracking-wider">{{ $t('playlists.sec') }}</span>
        </div>
      </div>
      
      <TransitionGroup name="list" tag="div" id="tracks-list" class="flex flex-col gap-3 relative">
        <div v-for="(track, index) in tracks" :key="track.url" class="flex items-center justify-between p-4 bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
          <div class="flex flex-col min-w-0 pr-4 flex-1">
            <div v-if="editingTrackIndex === index" class="flex items-center gap-2 w-full bg-slate-50 h-[60px] px-2 rounded-xl border border-slate-200 relative">
              <div class="relative z-50 flex-1 min-w-0">
                <TextInput 
                  ref="editTrackInput"
                  v-model="searchQuery" 
                  @input="onSearchInput"
                  @focus="onSearchInput"
                  @keydown.enter="saveEditTrack"
                  @keydown.esc="cancelEditTrack"
                  @blur="handleSearchBlur"
                  :placeholder="$t('playlists.search_itunes_placeholder')" 
                  inputClass="bg-white border border-slate-200 text-sm shadow-sm px-3 py-1.5 rounded-lg font-bold text-primary"
                  focusClass="focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  clearable
                />
                <div v-if="isSearching" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                
                <ul v-if="suggestions.length > 0" class="absolute bottom-full left-0 right-0 mb-1 bg-white border border-[rgba(0,0,0,0.08)] rounded-xl shadow-xl overflow-hidden max-h-[200px] overflow-y-auto z-50 flex flex-col-reverse">
                    <li 
                      v-for="(item, sIdx) in suggestions" 
                      :key="sIdx"
                      @mousedown.prevent="selectSuggestion(item)"
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
              
              <div class="flex items-center gap-2 shrink-0">
                <Btn size="sm" variant="soft" @click="cancelEditTrack">{{ $t('playlists.cancel') }}</Btn>
              </div>
            </div>
            <div v-else class="flex flex-col justify-center w-full group min-w-0 h-[60px]">
              <div 
                @click="startEditTrack(index, track)" 
                class="flex flex-col w-fit max-w-full cursor-pointer"
                :title="$t('playlists.edit_info')"
              >
                <div class="flex items-center gap-1.5 min-w-0 w-full">
                  <span class="font-bold text-primary truncate text-base">{{ track.title }}</span>
                  <span v-if="track.isCertified" :title="$t('playlists.certified')" class="flex shrink-0">
                    <BadgeCheck class="w-4.5 h-4.5 text-blue-500 fill-blue-50" />
                  </span>
                  <Edit3 class="w-3.5 h-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"/>
                </div>
                <span class="text-sm text-muted-foreground truncate w-full font-medium">{{ track.artist }}</span>
              </div>
              <p class="text-[10px] text-muted-foreground/50 m-0 truncate w-full mt-0.5" :title="track.url" dir="rtl" style="text-align: left;">{{ track.url }}</p>
            </div>
          </div>
          <div class="flex gap-2 shrink-0">
            <Btn v-if="testingTrackUrl !== track.url" variant="ghost-yellow" size="sm" className="w-[100px]" @click="$emit('test', track.url)">
              <Play class="w-4 h-4 mr-2 shrink-0" /> {{ $t('playlists.test') }}
            </Btn>
            <Btn v-else variant="dark" size="sm" className="w-[100px] bg-[#FFBA49] hover:bg-[#f0aa30] text-[#3F4739] border-none" @click="$emit('stop-test')">
              <Square class="w-4 h-4 mr-2 shrink-0 fill-current" /> {{ $t('playlists.testing') }}
            </Btn>
            <button class="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors" @click="$emit('remove', index)" :title="$t('playlists.remove')">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { PlayCircle, BadgeCheck, Edit3, Play, Square, Trash2 } from '@lucide/vue';
import Btn from '../../ui/Btn.vue';
import TextInput from '../../ui/TextInput.vue';
import { Track } from '../../../core/domain/setup/types/playlist';
import { useTrackSearch } from '../../../core/domain/setup/playlists/useTrackSearch';

const props = defineProps<{
  tracks: Track[];
  testingTrackUrl: string | null;
  testDuration: number;
}>();

const emit = defineEmits<{
  (e: 'update:testDuration', val: number): void;
  (e: 'test', url: string): void;
  (e: 'stop-test'): void;
  (e: 'remove', index: number): void;
  (e: 'update-track', index: number, track: Track): void;
}>();

const { searchQuery, suggestions, isSearching, handleSearch, handleSearchBlur, clearSearch } = useTrackSearch();

const editingTrackIndex = ref<number | null>(null);
const editingTrackData = ref<{title: string, artist: string, isCertified?: boolean}>({ title: '', artist: '', isCertified: false });
const editTrackInput = ref<any>(null);

const startEditTrack = async (index: number, track: Track) => {
  editingTrackIndex.value = index;
  editingTrackData.value = { title: track.title, artist: track.artist, isCertified: track.isCertified };
  searchQuery.value = `${track.title} - ${track.artist}`;
  suggestions.value = [];
  handleSearch('local');
  await nextTick();
  if (Array.isArray(editTrackInput.value)) {
    editTrackInput.value[0]?.focus();
  } else {
    editTrackInput.value?.focus();
  }
};

const onSearchInput = () => {
  handleSearch('local'); // iTunes search
};

const selectSuggestion = (item: {title: string, artist: string}) => {
  editingTrackData.value.title = item.title;
  editingTrackData.value.artist = item.artist;
  editingTrackData.value.isCertified = true;
  
  // Directly emit the update here to avoid applyCustomEditSearch overwriting it
  if (editingTrackIndex.value !== null) {
    const originalTrack = props.tracks[editingTrackIndex.value];
    emit('update-track', editingTrackIndex.value, {
      ...originalTrack,
      title: editingTrackData.value.title,
      artist: editingTrackData.value.artist,
      isCertified: editingTrackData.value.isCertified
    });
    editingTrackIndex.value = null;
  }
  clearSearch();
};

const applyCustomEditSearch = () => {
  if (!searchQuery.value.trim()) return;
  const customText = searchQuery.value.trim();
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
};

const saveEditTrack = () => {
  if (searchQuery.value.trim()) {
    applyCustomEditSearch();
  }
  
  if (editingTrackIndex.value !== null) {
    const originalTrack = props.tracks[editingTrackIndex.value];
    emit('update-track', editingTrackIndex.value, {
      ...originalTrack,
      title: editingTrackData.value.title,
      artist: editingTrackData.value.artist,
      isCertified: editingTrackData.value.isCertified
    });
    editingTrackIndex.value = null;
  }
  clearSearch();
};

const cancelEditTrack = () => {
  editingTrackIndex.value = null;
  clearSearch();
};
</script>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
.list-leave-active {
  position: absolute;
  width: 100%;
}
</style>
