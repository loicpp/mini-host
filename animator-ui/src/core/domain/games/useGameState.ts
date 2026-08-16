import { useGameStore } from '../general/stores/game';
import { useMusicStore } from '../general/stores/music';
import { usePlayerStore } from '../general/stores/player';
import { animatorService } from '../../../services/animatorService';
import { musicManager } from '../../../services/music/MusicManager';
import { useDialog } from '../general/useDialog';
import { useI18n } from 'vue-i18n';
import { localBackendService } from '../../../services/localBackendService';

export function useGameState() {
  const { t } = useI18n();
  const { showConfirm } = useDialog();
  const { gameId, status, nextTrackInfo, gameSettings } = useGameStore();
  const { selectedTrack, searchQuery, playedTracks } = useMusicStore();
  const { pendingPoints, players } = usePlayerStore();

  const nextRound = async () => {
    if (gameSettings.value?.playerExclusion && playedTracks.value.length > 0 && playedTracks.value.length % 3 === 0) {
      const activePlayers = Object.entries(players.value).filter(([, p]: [string, any]) => 
        p.role !== 'animator' && p.role !== 'projector' && !p.excluded
      );
      if (activePlayers.length > 1) {
        const minScore = Math.min(...activePlayers.map(([, p]: [string, any]) => p.score || 0));
        const worstPlayers = activePlayers.filter(([, p]: [string, any]) => (p.score || 0) === minScore);
        if (worstPlayers.length > 0 && worstPlayers.length < activePlayers.length) {
          const toExclude = worstPlayers[Math.floor(Math.random() * worstPlayers.length)];
          try {
            await animatorService.setPlayerExclusion(gameId.value, toExclude[0], true);
          } catch (e) {
            console.warn("Could not exclude player", e);
          }
        }
      }
    }

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
    if (await showConfirm({ title: t('dialogs.stop_game.title'), message: t('dialogs.stop_game.message'), confirmText: t('dialogs.stop_game.confirm'), confirmVariant: "danger" })) {
      status.value = 'finished';
      try { await musicManager.stop(); } catch { console.warn("Could not stop music"); }
      await animatorService.updateGameState(gameId.value, 'finished');
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
    await localBackendService.saveGameData({ playedTracks: [] });
  };

  return {
    nextRound,
    endGame,
    restartGame
  };
}
