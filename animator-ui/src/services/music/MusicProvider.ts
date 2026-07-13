export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number; // in milliseconds
  source: 'local' | 'soundcloud';
}

export interface MusicProvider {
  /**
   * Identifies the provider name
   */
  readonly name: string;

  /**
   * Initializes the provider (load SDKs, authenticate, etc.)
   */
  init(): Promise<void>;

  /**
   * Activates the audio context synchronously on user interaction
   */
  activate?(): Promise<void>;

  /**
   * Searches for a track
   */
  search(query: string): Promise<Track[]>;

  /**
   * Plays a track by its ID
   */
  play(trackId: string, delayMs?: number): Promise<void>;

  /**
   * Resumes the paused track
   */
  resume(): Promise<void>;

  /**
   * Pauses the current track
   */
  pause(): Promise<void>;

  /**
   * Stops the current track entirely
   */
  stop(): Promise<void>;
}
