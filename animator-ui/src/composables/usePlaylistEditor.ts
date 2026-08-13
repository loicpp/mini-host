import { ref } from 'vue';
import { Playlist, Track } from '../types/playlist';
import { musicManager } from '../services/music/MusicManager';
import { useDialog } from './useDialog';
import { useI18n } from 'vue-i18n';
import jsmediatags from 'jsmediatags';
import { useTrackCertifier } from './useTrackCertifier';

export function usePlaylistEditor(savePlaylistsCallback: () => Promise<void>) {
  const { showAlert } = useDialog();
  const { t } = useI18n();
  const { autoCertifyTrack } = useTrackCertifier();

  const selectedPlaylist = ref<Playlist | null>(null);
  
  const deletedTrackInfo = ref<{ track: Track, index: number, playlistId: string } | null>(null);
  let deleteToastTimeout: number | null = null;
  
  const testingTrackUrl = ref<string | null>(null);
  const testingTrackId = ref<string | null>(null);
  const testingTrackSource = ref<string>('youtube');
  const testDuration = ref<number>(30);
  const testTimeout = ref<number | null>(null);

  const newTrack = ref<Track>({ title: '', artist: '', url: '', isCertified: false });
  const duplicateWarning = ref<string | null>(null);
  const forceAdd = ref(false);
  const pendingLocalPath = ref<string | null>(null);

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
    if (url.includes("soundcloud.com")) return url;
    return null;
  };

  const checkForDuplicate = (track: Track, urlToCheck?: string): string | null => {
    if (!selectedPlaylist.value) return null;
    const tracks = selectedPlaylist.value.tracks;
    
    if (urlToCheck && tracks.some(t => t.url === urlToCheck)) {
      return t('playlists.duplicate_warning');
    }
    
    const title = track.title?.toLowerCase().trim();
    const artist = track.artist?.toLowerCase().trim();
    if (title && tracks.some(t => t.title.toLowerCase().trim() === title && t.artist.toLowerCase().trim() === artist)) {
      return "Une musique avec ce même titre et artiste est déjà dans la playlist. Cliquez à nouveau pour forcer l'ajout.";
    }
    
    return null;
  };

  const clearSelectedTrack = () => {
    newTrack.value = { title: '', artist: '', url: '', isCertified: false };
    duplicateWarning.value = null;
    forceAdd.value = false;
    pendingLocalPath.value = null;
  };

  const addTrack = async () => {
    if (!newTrack.value.url.trim() || !selectedPlaylist.value) return;
    
    const url = newTrack.value.url.trim();
    
    if (!forceAdd.value) {
      const warning = checkForDuplicate(newTrack.value, url);
      if (warning) {
        duplicateWarning.value = warning;
        forceAdd.value = true;
        return;
      }
    }
    
    const source = getUrlSource(url);
    let id = null;
    if (source === 'youtube') id = extractYoutubeId(url);
    if (source === 'soundcloud') id = extractSoundCloudId(url);
    
    if (!id) {
      await showAlert({ title: t('dialogs.invalid_url.title'), message: t('dialogs.invalid_url.message') });
      return;
    }
    
    const trackToAdd = { ...newTrack.value, id, url };
    if (source === 'soundcloud' && !trackToAdd.isCertified) {
      await autoCertifyTrack(trackToAdd);
    }
    
    selectedPlaylist.value.tracks.unshift({
      id: trackToAdd.id,
      title: trackToAdd.title.trim() || 'Titre Inconnu',
      artist: trackToAdd.artist.trim() || 'Artiste Inconnu',
      url: trackToAdd.url,
      source: source as any,
      isCertified: trackToAdd.isCertified
    });
    
    clearSelectedTrack();
    await savePlaylistsCallback();
  };

  const readTagsFromUrl = (url: string): Promise<{title: string, artist: string} | null> => {
    return new Promise((resolve) => {
      jsmediatags.read(url, {
        onSuccess: (tag: any) => {
          resolve({
            title: tag.tags.title,
            artist: tag.tags.artist
          });
        },
        onError: () => {
          resolve(null);
        }
      });
    });
  };

  const confirmLocalTrackAdded = async () => {
    if (!selectedPlaylist.value || !pendingLocalPath.value) return;
    
    if (!forceAdd.value) {
      const warning = checkForDuplicate(newTrack.value, pendingLocalPath.value);
      if (warning) {
        duplicateWarning.value = warning;
        forceAdd.value = true;
        return;
      }
    }
    
    selectedPlaylist.value.tracks.unshift({
      id: pendingLocalPath.value,
      title: newTrack.value.title.trim() || 'Titre Inconnu',
      artist: newTrack.value.artist.trim() || 'Artiste Inconnu',
      url: pendingLocalPath.value,
      source: 'local',
      isCertified: newTrack.value.isCertified
    });
    
    clearSelectedTrack();
    await savePlaylistsCallback();
  };

  const addLocalTrackFileFirst = async () => {
    if (!selectedPlaylist.value) return;
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
        } catch (_e) {
          console.warn("Could not extract ID3 tags from file:", _e);
        }
        
        newTrack.value = {
          title,
          artist,
          url: path,
          source: 'local',
          isCertified: false
        };
        pendingLocalPath.value = path;
        
        await autoCertifyTrack(newTrack.value as any);
      }
    } catch (_e) {
      console.error("Error opening file dialog", _e);
    }
  };

  const addLocalPaths = async (paths: string[]) => {
    if (!selectedPlaylist.value || paths.length === 0) return;
    let addedCount = 0;
    
    for (const path of paths) {
      if (selectedPlaylist.value.tracks.some(t => t.url === path)) continue;
  
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
      } catch (_e) {
        console.warn("Could not read tags for", path);
      }
      
      let newTrackData = {
        id: path,
        title: title.trim() || 'Titre Inconnu',
        artist: artist.trim() || 'Artiste Inconnu',
        url: path,
        source: 'local' as const,
        isCertified: false
      };
      
      if (!checkForDuplicate(newTrackData, path)) {
        newTrackData = await autoCertifyTrack(newTrackData as any) as any;
        selectedPlaylist.value.tracks.unshift(newTrackData);
        addedCount++;
      }
    }
    
    if (addedCount > 0) {
      await savePlaylistsCallback();
    }
    
    await showAlert({ 
      title: 'Import terminé', 
      message: `${addedCount} musique(s) importée(s) avec succès.` 
    });
  };

  const addLocalFolder = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/dialog/folder');
      const paths = await res.json();
      if (Array.isArray(paths) && paths.length > 0) {
        await addLocalPaths(paths);
      }
    } catch (_e) {
      console.error("Error opening folder dialog", _e);
    }
  };

  const removeTrack = async (index: number) => {
    if (!selectedPlaylist.value) return;
    const track = selectedPlaylist.value.tracks[index];
    
    selectedPlaylist.value.tracks.splice(index, 1);
    await savePlaylistsCallback();
  
    deletedTrackInfo.value = { track, index, playlistId: selectedPlaylist.value.id };
    
    if (deleteToastTimeout) clearTimeout(deleteToastTimeout);
    deleteToastTimeout = window.setTimeout(() => {
      deletedTrackInfo.value = null;
    }, 3000);
  };
  
  const undoDelete = async (playlists: Playlist[]) => {
    if (!deletedTrackInfo.value) return;
    
    const { track, index, playlistId } = deletedTrackInfo.value;
    
    const pl = playlists.find(p => p.id === playlistId);
    if (pl) {
      pl.tracks.splice(index, 0, track);
      await savePlaylistsCallback();
    }
    
    deletedTrackInfo.value = null;
    if (deleteToastTimeout) clearTimeout(deleteToastTimeout);
  };

  const stopTest = async () => {
    testingTrackUrl.value = null;
    testingTrackId.value = null;
    if (testTimeout.value !== null) {
      window.clearTimeout(testTimeout.value);
      testTimeout.value = null;
    }
    await musicManager.stop();
  };

  const testTrack = async (url: string) => {
    const source = selectedPlaylist.value?.type === 'local' ? 'local' : getUrlSource(url);
    let id = null;
    if (source === 'youtube') id = extractYoutubeId(url);
    else if (source === 'soundcloud') id = extractSoundCloudId(url);
    else if (source === 'local') id = url;
    
    if (id) {
      let dur = Math.floor(testDuration.value);
      if (isNaN(dur) || dur < 1) dur = 1;
      if (dur > 100) dur = 100;
      testDuration.value = dur;
  
      try {
        if (testingTrackUrl.value) {
          await stopTest();
        }
        testingTrackUrl.value = url;
        testingTrackId.value = id;
        testingTrackSource.value = source;
        
        await musicManager.play({
          id: id,
          title: "Test",
          artist: "Test",
          duration: dur * 1000,
          source: source as any
        });
        
        if (testingTrackUrl.value !== url) {
          await musicManager.stop();
        } else {
          testTimeout.value = window.setTimeout(() => {
            if (testingTrackUrl.value === url) {
              stopTest();
            }
          }, dur * 1000);
        }
      } catch(err) {
        console.error(err);
      }
    } else {
      await showAlert({ title: t('dialogs.invalid_link_sc.title'), message: t('dialogs.invalid_link_sc.message') });
    }
  };

  const clearToast = () => {
    deletedTrackInfo.value = null;
    if (deleteToastTimeout) {
      clearTimeout(deleteToastTimeout);
      deleteToastTimeout = null;
    }
  };

  return {
    selectedPlaylist,
    newTrack,
    duplicateWarning,
    forceAdd,
    pendingLocalPath,
    deletedTrackInfo,
    testingTrackUrl,
    testDuration,
    addTrack,
    confirmLocalTrackAdded,
    addLocalTrackFileFirst,
    addLocalFolder,
    removeTrack,
    undoDelete,
    testTrack,
    stopTest,
    clearSelectedTrack,
    clearToast
  };
}
