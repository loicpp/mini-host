import sys
import os
import subprocess
import webbrowser
import shutil
import tempfile
from core.ports.projector_port import ProjectorPort

class LocalProjectorAdapter(ProjectorPort):
    def __init__(self, dev_mode: bool = False):
        self.projector_process = None
        self.temp_dir = None
        self.dev_mode = dev_mode

    def open_window(self, game_id: str) -> None:
        url = f'http://127.0.0.1:5174/public?game={game_id}' if self.dev_mode else f'http://127.0.0.1:5000/public?game={game_id}'
        
        self.close_window()
        
        # Restore original environment for the browser
        old_lp = os.environ.get('LD_LIBRARY_PATH')
        if 'LD_LIBRARY_PATH_ORIG' in os.environ:
            os.environ['LD_LIBRARY_PATH'] = os.environ['LD_LIBRARY_PATH_ORIG']
        elif 'LD_LIBRARY_PATH' in os.environ:
            del os.environ['LD_LIBRARY_PATH']

        # Liste des navigateurs supportés
        chromium_browsers = [
            "google-chrome", "google-chrome-stable", "chrome", 
            "chromium", "chromium-browser", "microsoft-edge", "brave-browser"
        ]
        
        executable = None
        is_firefox = False
        
        # Chercher d'abord Firefox (navigateur par défaut sur Pop!_OS)
        executable = shutil.which("firefox")
        if executable:
            is_firefox = True
        else:
            for b in chromium_browsers:
                executable = shutil.which(b)
                if executable:
                    break
                
        if executable:
            # Profil temporaire pour isoler le processus
            self.temp_dir = tempfile.mkdtemp(prefix="minihost_projector_")
            
            if is_firefox:
                # Configuration spécifique pour Firefox
                self.projector_process = subprocess.Popen([
                    executable,
                    "--no-remote",
                    "-profile", self.temp_dir,
                    "-new-window", url
                ])
            else:
                # Configuration pour Chromium
                self.projector_process = subprocess.Popen([
                    executable,
                    f"--app={url}",
                    f"--user-data-dir={self.temp_dir}",
                    "--no-first-run",
                    "--no-default-browser-check"
                ])
        else:
            # Fallback absolu
            webbrowser.open_new(url)

        if old_lp is not None:
            os.environ['LD_LIBRARY_PATH'] = old_lp
        elif 'LD_LIBRARY_PATH' in os.environ:
            del os.environ['LD_LIBRARY_PATH']

    def close_window(self) -> None:
        if self.projector_process:
            try:
                self.projector_process.terminate()
                self.projector_process.wait(timeout=2)
            except Exception:
                try:
                    self.projector_process.kill()
                except Exception:
                    pass
            self.projector_process = None
            
        if self.temp_dir and os.path.exists(self.temp_dir):
            try:
                shutil.rmtree(self.temp_dir)
            except Exception:
                pass
            self.temp_dir = None
