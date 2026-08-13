<template>
  <div id="track-name-input" :class="playlistType === 'local' ? 'bg-amber-50/50 border-amber-100' : 'bg-blue-50/50 border-blue-100'" class="border p-5 rounded-2xl mb-8">
    <div class="flex justify-between items-center mb-4">
      <h4 v-if="playlistType === 'local'" class="font-bold text-amber-800 flex items-center gap-2 m-0"><FolderOpen class="w-4 h-4" /> {{ $t('playlists.add_local') }}</h4>
      <h4 v-else class="font-bold text-blue-800 flex items-center gap-2 m-0"><PlusCircle class="w-4 h-4" /> {{ $t('playlists.add_sc') }}</h4>
    </div>
    
    <div v-if="playlistType === 'soundcloud' && !newTrack.title" class="relative mb-4 z-10">
      <TextInput 
        id="track-search-input"
        ref="searchInputRef"
        v-model="searchQuery" 
        @input="onSearchInput"
        @focus="onSearchInput"
        @keydown.enter="handleEnter"
        @keydown.down.prevent="selectNextSuggestion"
        @keydown.up.prevent="selectPrevSuggestion"
        @keydown.esc="clearSearch"
        @blur="handleSearchBlur"
        :placeholder="$t('playlists.search_sc_placeholder')" 
        inputClass="bg-white border border-blue-100 shadow-sm px-4 py-3 rounded-xl font-medium text-foreground"
        focusClass="focus:ring-2 focus:ring-blue-400"
        clearable
      />
      <div v-if="isSearching" class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-blue-200 border-t-transparent rounded-full animate-spin"></div>
      
      <ul id="track-suggestions-list" v-if="suggestions.length > 0" class="absolute top-full left-0 right-0 mt-2 bg-white border border-[rgba(0,0,0,0.08)] rounded-xl shadow-2xl overflow-hidden max-h-[250px] overflow-y-auto z-50">
          <li 
            v-for="(item, index) in suggestions" 
            :key="index"
            @mousedown.prevent="selectSuggestion(item)"
            @mouseenter="selectedSuggestionIndex = index"
            class="flex items-center gap-3 p-3 cursor-pointer border-b border-muted transition-colors last:border-b-0"
            :class="index === selectedSuggestionIndex ? 'bg-muted' : 'hover:bg-muted'"
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
    
    <div v-else-if="playlistType === 'local' && !newTrack.url" class="flex justify-center gap-6 py-4">
      <Btn variant="primary" @click="$emit('add-local-file')">
        <FileAudio class="w-4 h-4 mr-2" /> {{ $t('playlists.import_track') }}
      </Btn>
      <Btn v-if="!hideFolderOption" variant="primary" @click="$emit('add-local-folder')">
        <FolderPlus class="w-4 h-4 mr-2" /> {{ $t('playlists.import_folder') }}
      </Btn>
    </div>
    
    <div v-else class="flex flex-col gap-4">
      <div class="bg-white p-3 rounded-xl border flex items-center justify-between shadow-sm mb-4" :class="playlistType === 'local' ? 'border-amber-100' : 'border-blue-100'">
          <div v-if="!isEditingTrack" class="flex flex-col flex-1 min-w-0 mr-4">
              <strong class="flex items-center gap-2" :class="playlistType === 'local' ? 'text-amber-900' : 'text-blue-900'">
                  <span class="truncate">{{ newTrack.title }}</span>
                  <span id="track-certification" v-if="newTrack.isCertified" :title="$t('playlists.certified')" class="flex shrink-0">
                    <BadgeCheck class="w-4 h-4 text-blue-500 fill-blue-50" />
                  </span>
                  <span id="track-certification" v-else :title="$t('playlists.not_certified')" class="flex shrink-0">
                    <XCircle class="w-4 h-4 text-red-500 fill-red-50" />
                  </span>
              </strong>
              <span v-if="newTrack.artist" class="text-sm truncate" :class="playlistType === 'local' ? 'text-amber-700' : 'text-blue-700'">{{ newTrack.artist }}</span>
          </div>
          
          <div v-else class="flex-1 min-w-0 mr-4 relative z-50">
              <TextInput 
                ref="editInput"
                v-model="searchQuery" 
                @input="onSearchInput"
                @focus="onSearchInput"
                @keydown.enter="saveEdit"
                @keydown.esc="clearSearch"
                @blur="handleSearchBlur"
                :placeholder="$t('playlists.search_itunes_placeholder')" 
                inputClass="bg-white border border-slate-200 text-sm shadow-sm px-3 py-1.5 rounded-lg font-bold text-primary"
                focusClass="focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                clearable
              />
              <div v-if="isSearching" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              
              <ul v-if="suggestions.length > 0" class="absolute top-full mt-1 left-0 right-0 bg-white border border-[rgba(0,0,0,0.08)] rounded-xl shadow-xl overflow-hidden max-h-[200px] overflow-y-auto z-50">
                  <li 
                    v-for="(item, sIdx) in suggestions" 
                    :key="sIdx"
                    @mousedown.prevent="selectSuggestionForEdit(item)"
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
              <template v-if="!isEditingTrack">
                  <button @click="startEdit" class="text-xs text-blue-500 hover:text-blue-700 font-bold px-2 py-1 bg-blue-50 rounded-lg flex items-center gap-1 outline-none">
                    <Edit3 class="w-3 h-3"/> {{ $t('playlists.edit') }}
                  </button>
              </template>
              <template v-else>
                  <Btn size="sm" variant="soft" @click="cancelEdit">{{ $t('playlists.cancel') }}</Btn>
              </template>
              <button v-if="!isEditingTrack" @click="clear" class="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg flex items-center justify-center transition-colors outline-none" :title="$t('playlists.cancel_add')">
                <X class="w-4 h-4"/>
              </button>
          </div>
      </div>
      
      <div class="flex gap-4" v-if="playlistType === 'soundcloud'">
        <TextInput ref="urlInputRef" id="soundcloud-track-url" :modelValue="newTrack.url" @input="updateUrl" @keydown.enter="$emit('add-sc-track')" :placeholder="$t('playlists.sc_url')" inputClass="bg-white border border-blue-100 shadow-sm px-4 py-3 rounded-xl font-medium text-foreground" focusClass="focus:ring-2 focus:ring-blue-400" wrapperClass="flex-2" clearable @clear="updateUrl({ target: { value: '' } } as unknown as Event)" />
        <Btn id="soundcloud-add-track-btn" variant="primary" @click="$emit('add-sc-track')" :disabled="!newTrack.url.trim()">{{ $t('playlists.add') }}</Btn>
      </div>
      
      <div class="flex justify-end gap-4" v-else>
        <Btn id="add-track-btn" variant="primary" @click="$emit('confirm-local')">
          <Plus class="w-4 h-4 mr-2" /> 
          {{ $t('playlists.add') }}
        </Btn>
      </div>
      
      <div v-if="duplicateWarning" class="mt-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
        <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
        {{ duplicateWarning }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue';
import { PlusCircle, FolderOpen, FileAudio, FolderPlus, BadgeCheck, XCircle, X, Edit3, Plus } from '@lucide/vue';
import Btn from '../ui/Btn.vue';
import TextInput from '../ui/TextInput.vue';
import { Track } from '../../types/playlist';
import { useTrackSearch } from '../../composables/useTrackSearch';
import { useTrackCertifier } from '../../composables/useTrackCertifier';

const props = defineProps<{
  playlistType?: 'soundcloud' | 'local';
  newTrack: Track;
  duplicateWarning: string | null;
  initialSearchQuery?: string;
  autofocusSearch?: boolean;
  hideFolderOption?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:newTrack', track: Track): void;
  (e: 'clear'): void;
  (e: 'add-sc-track'): void;
  (e: 'add-local-file'): void;
  (e: 'add-local-folder'): void;
  (e: 'confirm-local'): void;
  (e: 'reset-duplicate-warning'): void;
}>();

const { searchQuery, suggestions, isSearching, handleSearch, handleSearchBlur, clearSearch } = useTrackSearch();
const { autoCertifyTrack } = useTrackCertifier();

const isEditingTrack = ref(false);
const editInput = ref<any>(null);
const searchInputRef = ref<any>(null);
const urlInputRef = ref<any>(null);
const selectedSuggestionIndex = ref(-1);

watch(suggestions, () => {
  selectedSuggestionIndex.value = -1;
});

const scrollToSuggestion = () => {
  nextTick(() => {
    const list = document.getElementById('track-suggestions-list');
    if (!list) return;
    const items = list.querySelectorAll('li');
    const selectedItem = items[selectedSuggestionIndex.value] as HTMLElement;
    
    if (selectedItem) {
      const listTop = list.scrollTop;
      const listBottom = listTop + list.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;

      if (itemTop < listTop) {
        list.scrollTop = itemTop;
      } else if (itemBottom > listBottom) {
        list.scrollTop = itemBottom - list.clientHeight;
      }
    }
  });
};

const selectNextSuggestion = () => {
  if (suggestions.value.length > 0) {
    if (selectedSuggestionIndex.value < suggestions.value.length - 1) {
      selectedSuggestionIndex.value++;
    } else {
      selectedSuggestionIndex.value = 0;
    }
    scrollToSuggestion();
  }
};

const selectPrevSuggestion = () => {
  if (suggestions.value.length > 0) {
    if (selectedSuggestionIndex.value > 0) {
      selectedSuggestionIndex.value--;
    } else {
      selectedSuggestionIndex.value = suggestions.value.length - 1;
    }
    scrollToSuggestion();
  }
};

const handleEnter = () => {
  if (selectedSuggestionIndex.value >= 0 && selectedSuggestionIndex.value < suggestions.value.length) {
    selectSuggestion(suggestions.value[selectedSuggestionIndex.value] as any);
  } else {
    applyCustomSearch();
  }
};

watch(() => props.newTrack.url, (newUrl, oldUrl) => {
  if (oldUrl && !newUrl) {
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  }
});

onMounted(() => {
  if (props.initialSearchQuery && !props.newTrack.title) {
    searchQuery.value = props.initialSearchQuery;
    handleSearch(props.playlistType || 'soundcloud');
  }
  if (props.autofocusSearch) {
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  }
});

const onSearchInput = () => {
  emit('reset-duplicate-warning');
  handleSearch(isEditingTrack.value ? 'local' : (props.playlistType || 'soundcloud'));
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
  
  emit('update:newTrack', { ...props.newTrack, title, artist, isCertified: false });
  clearSearch();
};

const selectSuggestion = async (item: {title: string, artist: string, url?: string}) => {
  let updatedTrack = { ...props.newTrack, title: item.title, artist: item.artist, isCertified: false };
  if (item.url) {
    updatedTrack.url = item.url;
  }
  
  if (props.playlistType === 'soundcloud') {
    updatedTrack = await autoCertifyTrack(updatedTrack as any) as any;
  }
  
  emit('update:newTrack', updatedTrack);
  clearSearch();
  
  nextTick(() => {
    urlInputRef.value?.focus();
  });
};

const startEdit = async () => {
  isEditingTrack.value = true;
  searchQuery.value = `${props.newTrack.title} ${props.newTrack.artist}`.trim();
  handleSearch('local'); // use iTunes for editing metadata
  await nextTick();
  editInput.value?.focus();
};

const selectSuggestionForEdit = (item: {title: string, artist: string}) => {
  emit('update:newTrack', { ...props.newTrack, title: item.title, artist: item.artist, isCertified: true });
  isEditingTrack.value = false;
  clearSearch();
};

const saveEdit = () => {
  if (searchQuery.value.trim()) {
    applyCustomSearch();
  }
  isEditingTrack.value = false;
};

const cancelEdit = () => {
  isEditingTrack.value = false;
  clearSearch();
};

const clear = () => {
  isEditingTrack.value = false;
  clearSearch();
  emit('clear');
};

const updateUrl = (event: Event) => {
  emit('reset-duplicate-warning');
  emit('update:newTrack', { ...props.newTrack, url: (event.target as HTMLInputElement).value });
};
</script>
