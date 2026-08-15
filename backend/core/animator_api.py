from typing import Dict, Any, List
from core.ports.storage_port import StoragePort
from core.ports.projector_port import ProjectorPort
try:
    from music_provider import MusicManager
except ImportError:
    # Fallback for old import structure if needed
    from music_provider import MusicManager

from core.ports.music_search_port import MusicSearchPort
from core.ports.playlist_generator_port import PlaylistGeneratorPort

class AnimatorApi:
    def __init__(self, storage_port: StoragePort, projector_port: ProjectorPort, sc_search_port: MusicSearchPort = None, playlist_generator_port: PlaylistGeneratorPort = None):
        self.storage_port = storage_port
        self.projector_port = projector_port
        self.sc_search_port = sc_search_port
        self.playlist_generator_port = playlist_generator_port
        self.music_manager = MusicManager()
        self.ui_connected = False
    
    def search_soundcloud(self, query: str) -> List[Dict[str, Any]]:
        if self.sc_search_port:
            return self.sc_search_port.search(query)
        return []
        
    def generate_playlist(self, theme: str, limit: int) -> List[Dict[str, Any]]:
        if self.playlist_generator_port:
            return self.playlist_generator_port.generate(theme, limit)
        return []
        
    def save_config(self, config_data: Dict[str, Any]) -> Dict[str, str]:
        self.storage_port.save_config(config_data)
        return {"status": "ok"}
        
    def load_config(self) -> Dict[str, Any]:
        return self.storage_port.load_config()

    def save_playlists(self, playlists_data: List[Dict[str, Any]]) -> Dict[str, str]:
        for pl in playlists_data:
            name = pl.get('name', '')
            if len(name) > 50:
                return {"status": "error", "message": f"Le nom de la playlist ne peut pas dépasser 50 caractères."}
        self.storage_port.save_playlists(playlists_data)
        return {"status": "ok"}

    def save_game_state(self, state_data: Dict[str, Any]) -> Dict[str, str]:
        self.storage_port.save_game_state(state_data)
        return {"status": "ok"}

    def load_game_state(self) -> Dict[str, Any]:
        return self.storage_port.load_game_state()

    def load_playlists(self) -> List[Dict[str, Any]]:
        return self.storage_port.load_playlists()

    def save_presets(self, presets_data: List[Dict[str, Any]]) -> Dict[str, str]:
        for preset in presets_data:
            name = preset.get('name', '')
            if len(name) > 10:
                return {"status": "error", "message": "Le nom du preset ne peut pas dépasser 10 caractères."}
        self.storage_port.save_presets(presets_data)
        return {"status": "ok"}

    def load_presets(self) -> List[Dict[str, Any]]:
        return self.storage_port.load_presets()
