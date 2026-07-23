import { ref } from 'vue';
import { itunesService } from '../services/itunesService';

export function useTrackSearch() {
  const searchQuery = ref('');
  const suggestions = ref<{title: string, artist: string, coverUrl: string, url?: string}[]>([]);
  const isSearching = ref(false);
  const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (playlistType: 'soundcloud' | 'local') => {
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value as any);
    }
    suggestions.value = [];
    
    if (searchQuery.value.trim().length < 2) {
      isSearching.value = false;
      return;
    }

    isSearching.value = true;
    searchTimeout.value = setTimeout(async () => {
      if (playlistType === 'soundcloud') {
        try {
          const res = await fetch(`http://127.0.0.1:5000/api/soundcloud/search?q=${encodeURIComponent(searchQuery.value)}`);
          const data = await res.json();
          suggestions.value = data;
        } catch (e) {
          console.error("SC search failed", e);
          suggestions.value = [];
        }
      } else {
        suggestions.value = await itunesService.search(searchQuery.value);
      }
      isSearching.value = false;
    }, 500);
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      suggestions.value = [];
    }, 200);
  };

  const clearSearch = () => {
    searchQuery.value = '';
    suggestions.value = [];
  };

  return {
    searchQuery,
    suggestions,
    isSearching,
    handleSearch,
    handleSearchBlur,
    clearSearch
  };
}
