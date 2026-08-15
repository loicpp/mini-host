import { MusicProvider, Track } from './MusicProvider';

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export class LocalAdapter implements MusicProvider {
  readonly name = 'local';
  private audio: HTMLAudioElement | null = null;
  private playTimeout: any = null;

  async init(): Promise<void> {
    if (!this.audio) {
      this.audio = new Audio();
    }
  }

  async search(_query: string): Promise<Track[]> {
    return Promise.resolve([]); // Le mode de recherche natif est désactivé au profit des dialogs système.
  }

  async preload(trackId: string): Promise<void> {
    if (!this.audio) return;
    const url = trackId.startsWith('http') ? trackId : `${BASE_URL}/stream?path=${encodeURIComponent(trackId)}`;
    if (this.audio.src === url) return;
    
    this.audio.src = url;
    this.audio.load();
  }

  async play(trackId: string, delayMs: number = 0): Promise<void> {
    if (!this.audio) throw new Error("Audio player not initialized");
    
    const url = trackId.startsWith('http') ? trackId : `${BASE_URL}/stream?path=${encodeURIComponent(trackId)}`;
    if (this.audio.src !== url) {
      this.audio.src = url;
      this.audio.load();
    } else {
      this.audio.currentTime = 0;
    }
    
    if (this.playTimeout) {
      clearTimeout(this.playTimeout);
      this.playTimeout = null;
    }
    
    if (delayMs > 0) {
      this.playTimeout = setTimeout(() => {
        if (this.audio) {
          this.audio.currentTime = 0;
          this.audio.play().catch(() => {});
        }
        this.playTimeout = null;
      }, delayMs);
    } else {
      this.audio.play().catch(() => {});
    }
  }

  async activate(): Promise<void> {
    if (this.audio) {
      this.audio.play().then(() => this.audio?.pause()).catch(() => {});
    }
  }

  async resume(): Promise<void> {
    if (this.audio) {
      this.audio.play();
    }
  }

  async pause(): Promise<void> {
    if (this.playTimeout) {
      clearTimeout(this.playTimeout);
      this.playTimeout = null;
    }
    if (this.audio) {
      this.audio.pause();
    }
  }

  async stop(): Promise<void> {
    if (this.playTimeout) {
      clearTimeout(this.playTimeout);
      this.playTimeout = null;
    }
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }
}
