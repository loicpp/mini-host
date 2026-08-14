export interface GameRepository {
  createGame(gameType: string, settings?: any): Promise<{ gameId: string, secret: string }>;
  getGame(gameId: string): Promise<any>;
  updateGameState(gameId: string, status: string, trackInfo?: any): Promise<void>;
  updateGameSettings(gameId: string, settings: any): Promise<void>;
  listenToPlayers(gameId: string, callback: (players: any) => void): () => void;
  listenToPressedBuzzer(gameId: string, callback: (buzzer: any) => void): () => void;
  clearPlayerGuess(gameId: string, playerId: string): Promise<void>;
  clearPressedBuzzer(gameId: string): Promise<void>;
  awardPoints(gameId: string, playerId: string, points: number): Promise<void>;
  deleteGame(gameId: string): Promise<void>;
  clearPlayerAnswers(gameId: string): Promise<void>;
  decrementBlockedTurns(gameId: string): Promise<void>;
  resetPlayers(gameId: string): Promise<void>;
  removePlayer(gameId: string, playerId: string): Promise<void>;
  setPlayerBlock(gameId: string, playerId: string, turns: number): Promise<void>;
  updateRanks(gameId: string, lastAwardedPoints?: Record<string, number>): Promise<void>;
}
