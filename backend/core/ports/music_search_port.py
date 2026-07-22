from abc import ABC, abstractmethod
from typing import List, Dict, Any

class MusicSearchPort(ABC):
    @abstractmethod
    def search(self, query: str) -> List[Dict[str, Any]]:
        """
        Search for tracks based on a query string.
        Returns a list of dictionaries with keys: title, artist, url, coverUrl
        """
        pass
