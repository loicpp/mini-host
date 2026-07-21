import { MusicProvider, Track } from './MusicProvider';

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

  async play(trackId: string, delayMs: number = 0): Promise<void> {
    if (!this.audio) throw new Error("Audio player not initialized");
    
    // Convert absolute path to our local stream URL if it's not already a URL
    if (trackId.startsWith('http')) {
      this.audio.src = trackId;
    } else {
      this.audio.src = `http://127.0.0.1:5000/api/stream?path=${encodeURIComponent(trackId)}`;
    }
    
    if (this.playTimeout) {
      clearTimeout(this.playTimeout);
      this.playTimeout = null;
    }
    
    if (delayMs > 0) {
      this.playTimeout = setTimeout(() => {
        if (this.audio) this.audio.play();
        this.playTimeout = null;
      }, delayMs);
    } else {
      this.audio.play();
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
