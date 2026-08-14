import { computed } from 'vue';
import { gameId, players, pressedBuzzer, gameSettings, pendingPoints, nextTrackInfo, lastAwardedPoints, status, autoCorrectResults, wasAutoCorrected } from './state';
import { animatorService } from '../services/animatorService';
import { useDialog } from './useDialog';
import { useI18n } from 'vue-i18n';
import Fuse from 'fuse.js';

export function useGamePlayers() {
  const { t } = useI18n();
  const { showConfirm } = useDialog();

  const displayedPlayers = computed(() => {
    const result: Record<string, any> = {};
    for (const id in players.value) {
      const p = players.value[id];
      if (p.role === 'animator' || p.role === 'projector') continue;
      
      let guess = p.currentGuess;
      
      if (gameSettings.value.mode === 'buzzer' && pressedBuzzer.value && pressedBuzzer.value === id) {
        guess = {
          title: 'BUZZ',
          artist: 'Appuyé !'
        };
      }
      
      result[id] = {
        ...p,
        currentGuess: guess,
        hasAnswered: !!guess && (!!guess.title || !!guess.artist || (typeof guess === 'string' && guess.length > 0)),
        score: (p.score || 0) + (pendingPoints.value[id] || 0),
        pendingPoints: pendingPoints.value[id] || 0,
        autoCorrectResult: autoCorrectResults.value[id]
      };
    }
    return result;
  });

  const sortedPlayersList = computed(() => {
    return Object.keys(displayedPlayers.value)
      .map(id => ({ id, ...displayedPlayers.value[id] }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  });

  const playersRoundResults = computed(() => {
    const rawPlayers = [];
    for (const id in players.value) {
      const p = players.value[id];
      if (p.role === 'animator' || p.role === 'projector') continue;
      
      const pointsGained = lastAwardedPoints.value[id] || 0;
      const currentScore = p.score || 0;
      const previousScore = currentScore - pointsGained;
      
      rawPlayers.push({
        id,
        name: p.name || '',
        score: currentScore,
        previousScore,
        pointsGained
      });
    }

    // Sort to find current ranks (and this will be the display order)
    const sortedByCurrent = [...rawPlayers].sort((a, b) => {
      const scoreDiff = b.score - a.score;
      if (scoreDiff !== 0) return scoreDiff;
      return a.name.localeCompare(b.name);
    });

    return sortedByCurrent.map((p, index) => {
      const currentRank = index + 1;
      const rankChange = players.value[p.id]?.rankChange || 0; // positive = went up, negative = went down

      return {
        ...p,
        currentRank,
        rankChange
      };
    });
  });

  const playersWhoWonPoints = computed(() => {
    const result = [];
    for (const [id, points] of Object.entries(lastAwardedPoints.value)) {
      if (points > 0 && players.value[id]) {
        result.push({
          id,
          name: players.value[id].name,
          score: players.value[id].score,
          pointsGained: points
        });
      }
    }
    return result.sort((a, b) => b.pointsGained - a.pointsGained);
  });

  const hasBuzzed = computed(() => {
    if (gameSettings.value.mode !== 'buzzer') return false;
    return !!pressedBuzzer.value;
  });

  const award = (playerId: string, points: number) => {
    if (points === 0) {
      const newPending = { ...pendingPoints.value };
      delete newPending[playerId];
      pendingPoints.value = newPending;
    } else {
      pendingPoints.value = {
        ...pendingPoints.value,
        [playerId]: points
      };
    }
  };

  const applyPendingPoints = async () => {
    lastAwardedPoints.value = { ...pendingPoints.value };
    for (const [playerId, points] of Object.entries(pendingPoints.value)) {
      if (points !== 0) {
        await animatorService.awardPoints(gameId.value, playerId, points);
      }
    }
    pendingPoints.value = {};
    autoCorrectResults.value = {};
    wasAutoCorrected.value = false;
    await animatorService.updateRanks(gameId.value, lastAwardedPoints.value);
  };

  const revealResults = async () => {
    if (gameSettings.value.mode === 'text' && status.value === 'reviewing') {
      let hasAnswers = false;
      let hasPointsAwarded = false;
      
      for (const id in displayedPlayers.value) {
        if (displayedPlayers.value[id].hasAnswered) {
          hasAnswers = true;
        }
        if (displayedPlayers.value[id].pendingPoints !== 0) {
          hasPointsAwarded = true;
        }
      }
      
      if (hasAnswers && !hasPointsAwarded && !wasAutoCorrected.value) {
        const confirmed = await showConfirm({
          title: t('control_panel.reveal_no_points_title', 'Aucun point attribué'),
          message: t('control_panel.reveal_no_points_message', 'Des joueurs ont répondu mais aucun point n\'a été attribué. Voulez-vous vraiment révéler les résultats ?'),
          confirmText: t('control_panel.reveal_no_points_confirm', 'Oui, révéler'),
          confirmVariant: 'primary'
        });
        if (!confirmed) return;
      }
    }

    status.value = 'results';
    await applyPendingPoints();
    await animatorService.clearPressedBuzzer(gameId.value);
    await animatorService.updateGameState(gameId.value, 'results');
    await animatorService.decrementBlockedTurns(gameId.value);
  };

  const autoCorrect = () => {
    wasAutoCorrected.value = true;
    if (!nextTrackInfo.value.answer) return;
    
    const target = nextTrackInfo.value.answer;
    const fuseTarget = new Fuse([target], {
      includeScore: true,
      threshold: 0.3,
      ignoreLocation: true
    });
    
    for (const id in players.value) {
      const guess = players.value[id]?.currentGuess;
      if (guess && guess.title) {
        const queries = [guess.title];
        if (guess.artist) {
          queries.push(`${guess.title} - ${guess.artist}`);
          queries.push(`${guess.artist} - ${guess.title}`);
        }
        
        let isCorrect = false;
        
        // Forward check: search each query against the target
        for (const q of queries) {
          if (fuseTarget.search(q).length > 0) {
            isCorrect = true;
            break;
          }
        }
        
        // Reverse check: search the target against the guess combinations
        if (!isCorrect) {
          const fuseGuess = new Fuse(queries, {
            includeScore: true,
            threshold: 0.2,
            ignoreLocation: true
          });
          if (fuseGuess.search(target).length > 0) {
            isCorrect = true;
          }
        }
        
        autoCorrectResults.value[id] = isCorrect;
        
        if (isCorrect && !pendingPoints.value[id]) {
          award(id, 1);
        } else if (!isCorrect && gameSettings.value?.penaltyOnWrongAnswer && !pendingPoints.value[id]) {
          award(id, -1);
        }
      }
    }
  };

  const correctBuzzer = async () => {
    let playerIdToReward = null;
    if (gameSettings.value.mode === 'buzzer' && pressedBuzzer.value) {
      playerIdToReward = pressedBuzzer.value;
    }
    
    if (playerIdToReward) {
      award(playerIdToReward, 1);
    }
    
    await revealResults();
  };

  const removePlayer = async (playerId: string) => {
    if (await showConfirm({ title: t('dialogs.kick_player.title'), message: t('dialogs.kick_player.message'), confirmText: t('dialogs.kick_player.confirm'), confirmVariant: "danger" })) {
      try {
        await animatorService.removePlayer(gameId.value, playerId);
      } catch(e) {
        console.error("Impossible de supprimer le joueur:", e);
      }
    }
  };
  
  const setPlayerBlock = async (playerId: string, turns: number) => {
    try {
      await animatorService.setPlayerBlock(gameId.value, playerId, turns);
    } catch(e) {
      console.error("Impossible de modifier le blocage du joueur:", e);
    }
  };

  const addPointsManually = async (playerId: string, points: number) => {
    try {
      const currentPlayer = players.value[playerId];
      if (!currentPlayer) return;

      const currentScore = currentPlayer.score || 0;
      let finalPoints = points;

      if (currentScore + points < 0) {
        finalPoints = -currentScore;
      }

      if (finalPoints === 0) return;

      await animatorService.awardPoints(gameId.value, playerId, finalPoints);
      await animatorService.updateRanks(gameId.value, { [playerId]: finalPoints });
    } catch(e) {
      console.error("Impossible d'ajuster les points manuellement:", e);
    }
  };

  return {
    displayedPlayers,
    sortedPlayersList,
    playersRoundResults,
    playersWhoWonPoints,
    hasBuzzed,
    award,
    applyPendingPoints,
    revealResults,
    autoCorrect,
    correctBuzzer,
    removePlayer,
    setPlayerBlock,
    addPointsManually
  };
}
