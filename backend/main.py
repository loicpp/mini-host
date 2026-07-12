import sys
import json
import os
import time
import webbrowser
import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS
from music_provider import MusicManager

if len(sys.argv) > 1 and sys.argv[1] == '--projector':
    # We are launched as a subprocess for the projector window
    import webview
    import logging
    logging.getLogger('pywebview').setLevel(logging.CRITICAL)
    if len(sys.argv) > 2:
        url = sys.argv[2]
        webview.create_window('Blind Test - Projecteur', url, fullscreen=False, width=1280, height=720)
        webview.start()
    sys.exit(0)

if getattr(sys, 'frozen', False):
    # Running in a PyInstaller bundle
    bundle_dir = sys._MEIPASS
    static_folder = os.path.join(bundle_dir, 'animator-ui', 'dist')
    template_folder = static_folder # Flask might need this
else:
    # Running normally
    current_dir = os.path.dirname(os.path.abspath(__file__))
    static_folder = os.path.join(current_dir, '..', 'animator-ui', 'dist')
    template_folder = static_folder

config_dir = os.path.expanduser("~/.minihost/blindtest")
os.makedirs(config_dir, exist_ok=True)

app = Flask(__name__, static_folder=static_folder)
print("Static Folder:", app.static_folder)
print("Does static folder exist?", os.path.exists(app.static_folder))
if os.path.exists(app.static_folder):
    print("Files in static folder:", os.listdir(app.static_folder))
CORS(app)

class AnimatorApi:
    def __init__(self):
        self.music_manager = MusicManager()
        self.projector_process = None
        self.dev_mode = '--dev' in sys.argv
    
    def save_config(self, config_data):
        try:
            current = self.load_config() or {}
            current.update(config_data)
            with open(os.path.join(config_dir, "config.json"), "w") as f:
                json.dump(current, f)
        except Exception:
            pass
        return {"status": "ok"}
        
    def load_config(self):
        try:
            cfg_path = os.path.join(config_dir, "config.json")
            
            # Check old path for migration if new one doesn't exist yet
            old_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "regie_config.json")
            if not os.path.exists(cfg_path) and os.path.exists(old_path):
                import shutil
                shutil.copy(old_path, cfg_path)
                
            if os.path.exists(cfg_path):
                with open(cfg_path, "r") as f:
                    return json.load(f)
        except Exception:
            pass
        return {}

    def save_playlists(self, playlists_data):
        with open(os.path.join(config_dir, "playlists.json"), "w") as f:
            json.dump(playlists_data, f)
        return {"status": "ok"}

    def load_playlists(self):
        playlists = []
        try:
            pl_path = os.path.join(config_dir, "playlists.json")
            if os.path.exists(pl_path):
                with open(pl_path, "r") as f:
                    playlists = json.load(f)
            
            cfg_path = os.path.join(config_dir, "config.json")
            if not playlists and os.path.exists(cfg_path):
                with open(cfg_path, "r") as f:
                    config = json.load(f)
                    if "playlists" in config:
                        playlists = config["playlists"]
                        # Save them to the new file
                        self.save_playlists(playlists)
                        # Remove them from old config
                        del config["playlists"]
                        with open(cfg_path, "w") as fw:
                            json.dump(config, fw)
        except Exception:
            pass
        return playlists
    
    def open_projector_window(self, game_id):
        url = f'http://127.0.0.1:5174/public?game={game_id}' if self.dev_mode else f'http://127.0.0.1:5000/public?game={game_id}'
        
        # Stop existing if any
        self.close_projector_window()
        
        # Start a new process for the projector
        # sys.executable points to python normally, or to the MiniHost executable when frozen
        if getattr(sys, 'frozen', False):
            self.projector_process = subprocess.Popen([sys.executable, "--projector", url])
        else:
            self.projector_process = subprocess.Popen([sys.executable, "main.py", "--projector", url])
        return {"status": "ok"}

    def close_projector_window(self):
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
        return {"status": "ok"}

api = AnimatorApi()

@app.route('/api/test_connection')
def test_connection():
    return jsonify({"status": "ok"})

@app.route('/api/config', methods=['GET', 'POST'])
def config():
    if request.method == 'POST':
        return jsonify(api.save_config(request.json))
    return jsonify(api.load_config())

@app.route('/api/playlists', methods=['GET', 'POST'])
def playlists_api():
    if request.method == 'POST':
        return jsonify(api.save_playlists(request.json))
    return jsonify(api.load_playlists())

@app.route('/api/projector/open', methods=['POST'])
def open_projector():
    data = request.json
    game_id = data.get('game_id')
    return jsonify(api.open_projector_window(game_id))

@app.route('/api/projector/close', methods=['POST'])
def close_projector():
    return jsonify(api.close_projector_window())

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_spa(path):
    # Check if the requested file exists in the static folder
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return app.send_static_file(path)
    # Otherwise, return index.html (SPA routing)
    return app.send_static_file('index.html')

if __name__ == '__main__':
    dev_mode = "--dev" in sys.argv
    
    if dev_mode:
        url_regie = 'http://127.0.0.1:5174/'
    else:
        url_regie = 'http://127.0.0.1:5000/' # Assuming flask would serve static files
        
    import threading
    import webbrowser
    import tkinter as tk
    
    def run_flask():
        # Run flask in a daemon thread
        app.run(port=5000, use_reloader=False)
        
    threading.Thread(target=run_flask, daemon=True).start()
    
    def open_browser():
        time.sleep(1)
        webbrowser.open(url_regie)
        
    threading.Thread(target=open_browser, daemon=True).start()
    
    # Create a simple Tkinter window to act as the server controller
    root = tk.Tk()
    root.title("MiniHost - Serveur")
    root.geometry("400x200")
    
    # Set window icon
    try:
        if getattr(sys, 'frozen', False):
            ico_path = os.path.join(sys._MEIPASS, 'favicon.ico')
        else:
            ico_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'favicon.ico')
        if os.path.exists(ico_path):
            root.iconbitmap(ico_path)
    except Exception as e:
        print("Could not set window icon:", e)
    
    lbl = tk.Label(root, text="Le serveur MiniHost est en cours d'exécution.\n\nFermez cette fenêtre pour tout arrêter.", justify="center", padx=20, pady=50)
    lbl.pack(expand=True)
    
    def on_close():
        api.close_projector_window()
        root.destroy()
        sys.exit(0)
        
    root.protocol("WM_DELETE_WINDOW", on_close)
    root.mainloop()
