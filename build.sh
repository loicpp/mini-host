#!/bin/bash
echo "==> Building Animator UI (Frontend)..."
cd animator-ui
npm install
npm run build
cd ..

echo "==> Preparing Python Environment..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
pip install pyinstaller

echo "==> Building Executable with PyInstaller..."
# Remove previous builds
rm -rf build dist MiniHost.spec

# Create PyInstaller executable
# --add-data includes the frontend dist folder in the executable
# --add-data includes projector.py script since it's called as a subprocess
pyinstaller --noconfirm \
    --name MiniHost \
    --icon="favicon.ico" \
    --add-data "favicon.ico:." \
    --add-data "../animator-ui/dist:animator-ui/dist" \
    --hidden-import "flask" \
    --hidden-import "flask_cors" \
    --hidden-import "webview" \
    main.py

echo "==> Build complete!"
echo "Your executable is located at: backend/dist/MiniHost/MiniHost"
echo "You can double click this file or run it via terminal to start the server and open the browser."
