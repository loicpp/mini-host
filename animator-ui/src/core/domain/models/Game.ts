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
  excluded?: boolean;
  [key: string]: any;
}

export type Players = Record<string, Player>;

export const INFINITE_DURATION = 105;
export const TIME_STEP_VALUES = [1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105];

export function isInfiniteDuration(val?: number | null): boolean {
  return val !== undefined && val !== null && (val >= 105 || val === 0);
}

export interface GameSettings {
  gameType?: string;
  blockDuration?: number;
  musicDuration?: number;
  duration?: number;
  mode?: string;
  allowSuggestions?: boolean;
  penaltyOnWrongAnswer?: boolean;
  blockPlayerOnWrongAnswer?: boolean;
  playerExclusion?: boolean;
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
