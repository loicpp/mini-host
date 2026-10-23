import { LocalGameRepository, LocalGameData } from '../core/ports/LocalGameRepository';


const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export type { LocalGameData };

export interface HistoryPlayer {
  position: number;
  name: string;
  score: number;
}

export interface GameHistoryEntry {
  id: string;
  endedAt: string;
  players: HistoryPlayer[];
}

export const localBackendService: LocalGameRepository & {
  saveHistoryEntry: (entry: GameHistoryEntry) => Promise<boolean>;
  loadHistory: () => Promise<GameHistoryEntry[]>;
} = {
  async saveGameData(data: Partial<LocalGameData>) {
    try {
      await fetch(`${BASE_URL}/game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (e) {
      console.warn("Could not save game to local backend", e);
    }
  },

  async loadGame() {
    try {
      const res = await fetch(`${BASE_URL}/game`);
      return await res.json();
    } catch (e) {
      console.warn("Could not load game from local backend", e);
      return null;
    }
  },

  async saveConfig(config: { lastGameId?: string }) {
    try {
      await fetch(`${BASE_URL}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
    } catch (e) {
      console.warn("Could not save config to local backend", e);
    }
  },

  async closeProjector() {
    try {
      await fetch(`${BASE_URL}/projector/close`, { method: 'POST' });
    } catch (e) {
      console.warn("Could not close projector via local backend", e);
    }
  },

  async saveHistoryEntry(entry: GameHistoryEntry): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      return res.ok;
    } catch (e) {
      console.warn("Could not save history to local backend", e);
      return false;
    }
  },

  async loadHistory(): Promise<GameHistoryEntry[]> {
    try {
      const res = await fetch(`${BASE_URL}/history`);
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.warn("Could not load history from local backend", e);
      return [];
    }
  }
};
