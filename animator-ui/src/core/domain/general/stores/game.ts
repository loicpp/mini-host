import { ref } from 'vue';

const gameId = ref('');
const gameSecret = ref('');
const status = ref('waiting');
const gameType = ref('blind_test');
const gameSettings = ref<any>({ blockDuration: 0, musicDuration: 15, duration: 30, mode: 'text', allowSuggestions: true, penaltyOnWrongAnswer: false });
const lastGameId = ref<string | null>(localStorage.getItem('minihost_last_game'));
const currentStartTime = ref(0);
const nextTrackInfo = ref({ answer: '' });

export function useGameStore() {
  return {
    gameId,
    gameSecret,
    status,
    gameType,
    gameSettings,
    lastGameId,
    currentStartTime,
    nextTrackInfo,
  };
}
