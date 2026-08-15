import { ref } from 'vue';
import { Track } from '../../../services/music/MusicProvider';
import i18n from '../../../i18n';

// Global shared state for the application
export const email = ref('');
export const password = ref('');
export const loginError = ref('');
export const isLoggedIn = ref(false);

export const gameId = ref('');
export const gameSecret = ref('');
export const status = ref('waiting');
export const gameType = ref('blind_test');

export const players = ref<Record<string, any>>({});
export const currentLanguage = ref(i18n.global.locale.value);
export const nextTrackInfo = ref({ answer: '' });
export const currentSource = ref('soundcloud');
export const searchQuery = ref('');
export const selectedTrack = ref<Track | null>(null);
export const localTracks = ref<Track[]>([]);
export const playedTracks = ref<string[]>([]);
export const trackSort = ref<'title' | 'artist'>('title');
export const hidePlayedTracks = ref(false);

export const isProjectorOpen = ref(false);
export const showDiagnostics = ref(false);

export const pressedBuzzer = ref<string | null>(null);

export const gameSettings = ref<any>({ blockDuration: 0, musicDuration: 15, duration: 30, mode: 'text', allowSuggestions: true, penaltyOnWrongAnswer: false });

export const pendingPoints = ref<Record<string, number>>({});
export const lastAwardedPoints = ref<Record<string, number>>({});
export const autoCorrectResults = ref<Record<string, boolean>>({});
export const wasAutoCorrected = ref(false);

export const musicProgress = ref(0);
export const musicTimeLeft = ref(0);
export const lastGameId = ref<string | null>(localStorage.getItem('minihost_last_game'));

export const isBackendConnected = ref(true);
export const currentStartTime = ref(0);
