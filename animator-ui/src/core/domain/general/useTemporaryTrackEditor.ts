import { ref } from 'vue';
import type { Track as MusicTrack } from '../../../services/music/MusicProvider';
import type { Track as PlaylistTrack } from '../setup/types/playlist';
import { useMusicStore } from './stores/music';
import { useDialog } from './useDialog';
import { useTrackCertifier } from '../setup/playlists/useTrackCertifier';
import jsmediatags from 'jsmediatags';

const { localTracks, playedTracks } = useMusicStore();


export function useTemporaryTrackEditor(onTrackAdded: (track: MusicTrack) => void) {
  const { showAlert } = useDialog();
  const { autoCertifyTrack } = useTrackCertifier();
  
  const tempNewTrack = ref<PlaylistTrack>({ title: '', artist: '', url: '', isCertified: false });
  const tempDuplicateWarning = ref<string | null>(null);
  const forceAdd = ref(false);
  const pendingLocalPath = ref<string | null>(null);

  const syncGameSession = async () => {
    try {
      await fetch('http://127.0.0.1:5000/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          localTracks: localTracks.value, 
          playedTracks: playedTracks.value
        })
      });
    } catch (e) {
      console.warn("Could not sync game session", e);
    }
  };

  const getUrlSource = (url: string) => {
    if (url.includes("soundcloud.com")) return "soundcloud";
    return "youtube";
  };
  
  const extractYoutubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  const extractSoundCloudId = (url: string): string | null => {
    if (url.includes("soundcloud.com")) return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 10);
    return null;
  };

  const checkForDuplicate = (track: PlaylistTrack, urlToCheck?: string): string | null => {
    if (urlToCheck && localTracks.value.some(t => t.url === urlToCheck)) {
      return 'Cette musique est déjà dans la liste.';
    }
    const title = track.title?.toLowerCase().trim();
    const artist = track.artist?.toLowerCase().trim();
    if (title && localTracks.value.some(t => t.title.toLowerCase().trim() === title && t.artist.toLowerCase().trim() === artist)) {
      return "Une musique avec ce même titre et artiste est déjà dans la liste. Cliquez à nouveau pour forcer l'ajout.";
    }
    return null;
  };

  const clearTempTrack = () => {
    tempNewTrack.value = { title: '', artist: '', url: '', isCertified: false };
    tempDuplicateWarning.value = null;
    forceAdd.value = false;
    pendingLocalPath.value = null;
  };

  const addTempScTrack = async () => {
    if (!tempNewTrack.value.url.trim()) return;
    const url = tempNewTrack.value.url.trim();
    
    if (!forceAdd.value) {
      const warning = checkForDuplicate(tempNewTrack.value, url);
      if (warning) {
        tempDuplicateWarning.value = warning;
        forceAdd.value = true;
        return;
      }
    }
    
    const source = getUrlSource(url);
    let id = null;
    if (source === 'youtube') id = extractYoutubeId(url);
    if (source === 'soundcloud') id = extractSoundCloudId(url);
    
    if (!id) {
      await showAlert({ title: 'Lien invalide', message: 'Le lien fourni n\'est pas valide.' });
      return;
    }
    
    const trackToAdd = { ...tempNewTrack.value, id, url };
    if (source === 'soundcloud' && !trackToAdd.isCertified) {
      await autoCertifyTrack(trackToAdd as any);
    }
    
    localTracks.value.unshift({
      id: trackToAdd.id,
      title: trackToAdd.title.trim() || 'Titre Inconnu',
      artist: trackToAdd.artist.trim() || 'Artiste Inconnu',
      url: trackToAdd.url,
      duration: 0,
      source: source as any,
      isCertified: trackToAdd.isCertified,
      isTemporary: true
    });
    
    const newTrack = localTracks.value[0];
    await syncGameSession();
    clearTempTrack();
    onTrackAdded(newTrack);
  };

  const readTagsFromUrl = (url: string): Promise<{title: string, artist: string} | null> => {
    return new Promise((resolve) => {
      jsmediatags.read(url, {
        onSuccess: (tag: any) => resolve({ title: tag.tags.title, artist: tag.tags.artist }),
        onError: () => resolve(null)
      });
    });
  };

  const confirmTempLocalTrack = async () => {
    if (!pendingLocalPath.value) return;
    
    if (!forceAdd.value) {
      const warning = checkForDuplicate(tempNewTrack.value, pendingLocalPath.value);
      if (warning) {
        tempDuplicateWarning.value = warning;
        forceAdd.value = true;
        return;
      }
    }
    
    localTracks.value.unshift({
      id: pendingLocalPath.value,
      title: tempNewTrack.value.title.trim() || 'Titre Inconnu',
      artist: tempNewTrack.value.artist.trim() || 'Artiste Inconnu',
      url: pendingLocalPath.value,
      duration: 0,
      source: 'local',
      isCertified: tempNewTrack.value.isCertified,
      isTemporary: true
    });
    
    const newTrack = localTracks.value[0];
    await syncGameSession();
    clearTempTrack();
    onTrackAdded(newTrack);
  };

  const addTempLocalFile = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/dialog/file');
      const paths = await res.json();
      if (Array.isArray(paths) && paths.length > 0) {
        const path = paths[0];
        const filename = path.split(/[\/\\]/).pop() || '';
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
        
        let title = nameWithoutExt;
        let artist = "Artiste Inconnu";
        
        try {
          const streamUrl = `http://127.0.0.1:5000/api/stream?path=${encodeURIComponent(path)}`;
          const tags = await readTagsFromUrl(streamUrl);
          if (tags) {
            if (tags.title) title = tags.title;
            if (tags.artist) artist = tags.artist;
          }
        } catch (_e) { console.warn("Could not read tags"); }
        
        tempNewTrack.value = { title, artist, url: path, isCertified: false };
        pendingLocalPath.value = path;
        
        await autoCertifyTrack(tempNewTrack.value as any);
      }
    } catch (_e) { console.error("Error opening file dialog", _e); }
  };

  const addTempLocalFolder = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/dialog/folder');
      const paths = await res.json();
      if (Array.isArray(paths) && paths.length > 0) {
        let addedCount = 0;
        for (const path of paths) {
          if (localTracks.value.some(t => t.url === path)) continue;
          const filename = path.split(/[\/\\]/).pop() || '';
          const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
          
          let title = nameWithoutExt;
          let artist = "Artiste Inconnu";
          
          try {
            const streamUrl = `http://127.0.0.1:5000/api/stream?path=${encodeURIComponent(path)}`;
            const tags = await readTagsFromUrl(streamUrl);
            if (tags) {
              if (tags.title) title = tags.title;
              if (tags.artist) artist = tags.artist;
            }
          } catch (_e) { console.warn("Could not read tags"); }
          
          let newTrackData = {
            id: path, title: title.trim() || 'Titre Inconnu', artist: artist.trim() || 'Artiste Inconnu',
            url: path, duration: 0, source: 'local' as const, isCertified: false, isTemporary: true
          };
          
          if (!checkForDuplicate(newTrackData, path)) {
            newTrackData = (await autoCertifyTrack(newTrackData as any)) as any;
            localTracks.value.unshift(newTrackData);
            addedCount++;
          }
        }
        if (addedCount > 0) {
          const newTrack = localTracks.value[0];
          await syncGameSession();
          await showAlert({ title: 'Import terminé', message: `${addedCount} musique(s) importée(s) avec succès.` });
          onTrackAdded(newTrack);
        }
      }
    } catch (_e) { console.error("Error opening folder dialog", _e); }
  };

  return {
    tempNewTrack, tempDuplicateWarning, clearTempTrack, addTempScTrack,
    addTempLocalFile, addTempLocalFolder, confirmTempLocalTrack
  };
}
