import { db } from '../firebase';
import { ref, set, get, onValue, update, remove } from "firebase/database";
import { GameRepository } from '../core/ports/GameRepository';

export class FirebaseGameRepository implements GameRepository {
  async createGame(gameType: string, settings: any = {}) {
    const gameId = Math.random().toString(36).substring(2, 6).toUpperCase();
    const secret = Math.random().toString(36).substring(2, 10);
    
    const gameRef = ref(db, `games/${gameId}`);
    await set(gameRef, {
      status: 'waiting',
      secret: secret,
      gameType: gameType,
      settings: settings,
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
    const updates: any = { status };
    if (trackInfo) {
      updates.currentTrack = trackInfo;
    }
    const gameRef = ref(db, `games/${gameId}`);
    await update(gameRef, updates);
  }

  listenToPlayers(gameId: string, callback: (players: any) => void) {
    const playersRef = ref(db, `games/${gameId}/players`);
    return onValue(playersRef, (snapshot) => {
      callback(snapshot.val() || {});
    });
  }

  listenToBuzzer(gameId: string, callback: (buzzer: any) => void) {
    const buzzerRef = ref(db, `games/${gameId}/currentBuzzer`);
    return onValue(buzzerRef, (snapshot) => {
      callback(snapshot.val() || null);
    });
  }

  async clearPlayerGuess(gameId: string, playerId: string) {
    const guessRef = ref(db, `games/${gameId}/players/${playerId}/currentGuess`);
    await remove(guessRef);
  }

  async clearCurrentBuzzer(gameId: string) {
    const buzzerRef = ref(db, `games/${gameId}/currentBuzzer`);
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
}
