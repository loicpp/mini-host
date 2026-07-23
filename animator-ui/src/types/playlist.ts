export interface Track {
  id?: string;
  source?: string;
  title: string;
  artist: string;
  url: string;
  isCertified?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  type?: 'soundcloud' | 'local';
  tracks: Track[];
}
