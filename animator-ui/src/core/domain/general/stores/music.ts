import { ref } from 'vue';
import { Track } from '../../../../services/music/MusicProvider';

const currentSource = ref('soundcloud');
const searchQuery = ref('');
const selectedTrack = ref<Track | null>(null);
const localTracks = ref<Track[]>([]);
const playedTracks = ref<string[]>([]);
const trackSort = ref<'title' | 'artist'>('title');
const hidePlayedTracks = ref(false);
const musicProgress = ref(0);
const musicTimeLeft = ref(0);

export function useMusicStore() {
  return {
    currentSource,
    searchQuery,
    selectedTrack,
    localTracks,
    playedTracks,
    trackSort,
    hidePlayedTracks,
    musicProgress,
    musicTimeLeft,
  };
}
