import { GameRepository } from '../core/ports/GameRepository';
import { FirebaseGameRepository } from '../infrastructure/FirebaseGameRepository';
import { GameSettings, TrackInfo, GameStatus, Players } from '../core/domain/models/Game';

// Injection de dépendance basique pour ce service
const gameRepo: GameRepository = new FirebaseGameRepository();

export const animatorService = {

  async createGame(gameType: string, settings: GameSettings = {}) {
    return gameRepo.createGame(gameType, settings);
  },

  async getGame(gameId: string) {
    return gameRepo.getGame(gameId);
  },

  async updateGameState(gameId: string, status: GameStatus, trackInfo: TrackInfo | null = null) {
    return gameRepo.updateGameState(gameId, status, trackInfo);
  },

  async updateGameSettings(gameId: string, settings: GameSettings) {
    return gameRepo.updateGameSettings(gameId, settings);
  },

  listenToPlayers(gameId: string, callback: (players: Players) => void) {
    return gameRepo.listenToPlayers(gameId, callback);
  },

  listenToPressedBuzzer(gameId: string, callback: (buzzer: string | null) => void) {
    return gameRepo.listenToPressedBuzzer(gameId, callback);
  },

  async clearPlayerGuess(gameId: string, playerId: string) {
    return gameRepo.clearPlayerGuess(gameId, playerId);
  },

  async clearPressedBuzzer(gameId: string) {
    return gameRepo.clearPressedBuzzer(gameId);
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
  },

  async updateRanks(gameId: string, lastAwardedPoints?: Record<string, number>) {
    return gameRepo.updateRanks(gameId, lastAwardedPoints);
  }
};
