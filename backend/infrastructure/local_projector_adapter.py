import sys
import os
import subprocess
from core.ports.projector_port import ProjectorPort

class LocalProjectorAdapter(ProjectorPort):
    def __init__(self, dev_mode: bool = False):
        self.projector_process = None
        self.dev_mode = dev_mode

    def open_window(self, game_id: str) -> None:
        import socket
        def get_free_port():
            s = socket.socket()
            s.bind(('127.0.0.1', 0))
            port = s.getsockname()[1]
            s.close()
            return port
            
        api_port = get_free_port()
        base_url = f'http://127.0.0.1:5174/public?game={game_id}' if self.dev_mode else f'http://127.0.0.1:5000/public?game={game_id}'
        url = f"{base_url}&api_port={api_port}"
        
        self.close_window()
        
        # Restore original environment for the subprocess
        env = os.environ.copy()
        if 'LD_LIBRARY_PATH_ORIG' in env:
            env['LD_LIBRARY_PATH'] = env['LD_LIBRARY_PATH_ORIG']
        elif 'LD_LIBRARY_PATH' in env:
            del env['LD_LIBRARY_PATH']

        if getattr(sys, 'frozen', False):
            self.projector_process = subprocess.Popen(
                [sys.executable, "--projector", url],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                stdin=subprocess.DEVNULL,
                env=env
            )
        else:
            self.projector_process = subprocess.Popen(
                [sys.executable, "main.py", "--projector", url],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                stdin=subprocess.DEVNULL,
                env=env
            )

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
