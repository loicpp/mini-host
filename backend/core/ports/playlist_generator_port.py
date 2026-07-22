from typing import List, Dict, Any

class PlaylistGeneratorPort:
    def generate(self, theme: str, limit: int) -> List[Dict[str, Any]]:
        raise NotImplementedError
