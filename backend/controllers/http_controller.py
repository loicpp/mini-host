import os
from flask import request, jsonify, Flask
from core.animator_api import AnimatorApi

def register_routes(app: Flask, api: AnimatorApi):
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

    @app.route('/api/soundcloud/search', methods=['GET'])
    def soundcloud_search():
        query = request.args.get('q', '')
        if not query:
            return jsonify([])
        return jsonify(api.search_soundcloud(query))

    @app.route('/api/game', methods=['GET', 'POST'])
    def game_state_api():
        if request.method == 'POST':
            return jsonify(api.save_game_state(request.json))
        return jsonify(api.load_game_state())

    @app.route('/api/projector/open', methods=['POST'])
    def open_projector():
        data = request.json
        game_id = data.get('game_id')
        return jsonify(api.open_projector_window(game_id))

    @app.route('/api/projector/close', methods=['POST'])
    def close_projector():
        return jsonify(api.close_projector_window())

    @app.route('/api/dialog/folder')
    def dialog_folder():
        import tkinter as tk
        from tkinter import filedialog
        import glob
        
        try:
            root = tk.Tk()
            root.withdraw()
            root.attributes('-topmost', True)
            folder_path = filedialog.askdirectory(parent=root, title="Sélectionnez un dossier de musiques")
            root.destroy()
            
            if not folder_path:
                return jsonify([])
                
            files = []
            for ext in ('*.mp3', '*.wav', '*.ogg', '*.MP3', '*.WAV', '*.OGG'):
                files.extend(glob.glob(os.path.join(folder_path, ext)))
            return jsonify(files)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/dialog/file')
    def dialog_file():
        import tkinter as tk
        from tkinter import filedialog
        
        try:
            root = tk.Tk()
            root.withdraw()
            root.attributes('-topmost', True)
            files = filedialog.askopenfilenames(
                parent=root,
                title="Sélectionnez des musiques",
                filetypes=[("Fichiers audio", "*.mp3 *.wav *.ogg")]
            )
            root.destroy()
            
            if not files:
                return jsonify([])
            return jsonify(list(files))
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/stream')
    def stream_file():
        from flask import send_file
        path = request.args.get('path')
        if not path or not os.path.exists(path) or not os.path.isfile(path):
            return "File not found", 404
        return send_file(path, conditional=True)

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_spa(path):
        if path and os.path.exists(os.path.join(app.static_folder, path)):
            return app.send_static_file(path)
        return app.send_static_file('index.html')
