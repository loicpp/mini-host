import { MusicProvider, Track } from './MusicProvider';

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export class LocalAdapter implements MusicProvider {
  readonly name = 'local';
  private audio: HTMLAudioElement | null = null;
  private playTimeout: any = null;
  private endedCallback: (() => void) | null = null;

  async init(): Promise<void> {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.addEventListener('ended', () => {
        if (this.endedCallback) this.endedCallback();
      });
    }
  }

  onEnded(callback: () => void): void {
    this.endedCallback = callback;
  }

  async getDuration(): Promise<number> {
    if (this.audio && !isNaN(this.audio.duration) && isFinite(this.audio.duration) && this.audio.duration > 0) {
      return this.audio.duration * 1000;
    }
    return new Promise((resolve) => {
      if (!this.audio) return resolve(0);
      let timer: any = null;
      const onLoaded = () => {
        cleanup();
        resolve(this.audio && !isNaN(this.audio.duration) && isFinite(this.audio.duration) ? this.audio.duration * 1000 : 0);
      };
      const cleanup = () => {
        if (timer) clearTimeout(timer);
        this.audio?.removeEventListener('loadedmetadata', onLoaded);
        this.audio?.removeEventListener('durationchange', onLoaded);
        this.audio?.removeEventListener('canplay', onLoaded);
      };
      this.audio.addEventListener('loadedmetadata', onLoaded);
      this.audio.addEventListener('durationchange', onLoaded);
      this.audio.addEventListener('canplay', onLoaded);
      timer = setTimeout(() => {
        cleanup();
        resolve(this.audio && !isNaN(this.audio.duration) && isFinite(this.audio.duration) ? this.audio.duration * 1000 : 0);
      }, 1500);
    });
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
