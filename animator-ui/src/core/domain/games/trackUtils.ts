import { Track } from '../../../services/music/MusicProvider';

export const sanitizeTracks = (tracks: any[]): Track[] => {
  return tracks.map(t => {
    if (t.id && t.source) return t;
    
    let source = 'soundcloud';
    if (t.url && (t.url.includes('youtube') || t.url.includes('youtu.be'))) source = 'youtube';
    
    let id = t.id;
    if (source === 'youtube' && t.url) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = t.url.match(regExp);
      if (match && match[2].length === 11) {
        id = match[2];
      }
    }
    
    return {
      ...t,
      id: id || t.url || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 10)),
      source: t.source || source
    };
  });
};
