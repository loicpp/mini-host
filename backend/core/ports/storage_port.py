from abc import ABC, abstractmethod
from typing import Dict, Any, List

class StoragePort(ABC):
    @abstractmethod
    def save_config(self, config_data: Dict[str, Any]) -> None:
        pass

    @abstractmethod
    def load_config(self) -> Dict[str, Any]:
        pass

    @abstractmethod
    def save_playlists(self, playlists_data: List[Dict[str, Any]]) -> None:
        pass

    @abstractmethod
    def load_playlists(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def save_game_state(self, state_data: Dict[str, Any]) -> None:
        pass

    @abstractmethod
    def load_game_state(self) -> Dict[str, Any]:
        pass
