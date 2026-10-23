import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.hoisted(() => {
  globalThis.localStorage = {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0
  };
});

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, fallback?: string) => fallback || key
  })
}));

vi.mock('../../../services/animatorService', () => ({
  animatorService: {
    awardPoints: vi.fn(),
    updateRanks: vi.fn(),
    updateGameState: vi.fn(),
    clearPressedBuzzer: vi.fn(),
    decrementBlockedTurns: vi.fn(),
  }
}));

vi.mock('../../../components/ui/dialog/useDialog', () => ({
  useDialog: () => ({
    showConfirm: vi.fn().mockResolvedValue(true)
  })
}));

import { useGamePlayers } from './useGamePlayers';
import { usePlayerStore } from '../general/stores/player';
import { useGameStore } from '../general/stores/game';

describe('useGamePlayers bonus feature', () => {
  const { players, pendingPoints, pendingBonuses, lastAwardedBonuses } = usePlayerStore();
  const { gameId, status, gameSettings } = useGameStore();

  beforeEach(() => {
    vi.clearAllMocks();
    gameId.value = 'TEST_GAME';
    status.value = 'reviewing';
    gameSettings.value = { mode: 'text' } as any;
    players.value = {
      p1: { name: 'Alice', score: 10 } as any,
      p2: { name: 'Bob', score: 0 } as any
    };
    pendingPoints.value = {};
    pendingBonuses.value = {};
    lastAwardedBonuses.value = {};
  });

  it('awards bonus points and sets isBonus flag on displayedPlayers', () => {
    const { award, displayedPlayers } = useGamePlayers();

    // Award normal points
    award('p1', 1, false);
    expect(pendingPoints.value['p1']).toBe(1);
    expect(pendingBonuses.value['p1']).toBeUndefined();
    expect(displayedPlayers.value['p1'].isBonus).toBe(false);

    // Award bonus points of 3
    award('p2', 3, true);
    expect(pendingPoints.value['p2']).toBe(3);
    expect(pendingBonuses.value['p2']).toBe(true);
    expect(displayedPlayers.value['p2'].isBonus).toBe(true);
  });

  it('clears bonus state when awarding 0 points (cancellation)', () => {
    const { award, displayedPlayers } = useGamePlayers();

    award('p2', 4, true);
    expect(pendingBonuses.value['p2']).toBe(true);

    award('p2', 0);
    expect(pendingPoints.value['p2']).toBeUndefined();
    expect(pendingBonuses.value['p2']).toBeUndefined();
    expect(displayedPlayers.value['p2'].isBonus).toBe(false);
  });

  it('transfers bonus state to lastAwardedBonuses on applyPendingPoints and sets hasBonus in round results', async () => {
    const { award, applyPendingPoints, playersRoundResults } = useGamePlayers();

    award('p1', 1, false);
    award('p2', 5, true);

    await applyPendingPoints();

    expect(pendingBonuses.value).toEqual({});
    expect(lastAwardedBonuses.value['p2']).toBe(true);
    expect(lastAwardedBonuses.value['p1']).toBeUndefined();

    const p2Result = playersRoundResults.value.find(p => p.id === 'p2');
    const p1Result = playersRoundResults.value.find(p => p.id === 'p1');

    expect(p2Result?.hasBonus).toBe(true);
    expect(p1Result?.hasBonus).toBe(false);
  });
});
