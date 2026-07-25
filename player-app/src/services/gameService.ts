import { db, auth } from '../firebase';
import { ref, set, onValue, runTransaction } from "firebase/database";

export const gameService = {

  // Get current user ID if already signed in
  getCurrentUserId() {
    return auth.currentUser ? auth.currentUser.uid : null;
  },

  // Join a game using gameId and the secret passcode
  async joinGame(gameId: string, secret: string, playerName: string) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const playerRef = ref(db, `games/${gameId}/players/${user.uid}`);
    
    // The Firebase Security Rules will strictly verify that 'secret' matches the game's secret.
    // If it doesn't match, this 'set' operation will throw a Permission Denied error.
    await set(playerRef, {
      name: playerName,
      score: 0,
      secret: secret
    });
    
    return user.uid;
  },

  // Listen to game state
  listenToGame(gameId: string, callback: (game: any) => void) {
    const gameRef = ref(db, `games/${gameId}`);
    return onValue(gameRef, (snapshot) => {
      callback(snapshot.val());
    });
  },

  // Submit a guess
  async submitGuess(gameId: string, title: string, artist: string) {
    const user = auth.currentUser;
    if (!user) return;

    const guessRef = ref(db, `games/${gameId}/players/${user.uid}/currentGuess`);
    await set(guessRef, {
      title,
      artist,
      submittedAt: Date.now()
    });
  },

  // Atomically claim the buzzer
  async buzz(gameId: string) {
    const user = auth.currentUser;
    if (!user) return false;

    const buzzerRef = ref(db, `games/${gameId}/pressedBuzzer`);
    try {
      await set(buzzerRef, user.uid);
      return true; // Si la promesse se résout, c'est que la règle !data.exists() a été respectée (on est le premier)
    } catch (error) {
      return false; // Si une erreur est levée (Permission denied), quelqu'un a été plus rapide
    }
  }
};
