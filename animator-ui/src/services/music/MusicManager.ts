import { MusicProvider, Track } from './MusicProvider';
import { LocalAdapter } from './LocalAdapter';
import { SoundCloudAdapter } from './SoundCloudAdapter';

class MusicManager {
  private currentProvider: MusicProvider | null = null;
  private providers: Record<string, MusicProvider> = {
    'local': new LocalAdapter(),
    'soundcloud': new SoundCloudAdapter()
  };

  async setProvider(name: string): Promise<void> {
    const provider = this.providers[name];
    if (!provider) throw new Error(`Provider ${name} not found`);
    
    await provider.init();
    this.currentProvider = provider;
  }

  get activeProviderName(): string | null {
    return this.currentProvider ? this.currentProvider.name : null;
  }

  getProvider(name: string): MusicProvider | undefined {
    return this.providers[name];
  }

  async activate(): Promise<void> {
    if (this.currentProvider && this.currentProvider.activate) {
      await this.currentProvider.activate();
    }
  }

  async search(query: string): Promise<Track[]> {
    if (!this.currentProvider) throw new Error("No active music provider");
    return await this.currentProvider.search(query);
  }

  async preload(track: Track): Promise<void> {
    if (!this.currentProvider || this.currentProvider.name !== track.source) {
      await this.setProvider(track.source);
    }
    if (this.currentProvider!.preload) {
      await this.currentProvider!.preload(track.id);
    }
  }

  async play(track: Track, delayMs: number = 0): Promise<void> {
    if (!this.currentProvider || this.currentProvider.name !== track.source) {
      await this.setProvider(track.source);
    }
    await this.currentProvider!.play(track.id, delayMs);
  }

  async resume(): Promise<void> {
    if (this.currentProvider) {
      await this.currentProvider.resume();
    }
  }

  async pause(): Promise<void> {
    if (this.currentProvider) {
      await this.currentProvider.pause();
    }
  }

  async stop(): Promise<void> {
    if (this.currentProvider) {
      await this.currentProvider.stop();
    }
  }
}

export const musicManager = new MusicManager();
