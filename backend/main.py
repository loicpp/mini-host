import sys
import os
import threading
import time
from flask import Flask
from flask_cors import CORS
from core.animator_api import AnimatorApi
from infrastructure.file_storage_adapter import FileStorageAdapter
from infrastructure.local_projector_adapter import LocalProjectorAdapter
from controllers.http_controller import register_routes

if getattr(sys, 'frozen', False):
    bundle_dir = sys._MEIPASS
    static_folder = os.path.join(bundle_dir, 'animator-ui', 'dist')
else:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    static_folder = os.path.join(current_dir, '..', 'animator-ui', 'dist')

app = Flask(__name__, static_folder=static_folder)
CORS(app)

dev_mode = "--dev" in sys.argv

# Setup Architecture (Dependency Injection)
storage_adapter = FileStorageAdapter()
projector_adapter = LocalProjectorAdapter(dev_mode=dev_mode)
api = AnimatorApi(storage_port=storage_adapter, projector_port=projector_adapter)

# Register routes
register_routes(app, api)

if __name__ == '__main__':
    if dev_mode:
        url_regie = 'http://127.0.0.1:5174/'
    else:
        url_regie = 'http://127.0.0.1:5000/'
        
    import webbrowser
    import tkinter as tk
    
    def run_flask():
        import logging
        log = logging.getLogger('werkzeug')
        log.setLevel(logging.ERROR)
        try:
            from flask import cli
            cli.show_server_banner = lambda *x: None
        except Exception:
            pass
        app.run(port=5000, use_reloader=False)
        
    threading.Thread(target=run_flask, daemon=True).start()
    
    def open_browser():
        time.sleep(1)
        
        # Restore original LD_LIBRARY_PATH for subprocesses to avoid PyInstaller conflicts
        old_lp = os.environ.get('LD_LIBRARY_PATH')
        if 'LD_LIBRARY_PATH_ORIG' in os.environ:
            os.environ['LD_LIBRARY_PATH'] = os.environ['LD_LIBRARY_PATH_ORIG']
        elif 'LD_LIBRARY_PATH' in os.environ:
            del os.environ['LD_LIBRARY_PATH']
            
        webbrowser.open(url_regie)
        
        # Restore PyInstaller's LD_LIBRARY_PATH
        if old_lp is not None:
            os.environ['LD_LIBRARY_PATH'] = old_lp
        elif 'LD_LIBRARY_PATH' in os.environ:
            del os.environ['LD_LIBRARY_PATH']
        
    threading.Thread(target=open_browser, daemon=True).start()
    
    root = tk.Tk()
    root.title("MiniHost - Serveur")
    root.geometry("400x200")
    
    try:
        if sys.platform.startswith('linux'):
            png_path = os.path.join(sys._MEIPASS if getattr(sys, 'frozen', False) else os.path.dirname(os.path.abspath(__file__)), 'favicon.png')
            if os.path.exists(png_path):
                img = tk.PhotoImage(file=png_path)
                root.iconphoto(True, img)
        else:
            ico_path = os.path.join(sys._MEIPASS if getattr(sys, 'frozen', False) else os.path.dirname(os.path.abspath(__file__)), 'favicon.ico')
            if os.path.exists(ico_path):
                root.iconbitmap(ico_path)
    except Exception as e:
        print("Erreur icône:", e)
    
    lbl = tk.Label(root, text="Le serveur MiniHost est en cours d'exécution.\n\nFermez cette fenêtre pour tout arrêter.", justify="center", padx=20, pady=50)
    lbl.pack(expand=True)
    
    def on_close():
        try:
            api.close_projector_window()
        except Exception:
            pass
        try:
            api.music_manager.quit()
        except Exception:
            pass
        root.destroy()
        os._exit(0)
        
    root.protocol("WM_DELETE_WINDOW", on_close)
    root.mainloop()
