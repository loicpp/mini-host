import urllib.request
import urllib.parse
import urllib.error
import json
import re
from typing import List, Dict, Any
from core.ports.music_search_port import MusicSearchPort

class SoundCloudScraperAdapter(MusicSearchPort):
    def __init__(self):
        self.client_id = None

    def _get_client_id(self):
        try:
            req = urllib.request.Request("https://soundcloud.com", headers={'User-Agent': 'Mozilla/5.0'})
            html = urllib.request.urlopen(req).read().decode('utf-8')
            scripts = re.findall(r'<script crossorigin src="(https://a-v2\.sndcdn\.com/assets/[^"]+)"></script>', html)
            for script_url in scripts:
                js_req = urllib.request.Request(script_url, headers={'User-Agent': 'Mozilla/5.0'})
                js = urllib.request.urlopen(js_req).read().decode('utf-8')
                match = re.search(r'client_id:"([^"]+)"', js)
                if match:
                    self.client_id = match.group(1)
                    return True
        except Exception as e:
            print("Erreur récupération client_id SC:", e)
        return False

    def search(self, query: str) -> List[Dict[str, Any]]:
        if not self.client_id:
            if not self._get_client_id():
                return []
                
        try:
            url = f"https://api-v2.soundcloud.com/search/tracks?q={urllib.parse.quote(query)}&client_id={self.client_id}&limit=15"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            res = urllib.request.urlopen(req).read().decode('utf-8')
            data = json.loads(res)
            
            results = []
            for item in data.get('collection', []):
                if 'title' in item and 'user' in item and 'permalink_url' in item:
                    results.append({
                        "title": item.get('title'),
                        "artist": item['user'].get('username', 'Artiste inconnu'),
                        "url": item.get('permalink_url'),
                        "coverUrl": item.get('artwork_url') or item['user'].get('avatar_url', '')
                    })
            return results
        except urllib.error.HTTPError as e:
            if e.code in (401, 403):
                self.client_id = None
                return self.search(query) # Try one more time with a fresh client ID
            print("Erreur HTTP SC:", e)
            return []
        except Exception as e:
            print("Erreur SC:", e)
            return []
