import { ref } from 'vue';
import { Playlist } from '../types/playlist';
import { useDialog } from '../../general/useDialog';
import { useI18n } from 'vue-i18n';
import { useTrackCertifier } from './useTrackCertifier';

export const globalPlaylists = ref<Playlist[]>([]);

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export function usePlaylists() {
  const { showConfirm, showAlert } = useDialog();
  const { t } = useI18n();
  const { autoCertifyTrack } = useTrackCertifier();
  
  const playlists = globalPlaylists;
  const isGenerating = ref(false);

  const loadPlaylists = async () => {
    try {
      const configRes = await fetch(`${BASE_URL}/playlists`);
      const data = await configRes.json();
      if (Array.isArray(data)) {
        playlists.value = data;
      } else if (data.playlists) {
        playlists.value = data.playlists; // backward compatibility
      }
    } catch(e) {
      console.warn("Could not load playlists", e);
    }
  };

  const saveToConfig = async () => {
    try {
      const res = await fetch(`${BASE_URL}/playlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playlists.value)
      });
      const data = await res.json();
      if (data.status === 'error') {
        await showAlert({ title: "Erreur de sauvegarde", message: data.message });
        await loadPlaylists(); // reload to get the correct state
      }
    } catch(e) {
      console.warn("Could not save playlists", e);
    }
  };

  const createPlaylist = async (name: string, type: 'soundcloud' | 'local') => {
    if (!name.trim()) return;
    const newId = `pl_${Date.now()}`;
    playlists.value.push({
      id: newId,
      name: name.trim().substring(0, 50),
      type: type,
      tracks: []
    });
    await saveToConfig();
  };

  const deletePlaylist = async (id: string) => {
    if (await showConfirm({ title: t('dialogs.delete_playlist.title'), message: t('dialogs.delete_playlist.message'), confirmText: t('dialogs.delete_playlist.confirm'), confirmVariant: "danger" })) {
      playlists.value = playlists.value.filter(p => p.id !== id);
      await saveToConfig();
    }
  };

  const generatePlaylist = async (theme: string, limit: number) => {
    if (!theme.trim() || isGenerating.value) return false;
    
    isGenerating.value = true;
    try {
      const res = await fetch(`${BASE_URL}/playlists/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: theme.trim(),
          limit: limit
        })
      });
      
      const tracks = await res.json();
      if (tracks && tracks.length > 0) {
        const newId = `pl_${Date.now()}`;
        const rawTheme = theme.trim();
        const formattedTheme = rawTheme.charAt(0).toUpperCase() + rawTheme.slice(1).toLowerCase();
        playlists.value.push({
          id: newId,
          name: `Playlist : ${formattedTheme}`,
          type: 'soundcloud',
          tracks: []
        });
        
        // Auto-certify generated tracks
        const plIndex = playlists.value.length - 1;
        for (const track of tracks) {
          if (!track.isCertified) {
            await autoCertifyTrack(track);
          }
          playlists.value[plIndex].tracks.push(track);
        }
        
        await saveToConfig();
        return true;
      } else {
        await showAlert({ title: "Aucun résultat", message: "Aucune musique n'a été trouvée pour ce thème." });
        return false;
      }
    } catch(e) {
      console.error("Erreur génération playlist", e);
      await showAlert({ title: t('playlists.generate_error_title'), message: t('playlists.generate_error_msg') });
      return false;
    } finally {
      isGenerating.value = false;
    }
  };

  return {
    playlists,
    isGenerating,
    loadPlaylists,
    saveToConfig,
    createPlaylist,
    deletePlaylist,
    generatePlaylist
  };
}
