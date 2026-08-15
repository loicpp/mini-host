import { useGameStore } from '../general/stores/game';
import { useMusicStore } from '../general/stores/music';
import { usePlayerStore } from '../general/stores/player';
import { useUiStore } from '../general/stores/ui';
import { animatorService } from '../../../services/animatorService';
import { musicManager } from '../../../services/music/MusicManager';
import { useDialog } from '../general/useDialog';
import { useI18n } from 'vue-i18n';

import { localBackendService } from '../../../services/localBackendService';
import { sanitizeTracks } from './trackUtils';
import { useProjector } from './useProjector';
import { useGameState } from './useGameState';
import { GameSettings } from '../models/Game';

export function useGameSession() {
  const { t } = useI18n();
  const { showAlert, showConfirm } = useDialog();

  const { gameSettings, lastGameId, gameId, gameSecret, status, gameType, nextTrackInfo, currentStartTime } = useGameStore();
  const { currentSource, playedTracks, localTracks, selectedTrack, searchQuery, trackSort, hidePlayedTracks } = useMusicStore();
  const { players, pressedBuzzer } = usePlayerStore();
  const { isProjectorOpen } = useUiStore();

  const { toggleProjector, closeProjector } = useProjector();
  const { nextRound, endGame, restartGame } = useGameState();

  const createNewGame = async (type: string, settings: GameSettings) => {
    gameType.value = type;
    if (settings) {
      gameSettings.value = {
        blockDuration: settings.blockDuration || 0,
        musicDuration: settings.musicDuration || 15,
        duration: settings.duration,
        mode: settings.mode,
        allowSuggestions: settings.allowSuggestions ?? true,
        penaltyOnWrongAnswer: settings.penaltyOnWrongAnswer ?? false,
        preset: settings.preset || 'custom'
      };
    }

    if (lastGameId.value) {
      try {
        await animatorService.deleteGame(lastGameId.value);
      } catch {
        console.warn("Could not delete previous game");
      }
    }

    const game = await animatorService.createGame(gameType.value, gameSettings.value);
    
    gameId.value = game.gameId;
    gameSecret.value = game.secret;
    status.value = 'waiting';
    currentSource.value = settings?.playlist?.type || 'soundcloud';
    
    if (musicManager.activeProviderName !== currentSource.value) {
      try {
        await musicManager.setProvider(currentSource.value);
      } catch {
        console.warn("Could not set music provider");
      }
    }
    
    playedTracks.value = [];
    localTracks.value = (settings && settings.playlist) ? sanitizeTracks(settings.playlist.tracks) : [];
    
    await localBackendService.saveGameData({ localTracks: localTracks.value, playedTracks: [] });
    await localBackendService.saveConfig({ lastGameId: game.gameId });
    lastGameId.value = game.gameId;
    
    animatorService.listenToPlayers(gameId.value, (newPlayers) => {
      players.value = newPlayers;
    });
    animatorService.listenToPressedBuzzer(gameId.value, (buzzerData) => {
      pressedBuzzer.value = buzzerData;
    });

    return game.gameId;
  };

  const resumeGame = async () => {
    if (!lastGameId.value) return false;
    gameId.value = lastGameId.value;
    
    try {
      const gameData = await animatorService.getGame(gameId.value);
      
      if (!gameData) {
        await showAlert({ title: t('dialogs.game_not_found.title'), message: t('dialogs.game_not_found.message') });
        lastGameId.value = null;
        return false;
      }

      if (gameData.data?.settings) {
        gameSettings.value = gameData.data.settings;
      }

      if (gameData.data?.settings?.gameType) {
        gameType.value = gameData.data.settings.gameType;
      } else {
        gameType.value = 'blind_test'; // Default to blind_test for old games
      }

      if (gameData.data?.status) {
        status.value = gameData.data.status;
      } else {
        status.value = 'waiting';
      }

      if (gameData.data?.startTime) {
        currentStartTime.value = gameData.data.startTime;
      }

      if (gameData.answer) {
        nextTrackInfo.value.answer = gameData.answer;
      }
    } catch {
      console.warn("Could not fetch game status from Firebase, falling back to 'waiting'");
      status.value = 'waiting';
    }
    
    const data = await localBackendService.loadGame();
    if (data) {
      if (data.localTracks) localTracks.value = data.localTracks;
      if (data.playedTracks) playedTracks.value = data.playedTracks;
      if (data.sort) trackSort.value = data.sort as 'title' | 'artist';
      if (data.hidePlayedTracks !== undefined) hidePlayedTracks.value = data.hidePlayedTracks;
    }
    
    currentSource.value = localTracks.value.length > 0 ? localTracks.value[0].source || 'soundcloud' : 'soundcloud';
    
    animatorService.listenToPlayers(gameId.value, (newPlayers) => {
      players.value = newPlayers;
    });
    animatorService.listenToPressedBuzzer(gameId.value, (buzzerData) => {
      pressedBuzzer.value = buzzerData;
    });

    return true;
  };

  const leaveGame = async () => {
    if (isProjectorOpen.value) {
      await toggleProjector();
    }
    try {
      await musicManager.stop();
    } catch {
      console.warn("Could not stop music");
    }
    gameId.value = '';
    selectedTrack.value = null;
    searchQuery.value = '';
  };

  const deleteAndLeaveGame = async () => {
    if (await showConfirm({ title: t('dialogs.delete_game.title'), message: t('dialogs.delete_game.message'), confirmText: t('dialogs.delete_game.confirm'), confirmVariant: "danger" })) {
      const id = gameId.value;
      await leaveGame();
      if (id) {
        await animatorService.deleteGame(id);
      }
      return true;
    }
    return false;
  };

  const updateGameSettings = async (newSettings: Partial<GameSettings>) => {
    if (!gameId.value) return;
    gameSettings.value = { ...gameSettings.value, ...newSettings };
    
    try {
      await animatorService.updateGameSettings(gameId.value, gameSettings.value);
    } catch (e) {
      console.warn("Could not update settings in Firebase", e);
    }

    await localBackendService.saveGameData({ localTracks: localTracks.value, playedTracks: playedTracks.value });
  };

  return {
    createNewGame,
    resumeGame,
    leaveGame,
    deleteAndLeaveGame,
    toggleProjector,
    closeProjector,
    nextRound,
    endGame,
    restartGame,
    updateGameSettings
  };
}
