import { MusicProvider, Track } from './MusicProvider';
import jsmediatags from 'jsmediatags';

export class LocalAdapter implements MusicProvider {
  readonly name = 'local';
  private audio: HTMLAudioElement | null = null;

  async init(): Promise<void> {
    if (!this.audio) {
      this.audio = new Audio();
    }
  }

  private readTags(file: File): Promise<{title: string, artist: string}> {
    return new Promise((resolve) => {
      jsmediatags.read(file, {
        onSuccess: (tag: any) => {
          resolve({
            title: tag.tags.title || file.name.replace(/\.[^/.]+$/, ""),
            artist: tag.tags.artist || "Artiste Inconnu"
          });
        },
        onError: () => {
          resolve({
            title: file.name.replace(/\.[^/.]+$/, ""),
            artist: "Artiste Inconnu"
          });
        }
      });
    });
  }

  async search(_query: string): Promise<Track[]> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.setAttribute('webkitdirectory', '');
      input.setAttribute('directory', '');
      input.setAttribute('multiple', '');
      
      input.onchange = async (e: any) => {
        const files = Array.from(e.target.files) as File[];
        const audioFiles = files.filter(f => 
          f.type.startsWith('audio/') || 
          f.name.toLowerCase().endsWith('.mp3') || 
          f.name.toLowerCase().endsWith('.wav') || 
          f.name.toLowerCase().endsWith('.ogg')
        );
        
        if (audioFiles.length === 0) {
          reject(new Error("Aucun fichier audio trouvé dans ce dossier"));
          return;
        }
        
        const promises = audioFiles.map(async (file) => {
          const url = URL.createObjectURL(file);
          const tags = await this.readTags(file);
          
          return {
            id: url,
            title: tags.title,
            artist: tags.artist,
            duration: 30000,
            source: 'local' as const
          };
        });
        
        const resolvedTracks = await Promise.all(promises);
        
        resolvedTracks.sort((a, b) => {
          const nameA = `${a.title} - ${a.artist}`.toLowerCase();
          const nameB = `${b.title} - ${b.artist}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });
        
        resolve(resolvedTracks);
      };
      
      input.oncancel = () => {
        reject(new Error("Sélection annulée"));
      };
      
      input.click();
    });
  }

  async play(trackId: string, delayMs: number = 0): Promise<void> {
    if (!this.audio) throw new Error("Audio player not initialized");
    this.audio.src = trackId;
    
    if (delayMs > 0) {
      setTimeout(() => {
        if (this.audio) this.audio.play();
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

  async pause(): Promise<void> {
    if (this.audio) {
      this.audio.pause();
    }
  }

  async stop(): Promise<void> {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }
}
