import { MusicProvider, Track } from './MusicProvider';

export class SoundCloudAdapter implements MusicProvider {
  readonly name = 'soundcloud';

  private widget: any = null;

  async init(): Promise<void> {
    return new Promise((resolve) => {
      let container = document.getElementById('soundcloud-player');
      let iframe: HTMLIFrameElement;
      
      if (!container) {
        container = document.createElement('div');
        container.id = 'soundcloud-player';
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.width = '200px';
        container.style.height = '200px';
        
        iframe = document.createElement('iframe');
        iframe.id = 'sc-iframe';
        iframe.width = '200';
        iframe.height = '200';
        iframe.allow = 'autoplay; encrypted-media';
        // Load a dummy track initially
        iframe.src = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/293&auto_play=false';
        container.appendChild(iframe);
        document.body.appendChild(container);
      } else {
        iframe = document.getElementById('sc-iframe') as HTMLIFrameElement;
      }

      if (!document.getElementById('sc-widget-api')) {
        const script = document.createElement('script');
        script.id = 'sc-widget-api';
        script.src = 'https://w.soundcloud.com/player/api.js';
        script.onload = () => {
          this.widget = (window as any).SC.Widget(iframe);
          this.widget.bind((window as any).SC.Widget.Events.READY, () => {
            resolve();
          });
        };
        document.head.appendChild(script);
      } else {
        if (!this.widget) {
           this.widget = (window as any).SC.Widget(iframe);
        }
        resolve();
      }
    });
  }

  async search(query: string): Promise<Track[]> {
    if (query.includes("soundcloud.com")) {
      return [{
        id: query,
        title: "Lien SoundCloud",
        artist: "Inconnu",
        duration: 30000,
        source: 'soundcloud'
      }];
    }
    throw new Error("Collez un lien SoundCloud complet.");
  }

  async activate(): Promise<void> {
    // No-op
  }

  async play(trackUrl: string, delayMs: number = 0): Promise<void> {
    if (!this.widget) {
      console.warn("SoundCloud widget not initialized. Call init() first.");
      return;
    }
    
    if (delayMs > 0) {
      // Load muted or not autoplaying
      this.widget.load(trackUrl, {
        auto_play: false,
        hide_related: true,
        show_comments: false,
        show_user: false,
        show_reposts: false,
        visual: false
      });
      setTimeout(() => {
        this.widget.play();
      }, delayMs);
    } else {
      // Play immediately synchronously
      this.widget.load(trackUrl, {
        auto_play: true,
        hide_related: true,
        show_comments: false,
        show_user: false,
        show_reposts: false,
        visual: false
      });
    }
  }

  async pause(): Promise<void> {
    if (this.widget) this.widget.pause();
  }

  async stop(): Promise<void> {
    if (this.widget) this.widget.pause();
  }
}
