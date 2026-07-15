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

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_spa(path):
        if path and os.path.exists(os.path.join(app.static_folder, path)):
            return app.send_static_file(path)
        return app.send_static_file('index.html')
