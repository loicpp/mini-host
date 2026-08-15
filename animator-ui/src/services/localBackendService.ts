import { Track } from './music/MusicProvider';

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export const localBackendService = {
  async saveGame(localTracks: Track[], playedTracks: string[] = []) {
    try {
      await fetch(`${BASE_URL}/game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localTracks, playedTracks })
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
  }
};
