import { computed } from 'vue';
import { gameId, players, pressedBuzzer, gameSettings, pendingPoints, nextTrackInfo, lastAwardedPoints, status } from './state';
import { animatorService } from '../services/animatorService';
import { useDialog } from './useDialog';
import { useI18n } from 'vue-i18n';

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
        hasAnswered: !!guess && (!!guess.title || !!guess.artist),
        score: (p.score || 0) + (pendingPoints.value[id] || 0),
        pendingPoints: pendingPoints.value[id] || 0
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

    // Sort to find previous ranks
    const sortedByPrevious = [...rawPlayers].sort((a, b) => {
      const scoreDiff = b.previousScore - a.previousScore;
      if (scoreDiff !== 0) return scoreDiff;
      return a.name.localeCompare(b.name);
    });
    const previousRanks = new Map(sortedByPrevious.map((p, index) => [p.id, index + 1]));

    // Sort to find current ranks (and this will be the display order)
    const sortedByCurrent = [...rawPlayers].sort((a, b) => {
      const scoreDiff = b.score - a.score;
      if (scoreDiff !== 0) return scoreDiff;
      return a.name.localeCompare(b.name);
    });

    return sortedByCurrent.map((p, index) => {
      const currentRank = index + 1;
      const prevRank = previousRanks.get(p.id) || currentRank;
      const rankChange = prevRank - currentRank; // positive = went up, negative = went down

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
    await animatorService.updateRanks(gameId.value);
  };

  const revealResults = async () => {
    status.value = 'results';
    await applyPendingPoints();
    await animatorService.clearPressedBuzzer(gameId.value);
    await animatorService.updateGameState(gameId.value, 'results');
    await animatorService.decrementBlockedTurns(gameId.value);
  };

  const autoCorrect = () => {
    if (!nextTrackInfo.value.answer) return;
    const target = nextTrackInfo.value.answer.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    for (const id in players.value) {
      const guess = players.value[id]?.currentGuess;
      if (guess && guess.title) {
        const gTitle = guess.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        const gArtist = (guess.artist || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        
        const guessFull1 = gTitle + gArtist;
        const guessFull2 = gArtist + gTitle;
        
        const hasTitle = gTitle.length > 2 && (target.includes(gTitle) || gTitle.includes(target));
        const hasArtist = gArtist.length > 2 && (target.includes(gArtist) || gArtist.includes(target));
        
        if (hasTitle && hasArtist) {
          if (!pendingPoints.value[id]) award(id, 1);
        } else if (guessFull1.length > 2 && (target.includes(guessFull1) || guessFull1.includes(target))) {
          if (!pendingPoints.value[id]) award(id, 1);
        } else if (guessFull2.length > 2 && (target.includes(guessFull2) || guessFull2.includes(target))) {
          if (!pendingPoints.value[id]) award(id, 1);
        } else if (hasTitle && target.length <= gTitle.length + 5) {
          if (!pendingPoints.value[id]) award(id, 1);
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
      await animatorService.updateRanks(gameId.value);
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
