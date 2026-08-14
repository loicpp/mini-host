import { db, auth } from '../firebase';
import { ref, set, get, onValue, update, remove } from "firebase/database";
import { GameRepository } from '../core/ports/GameRepository';

export class FirebaseGameRepository implements GameRepository {
  async createGame(gameType: string, settings: any = {}) {
    const user = auth.currentUser;
    const gameId = Math.random().toString(36).substring(2, 6).toUpperCase();
    const secret = Math.random().toString(36).substring(2, 10);
    
    const gameRef = ref(db, `games/${gameId}`);
    await set(gameRef, {
      secret: secret,
      ownerId: user ? user.uid : 'unknown',
      data: {
        status: 'waiting',
        settings: {
          ...settings,
          gameType: gameType
        }
      },
      players: {}
    });
    
    return { gameId, secret };
  }

  async getGame(gameId: string) {
    const gameRef = ref(db, `games/${gameId}`);
    const snapshot = await get(gameRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  }

  async updateGameState(gameId: string, status: string, trackInfo: any = null) {
    const updates: any = { 'data/status': status };
    if (trackInfo) {
      if (trackInfo.startTime) updates['data/startTime'] = trackInfo.startTime;
      if (trackInfo.answer) updates['answer'] = trackInfo.answer;
    }
    const gameRef = ref(db, `games/${gameId}`);
    await update(gameRef, updates);
  }

  async updateGameSettings(gameId: string, settings: any) {
    const gameRef = ref(db, `games/${gameId}`);
    await update(gameRef, { 'data/settings': settings });
  }

  listenToPlayers(gameId: string, callback: (players: any) => void) {
    const playersRef = ref(db, `games/${gameId}/players`);
    return onValue(playersRef, (snapshot) => {
      callback(snapshot.val() || {});
    });
  }

  listenToPressedBuzzer(gameId: string, callback: (buzzer: any) => void) {
    const buzzerRef = ref(db, `games/${gameId}/pressedBuzzer`);
    return onValue(buzzerRef, (snapshot) => {
      callback(snapshot.val() || null);
    });
  }

  async clearPlayerGuess(gameId: string, playerId: string) {
    const guessRef = ref(db, `games/${gameId}/players/${playerId}/currentGuess`);
    await remove(guessRef);
  }

  async clearPressedBuzzer(gameId: string) {
    const buzzerRef = ref(db, `games/${gameId}/pressedBuzzer`);
    await remove(buzzerRef);
  }

  async awardPoints(gameId: string, playerId: string, points: number) {
    const playerRef = ref(db, `games/${gameId}/players/${playerId}`);
    const snapshot = await get(playerRef);
    if (snapshot.exists()) {
      const currentScore = snapshot.val().score || 0;
      await update(playerRef, { score: currentScore + points });
    }
  }

  async deleteGame(gameId: string) {
    const gameRef = ref(db, `games/${gameId}`);
    await remove(gameRef);
  }

  async clearPlayerAnswers(gameId: string) {
    const playersRef = ref(db, `games/${gameId}/players`);
    const snapshot = await get(playersRef);
    if (snapshot.exists()) {
      const players = snapshot.val();
      const updates: any = {};
      Object.keys(players).forEach(playerId => {
        updates[`${playerId}/currentGuess`] = "";
      });
      await update(playersRef, updates);
    }
  }

  async decrementBlockedTurns(gameId: string) {
    const playersRef = ref(db, `games/${gameId}/players`);
    const snapshot = await get(playersRef);
    if (snapshot.exists()) {
      const players = snapshot.val();
      const updates: any = {};
      Object.keys(players).forEach(playerId => {
        const blockedTurns = players[playerId].blockedTurns;
        if (blockedTurns && blockedTurns > 0) {
          updates[`${playerId}/blockedTurns`] = blockedTurns - 1;
        }
      });
      if (Object.keys(updates).length > 0) {
        await update(playersRef, updates);
      }
    }
  }

  async resetPlayers(gameId: string) {
    const playersRef = ref(db, `games/${gameId}/players`);
    const snapshot = await get(playersRef);
    if (snapshot.exists()) {
      const players = snapshot.val();
      const updates: any = {};
      Object.keys(players).forEach(playerId => {
        updates[`${playerId}/currentGuess`] = "";
        updates[`${playerId}/score`] = 0;
        updates[`${playerId}/blockedTurns`] = 0;
      });
      await update(playersRef, updates);
    }
  }

  async removePlayer(gameId: string, playerId: string) {
    const playerRef = ref(db, `games/${gameId}/players/${playerId}`);
    await remove(playerRef);
  }

  async setPlayerBlock(gameId: string, playerId: string, turns: number) {
    const playerRef = ref(db, `games/${gameId}/players/${playerId}`);
    await update(playerRef, { blockedTurns: turns });
  }

  async updateRanks(gameId: string, lastAwardedPoints?: Record<string, number>) {
    const playersRef = ref(db, `games/${gameId}/players`);
    const snapshot = await get(playersRef);
    if (snapshot.exists()) {
      const players = snapshot.val();
      const playersList = Object.keys(players)
        .filter(id => players[id].role !== 'animator' && players[id].role !== 'projector')
        .map(id => ({ id, ...players[id] }));
      
      const previousPlayersList = [...playersList];
      previousPlayersList.sort((a, b) => {
        const prevScoreA = (a.score || 0) - (lastAwardedPoints?.[a.id] || 0);
        const prevScoreB = (b.score || 0) - (lastAwardedPoints?.[b.id] || 0);
        const scoreDiff = prevScoreB - prevScoreA;
        if (scoreDiff !== 0) return scoreDiff;
        return (a.name || '').localeCompare(b.name || '');
      });
      const previousRanks = new Map(previousPlayersList.map((p, i) => [p.id, i + 1]));

      playersList.sort((a, b) => {
        const scoreDiff = (b.score || 0) - (a.score || 0);
        if (scoreDiff !== 0) return scoreDiff;
        return (a.name || '').localeCompare(b.name || '');
      });
      
      const updates: any = {};
      playersList.forEach((p, index) => {
        const newRank = index + 1;
        const oldRank = p.rank || previousRanks.get(p.id) || newRank;
        
        if (p.rank !== newRank) {
          updates[`${p.id}/rank`] = newRank;
        }
        
        const rankChange = oldRank - newRank;
        updates[`${p.id}/rankChange`] = rankChange;
      });
      
      if (Object.keys(updates).length > 0) {
        await update(playersRef, updates);
      }
    }
  }
}
