import { gameSettings, lastGameId, gameId, gameSecret, status, gameType, currentSource, playedTracks, localTracks, players, pressedBuzzer, isProjectorOpen, selectedTrack, nextTrackInfo, searchQuery, pendingPoints, currentStartTime } from './state';
import { animatorService } from '../services/animatorService';
import { musicManager } from '../services/music/MusicManager';
import { Track } from '../services/music/MusicProvider';
import { useDialog } from './useDialog';
import { useTutorial } from './useTutorial';
import { useI18n } from 'vue-i18n';

let projectorWindow: Window | null = null;

export function useGameSession() {
  const { t } = useI18n();
  const { showAlert, showConfirm } = useDialog();

  const sanitizeTracks = (tracks: any[]): Track[] => {
    return tracks.map(t => {
      if (t.id && t.source) return t;
      
      let source = 'soundcloud';
      if (t.url && (t.url.includes('youtube') || t.url.includes('youtu.be'))) source = 'youtube';
      
      let id = t.url;
      if (source === 'youtube' && t.url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = t.url.match(regExp);
        if (match && match[2].length === 11) {
          id = match[2];
        }
      }
      
      return {
        ...t,
        id: t.id || id || String(Math.random()),
        source: t.source || source
      };
    });
  };

  const createNewGame = async (type: string, settings: any) => {
    gameType.value = type;
    if (settings) {
      gameSettings.value = {
        blockDuration: settings.blockDuration || 0,
        musicDuration: settings.musicDuration || 15,
        duration: settings.duration,
        mode: settings.mode,
        allowSuggestions: settings.allowSuggestions ?? true,
        penaltyOnWrongAnswer: settings.penaltyOnWrongAnswer ?? false,
        preset: settings.preset || 'custom',
        playlist: settings.playlist
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
    
    try {
      await fetch('http://127.0.0.1:5000/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localTracks: localTracks.value, playedTracks: [], settings: gameSettings.value, gameType: gameType.value })
      });
    } catch {
      console.warn("Could not save game.json");
    }
    
    try {
      await fetch('http://127.0.0.1:5000/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          lastGameId: game.gameId
        })
      });
      lastGameId.value = game.gameId;
    } catch {
      console.warn("Could not save lastGameId to backend");
    }
    
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
    
    try {
      const res = await fetch('http://127.0.0.1:5000/api/game');
      const data = await res.json();
      if (data.localTracks) localTracks.value = data.localTracks;
      if (data.playedTracks) playedTracks.value = data.playedTracks;
      if (data.settings) gameSettings.value = data.settings;
    } catch {
      console.warn("Could not load game.json");
    }
    
    currentSource.value = (gameSettings.value as any).playlist?.type || 'soundcloud';
    
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

  const toggleProjector = async () => {
    if (!isProjectorOpen.value) {
      projectorWindow = window.open(`/public?game=${gameId.value}`, 'projectorWindow', 'width=1280,height=720');
      isProjectorOpen.value = true;
      
      if (projectorWindow) {
        const timer = setInterval(() => {
          if (projectorWindow?.closed) {
            clearInterval(timer);
            isProjectorOpen.value = false;
            projectorWindow = null;
          }
        }, 1000);
      }
    } else {
      if (projectorWindow) {
        projectorWindow.close();
        projectorWindow = null;
      }
      isProjectorOpen.value = false;
    }
  };

  const nextRound = async () => {
    status.value = 'waiting';
    nextTrackInfo.value.answer = '';
    searchQuery.value = '';
    pendingPoints.value = {};
    
    try {
      await animatorService.clearPlayerAnswers(gameId.value);
    } catch {
      console.warn("Could not clear player answers");
    }
    selectedTrack.value = null;
    await animatorService.updateGameState(gameId.value, 'waiting');
  };

  const endGame = async () => {
    const { isTutorialActive } = useTutorial();
    if (isTutorialActive.value || await showConfirm({ title: t('dialogs.stop_game.title'), message: t('dialogs.stop_game.message'), confirmText: t('dialogs.stop_game.confirm'), confirmVariant: "danger" })) {
      status.value = 'finished';
      try { await musicManager.stop(); } catch { console.warn("Could not stop music"); }
      await animatorService.updateGameState(gameId.value, 'finished');
    }
  };

  const updateGameSettings = async (newSettings: any) => {
    if (!gameId.value) return;
    gameSettings.value = { ...gameSettings.value, ...newSettings };
    
    try {
      await animatorService.updateGameSettings(gameId.value, gameSettings.value);
    } catch (e) {
      console.warn("Could not update settings in Firebase", e);
    }

    try {
      await fetch('http://127.0.0.1:5000/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          localTracks: localTracks.value, 
          playedTracks: playedTracks.value, 
          settings: gameSettings.value,
          gameType: gameType.value 
        })
      });
    } catch (e) {
      console.warn("Could not sync settings to python backend", e);
    }
  };

  const restartGame = async () => {
    status.value = 'waiting';
    try { await musicManager.stop(); } catch { console.warn("Could not stop music"); }
    nextTrackInfo.value.answer = '';
    searchQuery.value = '';
    selectedTrack.value = null;
    pendingPoints.value = {};
    
    try {
      await animatorService.resetPlayers(gameId.value);
    } catch {
      console.warn("Could not reset players");
    }
    await animatorService.updateGameState(gameId.value, 'waiting', null);
    
    playedTracks.value = [];
    try {
      await fetch('http://127.0.0.1:5000/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localTracks: localTracks.value, playedTracks: [], settings: gameSettings.value })
      });
    } catch(e) {
      console.warn("Could not reset game.json", e);
    }
  };

  return {
    createNewGame,
    resumeGame,
    leaveGame,
    deleteAndLeaveGame,
    toggleProjector,
    nextRound,
    endGame,
    restartGame,
    updateGameSettings
  };
}
