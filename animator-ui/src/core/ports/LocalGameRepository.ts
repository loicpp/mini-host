import { Track } from '../../services/music/MusicProvider';

export interface LocalGameData {
  localTracks: Track[];
  playedTracks: string[];
  sort?: string;
  hidePlayedTracks?: boolean;
  corrupted?: boolean;
  error?: string;
}

export interface LocalGameRepository {
  saveGameData(data: Partial<LocalGameData>): Promise<void>;
  loadGame(): Promise<LocalGameData | null>;
  saveConfig(config: { lastGameId?: string }): Promise<void>;
  closeProjector(): Promise<void>;
}
