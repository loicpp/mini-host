import urllib.request
import urllib.parse
import json
from typing import List, Dict, Any
from core.ports.playlist_generator_port import PlaylistGeneratorPort
from core.ports.music_search_port import MusicSearchPort

class LastfmPlaylistGeneratorAdapter(PlaylistGeneratorPort):
    def __init__(self, sc_search_port: MusicSearchPort, api_key: str):
        self.sc_search_port = sc_search_port
        self.api_key = api_key

    def generate(self, theme: str, limit: int) -> List[Dict[str, Any]]:
        try:
            url = f"https://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag={urllib.parse.quote(theme)}&limit={limit}&api_key={self.api_key}&format=json"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            res = urllib.request.urlopen(req).read().decode('utf-8')
            data = json.loads(res)
            
            tracks = data.get('tracks', {}).get('track', [])
            playlist = []
            
            for track in tracks:
                title = track.get('name')
                artist = track.get('artist', {}).get('name')
                
                if title and artist:
                    # Chercher sur Soundcloud via l'adaptateur
                    query = f"{title} {artist}"
                    sc_results = self.sc_search_port.search(query)
                    
                    if sc_results:
                        # Prendre le premier résultat
                        best_match = sc_results[0]
                        playlist.append({
                            "title": title,
                            "artist": artist,
                            "url": best_match.get("url"),
                            "isCertified": True
                        })
            
            return playlist
        except Exception as e:
            print("Erreur Last.fm:", e)
            return []
