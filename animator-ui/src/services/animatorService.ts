import { auth } from '../firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import { GameRepository } from '../core/ports/GameRepository';
import { FirebaseGameRepository } from '../infrastructure/FirebaseGameRepository';

// Injection de dépendance basique pour ce service
const gameRepo: GameRepository = new FirebaseGameRepository();

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

  async createGame(settings: any = {}) {
    return gameRepo.createGame(settings);
  },

  async getGame(gameId: string) {
    return gameRepo.getGame(gameId);
  },

  async updateGameState(gameId: string, status: string, trackInfo: any = null) {
    return gameRepo.updateGameState(gameId, status, trackInfo);
  },

  listenToPlayers(gameId: string, callback: (players: any) => void) {
    return gameRepo.listenToPlayers(gameId, callback);
  },

  listenToBuzzer(gameId: string, callback: (buzzer: any) => void) {
    return gameRepo.listenToBuzzer(gameId, callback);
  },

  async clearPlayerGuess(gameId: string, playerId: string) {
    return gameRepo.clearPlayerGuess(gameId, playerId);
  },

  async clearCurrentBuzzer(gameId: string) {
    return gameRepo.clearCurrentBuzzer(gameId);
  },

  async awardPoints(gameId: string, playerId: string, points: number) {
    return gameRepo.awardPoints(gameId, playerId, points);
  },

  async deleteGame(gameId: string) {
    return gameRepo.deleteGame(gameId);
  },

  async clearPlayerAnswers(gameId: string) {
    return gameRepo.clearPlayerAnswers(gameId);
  },

  async decrementBlockedTurns(gameId: string) {
    return gameRepo.decrementBlockedTurns(gameId);
  },

  async resetPlayers(gameId: string) {
    return gameRepo.resetPlayers(gameId);
  },

  async removePlayer(gameId: string, playerId: string) {
    return gameRepo.removePlayer(gameId, playerId);
  },

  async setPlayerBlock(gameId: string, playerId: string, turns: number) {
    return gameRepo.setPlayerBlock(gameId, playerId, turns);
  }
};
