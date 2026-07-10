import webview
import sys
import logging

logging.getLogger('pywebview').setLevel(logging.CRITICAL)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(1)
        
    url = sys.argv[1]
    
    window = webview.create_window(
        'Blind Test - Projecteur', 
        url,
        fullscreen=False,
        width=1280,
        height=720
    )
    
    webview.start()
