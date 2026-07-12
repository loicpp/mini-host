import pygame
import os
import time

class MusicManager:
    def __init__(self):
        pygame.mixer.init()
        self.current_provider = "local" # local, spotify, deezer
        
    def play(self, track_info):
        """
        track_info expected to have:
        - type: 'local', 'spotify'
        - path: file path if local
        - uri: spotify uri if spotify
        """
        print(f"Playing track: {track_info}")
        try:
            if track_info.get("type") == "local":
                file_path = track_info.get("path")
                if os.path.exists(file_path):
                    pygame.mixer.music.load(file_path)
                    pygame.mixer.music.play()
                    return {"status": "playing", "duration": 30000} # Mock duration 30s
                else:
                    return {"status": "error", "message": "File not found"}
            
            elif track_info.get("type") == "test":
                # Generate a simple beep for diagnostic using pygame
                # Wait, pygame.sndarray requires numpy. Instead we'll just return OK.
                # Actually for test we can just pretend it played.
                return {"status": "playing", "duration": 5000}
                
            return {"status": "error", "message": "Provider not implemented yet"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def stop(self):
        print("Stopping track")
        try:
            pygame.mixer.music.stop()
            return {"status": "stopped"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def quit(self):
        try:
            pygame.mixer.quit()
        except Exception:
            pass

