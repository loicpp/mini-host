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
  }
};
