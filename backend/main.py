import sys
import os
import threading
import time
from flask import Flask
from flask_cors import CORS
from core.animator_api import AnimatorApi
from infrastructure.file_storage_adapter import FileStorageAdapter
from infrastructure.local_projector_adapter import LocalProjectorAdapter
from infrastructure.soundcloud_scraper_adapter import SoundCloudScraperAdapter
from infrastructure.lastfm_playlist_generator_adapter import LastfmPlaylistGeneratorAdapter
from controllers.http_controller import register_routes

if getattr(sys, 'frozen', False):
    bundle_dir = sys._MEIPASS
    static_folder = os.path.join(bundle_dir, 'animator-ui', 'dist')
elif os.path.exists('/app/share/minihost/animator-ui/dist'):
    # Exécution depuis le sandbox Flatpak
    static_folder = '/app/share/minihost/animator-ui/dist'
else:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    static_folder = os.path.join(current_dir, '..', 'animator-ui', 'dist')

app = Flask(__name__, static_folder=static_folder)
CORS(app)

dev_mode = "--dev" in sys.argv

# Setup Architecture (Dependency Injection)
lastfm_api_key = ""
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'animator-ui', '.env')
if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        for line in f:
            if line.startswith('VITE_LAFT_FM_API_KEY='):
                lastfm_api_key = line.split('=', 1)[1].strip()

storage_adapter = FileStorageAdapter()
projector_adapter = LocalProjectorAdapter(dev_mode=dev_mode)
sc_search_adapter = SoundCloudScraperAdapter()
playlist_generator_adapter = LastfmPlaylistGeneratorAdapter(sc_search_adapter, lastfm_api_key) if lastfm_api_key else None
api = AnimatorApi(storage_port=storage_adapter, projector_port=projector_adapter, sc_search_port=sc_search_adapter, playlist_generator_port=playlist_generator_adapter)

# Register routes
register_routes(app, api)

if __name__ == '__main__':
    if dev_mode:
        url_regie = 'http://127.0.0.1:5174/'
    else:
        url_regie = 'http://127.0.0.1:5000/'
        
    import webbrowser
    
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
        # Wait up to 3 seconds to see if an existing UI reconnects (UI pings every 2s when disconnected)
        for _ in range(6):
            if api.ui_connected:
                print("UI already connected, skipping browser open.")
                return
            time.sleep(0.5)
            
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
    
    def on_close():
        try:
            api.close_projector_window()
        except Exception:
            pass
        try:
            api.music_manager.quit()
        except Exception:
            pass
        os._exit(0)

    try:
        import tkinter as tk
        
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
        
        def gui_close():
            root.destroy()
            on_close()
            
        root.protocol("WM_DELETE_WINDOW", gui_close)
        root.mainloop()
    except ImportError:
        try:
            import pygame
            import os
            os.environ['SDL_VIDEO_X11_WMCLASS'] = "com.github.loicpp.MiniHost"
            os.environ['SDL_VIDEODRIVER'] = "x11"
            pygame.init()
            pygame.display.set_caption("MiniHost - Serveur")
            try:
                png_path = os.path.join(sys._MEIPASS if getattr(sys, 'frozen', False) else os.path.dirname(os.path.abspath(__file__)), 'favicon.png')
                if os.path.exists(png_path):
                    icon = pygame.image.load(png_path)
                    pygame.display.set_icon(icon)
            except Exception:
                pass
                
            screen = pygame.display.set_mode((450, 200))
            screen.fill((30, 30, 30))
            if pygame.font.get_init():
                font = pygame.font.SysFont(None, 24)
                text1 = font.render("Le serveur MiniHost est en cours d'execution.", True, (255, 255, 255))
                text2 = font.render("Fermez cette fenetre pour tout arreter.", True, (255, 255, 255))
                screen.blit(text1, (450//2 - text1.get_width()//2, 70))
                screen.blit(text2, (450//2 - text2.get_width()//2, 110))
            pygame.display.flip()
            
            running = True
            while running:
                for event in pygame.event.get():
                    if event.type == pygame.QUIT:
                        running = False
                pygame.time.wait(200)
            pygame.quit()
            on_close()
        except Exception:
            print("MiniHost fonctionne en arrière-plan (mode sans interface graphique).")
            print("Appuyez sur Entrée ou Ctrl+C dans ce terminal pour arrêter le serveur.")
            try:
                input()
            except KeyboardInterrupt:
                pass
            on_close()
