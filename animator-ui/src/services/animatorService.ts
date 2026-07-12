import { db, auth } from '../firebase';
import { ref, set, get, onValue, update, remove } from "firebase/database";
import { signInWithEmailAndPassword } from "firebase/auth";

export const animatorService = {
  // Login with email and password
  async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error signing in animator:", error);
      throw error;
    }
  },

  // Create a new game room
  async createGame() {
    const gameId = Math.random().toString(36).substring(2, 6).toUpperCase();
    const secret = Math.random().toString(36).substring(2, 10); // Generate a random secret
    
    const gameRef = ref(db, `games/${gameId}`);
    await set(gameRef, {
      status: 'waiting',
      createdAt: Date.now(),
      secret: secret,
      players: {}
    });
    
    return { gameId, secret };
  },

  // Get game details
  async getGame(gameId: string) {
    const gameRef = ref(db, `games/${gameId}`);
    const snapshot = await get(gameRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  },

  // Update game state
  async updateGameState(gameId: string, status: string, trackInfo: any = null) {
    const updates: any = { status };
    if (trackInfo) {
      updates.currentTrack = trackInfo;
    }
    
    const gameRef = ref(db, `games/${gameId}`);
    await update(gameRef, updates);
  },

  // Listen to players joining and their answers
  listenToPlayers(gameId: string, callback: (players: any) => void) {
    const playersRef = ref(db, `games/${gameId}/players`);
    return onValue(playersRef, (snapshot) => {
      callback(snapshot.val() || {});
    });
  },

  // Award points to a player
  async awardPoints(gameId: string, playerId: string, points: number) {
    const playerRef = ref(db, `games/${gameId}/players/${playerId}`);
    const snapshot = await get(playerRef);
    if (snapshot.exists()) {
      const currentScore = snapshot.val().score || 0;
      await update(playerRef, { score: currentScore + points });
    }
  },

  // Delete a game permanently
  async deleteGame(gameId: string) {
    const gameRef = ref(db, `games/${gameId}`);
    await remove(gameRef);
  },

  // Clear all players' current guesses
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
  },

  // Reset all players' scores and guesses
  async resetPlayers(gameId: string) {
    const playersRef = ref(db, `games/${gameId}/players`);
    const snapshot = await get(playersRef);
    if (snapshot.exists()) {
      const players = snapshot.val();
      const updates: any = {};
      Object.keys(players).forEach(playerId => {
        updates[`${playerId}/currentGuess`] = "";
        updates[`${playerId}/score`] = 0;
      });
      await update(playersRef, updates);
    }
  },

  // Remove a player from the game
  async removePlayer(gameId: string, playerId: string) {
    const playerRef = ref(db, `games/${gameId}/players/${playerId}`);
    await remove(playerRef);
  },

  // Cleanup old games
  async cleanupOldGames(excludeGameId: string) {
    const gamesRef = ref(db, 'games');
    const snapshot = await get(gamesRef);
    if (snapshot.exists()) {
      const games = snapshot.val();
      const now = Date.now();
      const updates: any = {};
      Object.keys(games).forEach(gameId => {
        if (gameId !== excludeGameId) {
          const game = games[gameId];
          if (game.createdAt && (now - game.createdAt > 24 * 60 * 60 * 1000)) {
            updates[gameId] = null; // Setting to null in an update removes the key
          }
        }
      });
      if (Object.keys(updates).length > 0) {
        await update(gamesRef, updates);
      }
    }
  }
};
