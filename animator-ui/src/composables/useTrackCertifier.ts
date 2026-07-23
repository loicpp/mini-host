import { itunesService } from '../services/itunesService';

export function useTrackCertifier() {
  const autoCertifyTrack = async (trackData: {title: string, artist: string, isCertified?: boolean}) => {
    console.log("Try to auto-certify track:", trackData);
    if (trackData.isCertified) return trackData;
    const rawTitle = trackData.title.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();
    const rawArtist = (trackData.artist || '').replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').replace(/Artiste Inconnu/i, '').trim();
    
    const query = `${rawTitle} ${rawArtist}`.trim();
    if (query.length < 3) return trackData;
    
    try {
      const results = await itunesService.search(query);
      if (results && results.length > 0) {
        const target = rawTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
        const targetArtist = rawArtist.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        for (const item of results.slice(0, 3)) {
          const found = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
          const foundArtist = (item.artist || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          
          const titleMatch = found.includes(target) || target.includes(found) || found === target;
          const artistMatch = targetArtist.length < 2 
                           || foundArtist.includes(targetArtist) 
                           || targetArtist.includes(foundArtist)
                           || target.includes(foundArtist);
          
          if (titleMatch && artistMatch) {
            trackData.title = item.title;
            trackData.artist = item.artist;
            trackData.isCertified = true;
            break; 
          }
        }
      }
    } catch (e) {
      console.error("Auto-certify error:", e);
    }
    return trackData;
  };

  return {
    autoCertifyTrack
  };
}
