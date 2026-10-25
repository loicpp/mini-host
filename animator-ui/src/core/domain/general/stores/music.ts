import { ref } from 'vue';
import { Track } from '../../../../services/music/MusicProvider';

export type TrackSortOption = 'artist' | 'title' | 'year' | 'playlist';
export type SortDirection = 'asc' | 'desc';

const currentSource = ref('soundcloud');
const searchQuery = ref('');
const selectedTrack = ref<Track | null>(null);
const localTracks = ref<Track[]>([]);
const playedTracks = ref<string[]>([]);
const trackSort = ref<TrackSortOption>('artist');
const sortDirection = ref<SortDirection>('asc');
const hidePlayedTracks = ref(false);
const musicProgress = ref(0);
const musicTimeLeft = ref(0);
const currentTrackDuration = ref<number | null>(null);
const trackEnded = ref(false);

export function useMusicStore() {
  return {
    currentSource,
    searchQuery,
    selectedTrack,
    localTracks,
    playedTracks,
    trackSort,
    sortDirection,
    hidePlayedTracks,
    musicProgress,
    musicTimeLeft,
    currentTrackDuration,
    trackEnded,
  };
}
