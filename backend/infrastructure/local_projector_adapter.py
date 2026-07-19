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

        # Si non trouvé dans le PATH sur Windows, chercher dans les dossiers d'installation par défaut
        if not executable and sys.platform.startswith('win'):
            program_files = os.environ.get("ProgramFiles", "C:\\Program Files")
            program_files_x86 = os.environ.get("ProgramFiles(x86)", "C:\\Program Files (x86)")
            local_app_data = os.environ.get("LocalAppData", os.path.expanduser("~\\AppData\\Local"))
            
            # Chemins d'installation typiques de Firefox
            firefox_paths = [
                os.path.join(program_files, "Mozilla Firefox", "firefox.exe"),
                os.path.join(program_files_x86, "Mozilla Firefox", "firefox.exe"),
            ]
            
            # Chemins d'installation typiques de Chrome
            chrome_paths = [
                os.path.join(program_files, "Google", "Chrome", "Application", "chrome.exe"),
                os.path.join(program_files_x86, "Google", "Chrome", "Application", "chrome.exe"),
                os.path.join(local_app_data, "Google", "Chrome", "Application", "chrome.exe"),
            ]
            
            # Chemins d'installation typiques de Microsoft Edge (présent sur toutes les machines Windows)
            edge_paths = [
                os.path.join(program_files_x86, "Microsoft", "Edge", "Application", "msedge.exe"),
                os.path.join(program_files, "Microsoft", "Edge", "Application", "msedge.exe"),
            ]
            
            # Rechercher Firefox en premier, puis Chrome, puis Edge en dernier recours
            for path in firefox_paths:
                if os.path.exists(path):
                    executable = path
                    is_firefox = True
                    break
            
            if not executable:
                for path in chrome_paths:
                    if os.path.exists(path):
                        executable = path
                        break
                        
            if not executable:
                for path in edge_paths:
                    if os.path.exists(path):
                        executable = path
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
