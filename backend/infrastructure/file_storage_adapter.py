import os
import json
import shutil
from typing import Dict, Any, List
from core.ports.storage_port import StoragePort

class FileStorageAdapter(StoragePort):
    def __init__(self, config_dir: str = None):
        if config_dir is None:
            if 'XDG_CONFIG_HOME' in os.environ:
                self.config_dir = os.path.join(os.environ['XDG_CONFIG_HOME'], "minihost", "blindtest")
            else:
                self.config_dir = os.path.expanduser("~/.minihost/blindtest")
        else:
            self.config_dir = config_dir
        os.makedirs(self.config_dir, exist_ok=True)

    def save_config(self, config_data: Dict[str, Any]) -> None:
        try:
            current = self.load_config() or {}
            for k, v in config_data.items():
                if v is None:
                    current.pop(k, None)
                else:
                    current[k] = v
            with open(os.path.join(self.config_dir, "config.json"), "w") as f:
                json.dump(current, f)
        except Exception:
            pass

    def load_config(self) -> Dict[str, Any]:
        try:
            cfg_path = os.path.join(self.config_dir, "config.json")
            
            # Legacy fallback
            old_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "regie_config.json")
            if not os.path.exists(cfg_path) and os.path.exists(old_path):
                shutil.copy(old_path, cfg_path)
                
            if os.path.exists(cfg_path):
                with open(cfg_path, "r") as f:
                    return json.load(f)
        except Exception:
            pass
        return {}

    def save_playlists(self, playlists_data: List[Dict[str, Any]]) -> None:
        try:
            with open(os.path.join(self.config_dir, "playlists.json"), "w") as f:
                json.dump(playlists_data, f)
        except Exception:
            pass

    def load_playlists(self) -> List[Dict[str, Any]]:
        playlists = []
        try:
            pl_path = os.path.join(self.config_dir, "playlists.json")
            if os.path.exists(pl_path):
                with open(pl_path, "r") as f:
                    playlists = json.load(f)
            
            cfg_path = os.path.join(self.config_dir, "config.json")
            if not playlists and os.path.exists(cfg_path):
                with open(cfg_path, "r") as f:
                    config = json.load(f)
                    if "playlists" in config:
                        playlists = config["playlists"]
                        self.save_playlists(playlists)
                        del config["playlists"]
                        with open(cfg_path, "w") as fw:
                            json.dump(config, fw)
        except Exception:
            pass
        return playlists

    def save_game_state(self, state_data: Dict[str, Any]) -> None:
        try:
            current = self.load_game_state() or {}
            for k, v in state_data.items():
                if v is None:
                    current.pop(k, None)
                else:
                    current[k] = v
            with open(os.path.join(self.config_dir, "game.json"), "w") as f:
                json.dump(current, f)
        except Exception:
            pass

    def load_game_state(self) -> Dict[str, Any]:
        try:
            path = os.path.join(self.config_dir, "game.json")
            if os.path.exists(path):
                with open(path, "r") as f:
                    return json.load(f)
        except Exception as e:
            return {"error": str(e), "corrupted": True}
        return {}

    def save_presets(self, presets_data: List[Dict[str, Any]]) -> None:
        try:
            with open(os.path.join(self.config_dir, "presets.json"), "w") as f:
                json.dump(presets_data, f)
        except Exception:
            pass

    def load_presets(self) -> List[Dict[str, Any]]:
        presets = []
        try:
            pl_path = os.path.join(self.config_dir, "presets.json")
            if os.path.exists(pl_path):
                with open(pl_path, "r") as f:
                    presets = json.load(f)
        except Exception:
            pass
        return presets
