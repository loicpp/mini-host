import { GameSettings, TrackInfo, GameStatus, GameData, Players } from '../domain/models/Game';

export interface GameRepository {
  createGame(gameType: string, settings?: GameSettings): Promise<{ gameId: string, secret: string }>;
  getGame(gameId: string): Promise<GameData | null>;
  updateGameState(gameId: string, status: GameStatus, trackInfo?: TrackInfo | null): Promise<void>;
  updateGameSettings(gameId: string, settings: GameSettings): Promise<void>;
  listenToPlayers(gameId: string, callback: (players: Players) => void): () => void;
  listenToPressedBuzzer(gameId: string, callback: (buzzer: string | null) => void): () => void;
  clearPlayerGuess(gameId: string, playerId: string): Promise<void>;
  clearPressedBuzzer(gameId: string): Promise<void>;
  awardPoints(gameId: string, playerId: string, points: number): Promise<void>;
  deleteGame(gameId: string): Promise<void>;
  clearPlayerAnswers(gameId: string): Promise<void>;
  decrementBlockedTurns(gameId: string): Promise<void>;
  resetPlayers(gameId: string): Promise<void>;
  removePlayer(gameId: string, playerId: string): Promise<void>;
  setPlayerBlock(gameId: string, playerId: string, turns: number): Promise<void>;
  setPlayerExclusion(gameId: string, playerId: string, excluded: boolean): Promise<void>;
  updateRanks(gameId: string, lastAwardedPoints?: Record<string, number>): Promise<void>;
}
