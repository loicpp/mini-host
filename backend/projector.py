import webview
import sys
import logging
import threading
import time
from flask import Flask
from flask_cors import CORS
from urllib.parse import urlparse, parse_qs

logging.getLogger('pywebview').setLevel(logging.CRITICAL)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(1)
        
    url = sys.argv[1]
    
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
    
    window = webview.create_window(
        'Blind Test - Projecteur', 
        url,
        fullscreen=False,
        width=1280,
        height=720
    )
    
    webview.start()
    import os
    os._exit(0)



