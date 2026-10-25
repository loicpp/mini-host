import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.hoisted(() => {
  globalThis.localStorage = {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0
  };
  globalThis.requestAnimationFrame = vi.fn().mockReturnValue(1);
  globalThis.cancelAnimationFrame = vi.fn();
});

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, fallback?: string) => fallback || key
  })
}));

let capturedOnEnded: (() => void) | null = null;

vi.mock('../../../services/music/MusicManager', () => ({
  musicManager: {
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn().mockResolvedValue(undefined),
    resume: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    onEnded: vi.fn((cb) => { capturedOnEnded = cb; }),
    getDuration: vi.fn().mockResolvedValue(30000),
    activate: vi.fn().mockResolvedValue(undefined),
    preload: vi.fn().mockResolvedValue(undefined),
  }
}));

vi.mock('../../../firebase', () => ({
  getServerTime: vi.fn().mockReturnValue(1000),
  db: {},
  auth: {}
}));

vi.mock('../../../services/animatorService', () => ({
  animatorService: {
    clearPressedBuzzer: vi.fn().mockResolvedValue(undefined),
    updateGameState: vi.fn().mockResolvedValue(undefined),
    clearPlayerAnswers: vi.fn().mockResolvedValue(undefined),
    setPlayerExclusion: vi.fn().mockResolvedValue(undefined),
  }
}));

vi.mock('../../../services/localBackendService', () => ({
  localBackendService: {
    saveGameData: vi.fn().mockResolvedValue(undefined),
  }
}));

vi.mock('../../../components/ui/dialog/useDialog', () => ({
  useDialog: () => ({
    showAlert: vi.fn().mockResolvedValue(undefined),
    showConfirm: vi.fn().mockResolvedValue(true),
  })
}));

import { nextTick, effectScope, type EffectScope } from 'vue';
import { useGameMusic } from './useGameMusic';
import { useGameState } from './useGameState';
import { useGameStore } from '../general/stores/game';
import { useMusicStore } from '../general/stores/music';
import { musicManager } from '../../../services/music/MusicManager';

describe('useGameMusic & useGameState music resumption on results', () => {
  const { status, gameSettings, gameId } = useGameStore();
  const { selectedTrack } = useMusicStore();
  let scope: EffectScope;

  beforeEach(() => {
    vi.clearAllMocks();
    scope = effectScope();
    gameId.value = 'TEST_GAME';
    status.value = 'waiting';
    gameSettings.value = { mode: 'text', duration: 30, musicDuration: 15 };
    selectedTrack.value = null;
  });

  afterEach(() => {
    scope.stop();
  });

  it('nextRound stops the music via musicManager.stop()', async () => {
    await scope.run(async () => {
      const { nextRound } = useGameState();
      await nextRound();
      expect(musicManager.stop).toHaveBeenCalledTimes(1);
      expect(status.value).toBe('waiting');
    });
  });

  it('stopMusic pauses the music via musicManager.pause() rather than resetting it with stop()', async () => {
    await scope.run(async () => {
      const { stopMusic } = useGameMusic();
      status.value = 'playing';
      await stopMusic();
      expect(musicManager.pause).toHaveBeenCalledTimes(1);
      expect(musicManager.stop).not.toHaveBeenCalled();
      expect(status.value).toBe('reviewing');
    });
  });

  it('resumes music when transitioning to results status if track has not ended', async () => {
    await scope.run(async () => {
      useGameMusic(); // initialize watcher
      selectedTrack.value = { id: 'track-1', title: 'Song', artist: 'Artist', duration: 30000, source: 'local' };

      status.value = 'playing';
      await nextTick();

      status.value = 'reviewing';
      await nextTick();
      expect(musicManager.resume).not.toHaveBeenCalled();

      status.value = 'results';
      await nextTick();
      expect(musicManager.resume).toHaveBeenCalledTimes(1);
    });
  });

  it('does not resume music when transitioning to results status if track has already ended', async () => {
    await scope.run(async () => {
      useGameMusic();
      selectedTrack.value = { id: 'track-2', title: 'Song 2', artist: 'Artist', duration: 30000, source: 'local' };

      // Trigger onEnded
      if (capturedOnEnded) {
        capturedOnEnded();
      }

      status.value = 'results';
      await nextTick();
      expect(musicManager.resume).not.toHaveBeenCalled();
    });
  });
});
