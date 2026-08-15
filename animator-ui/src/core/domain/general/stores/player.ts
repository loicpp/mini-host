import { ref } from 'vue';
import { Players } from '../../models/Game';

const players = ref<Players>({});
const pressedBuzzer = ref<string | null>(null);
const pendingPoints = ref<Record<string, number>>({});
const lastAwardedPoints = ref<Record<string, number>>({});
const autoCorrectResults = ref<Record<string, boolean>>({});
const wasAutoCorrected = ref(false);

export function usePlayerStore() {
  return {
    players,
    pressedBuzzer,
    pendingPoints,
    lastAwardedPoints,
    autoCorrectResults,
    wasAutoCorrected,
  };
}
