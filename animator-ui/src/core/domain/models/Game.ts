export interface PlayerGuess {
  title?: string;
  artist?: string;
  [key: string]: any;
}

export interface Player {
  name?: string;
  role?: string;
  currentGuess?: PlayerGuess | string | null;
  score?: number;
  blockedTurns?: number;
  rank?: number;
  rankChange?: number;
  [key: string]: any;
}

export type Players = Record<string, Player>;

export interface GameSettings {
  gameType?: string;
  blockDuration?: number;
  musicDuration?: number;
  duration?: number;
  mode?: string;
  allowSuggestions?: boolean;
  penaltyOnWrongAnswer?: boolean;
  preset?: string;
  playlist?: any;
  [key: string]: any;
}

export interface TrackInfo {
  startTime?: number;
  answer?: string;
  [key: string]: any;
}

export type GameStatus = 'waiting' | 'playing' | 'results' | 'finished' | 'reviewing' | string;

export interface GameStateData {
  status: GameStatus;
  settings?: GameSettings;
  startTime?: number;
  gameType?: string;
  [key: string]: any;
}

export interface GameData {
  secret?: string;
  ownerId?: string;
  data?: GameStateData;
  players?: Players;
  answer?: string;
  pressedBuzzer?: string | null;
  [key: string]: any;
}
