import sys
import os
import threading
import time

if len(sys.argv) > 1 and sys.argv[1] == '--projector':
    # We are launched as a subprocess for the projector window
    import webview
    import logging
    from flask import Flask
    from flask_cors import CORS
    from urllib.parse import urlparse, parse_qs
    
    logging.getLogger('pywebview').setLevel(logging.CRITICAL)
    if len(sys.argv) > 2:
        url = sys.argv[2]
        
        parsed_url = urlparse(url)
        params = parse_qs(parsed_url.query)
        api_port = int(params.get('api_port', [5001])[0])
        
        proj_app = Flask('projector_api')
        CORS(proj_app)
        
        window = None
        
        @proj_app.route('/toggle')
        def toggle():
            if window:
                def run():
                    time.sleep(0.05)
                    window.toggle_fullscreen()
                threading.Thread(target=run, daemon=True).start()
            return {"status": "ok"}
            
        def run_flask():
            proj_app.run(host='127.0.0.1', port=api_port, debug=False, threaded=True)
            
        threading.Thread(target=run_flask, daemon=True).start()
        
        window = webview.create_window('Blind Test - Projecteur', url, fullscreen=False, width=1280, height=720)
        webview.start()
    os._exit(0)

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
        webbrowser.open(url_regie)
        
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
