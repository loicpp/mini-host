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
    --add-data "favicon.png:." \
    --add-data "../animator-ui/dist:animator-ui/dist" \
    --hidden-import "flask" \
    --hidden-import "flask_cors" \
    --hidden-import "webview" \
    --hidden-import "core" \
    --hidden-import "infrastructure" \
    --hidden-import "controllers" \
    --paths "." \
    main.py

echo "==> Nettoyage des bibliothèques systèmes en conflit (Linux)..."
rm -f dist/MiniHost/_internal/libglib-2.0.so* \
      dist/MiniHost/_internal/libgobject-2.0.so* \
      dist/MiniHost/_internal/libgio-2.0.so* \
      dist/MiniHost/_internal/libgmodule-2.0.so* \
      dist/MiniHost/_internal/libgtk-3.so* \
      dist/MiniHost/_internal/libgdk-3.so* \
      dist/MiniHost/_internal/libX*.so* \
      dist/MiniHost/_internal/libwayland*.so* \
      dist/MiniHost/_internal/libxkbcommon*.so* \
      dist/MiniHost/_internal/libdrm*.so* \
      dist/MiniHost/_internal/libffi.so* \
      dist/MiniHost/_internal/libstdc++.so* \
      dist/MiniHost/_internal/libgcc_s.so*

echo "==> Suppression des définitions WebKit embarquées pour forcer l'usage de la version locale (4.0 ou 4.1)..."
find dist/MiniHost -name "WebKit2*.typelib" -delete

echo "==> Build complete!"
echo "Your executable is located at: backend/dist/MiniHost/MiniHost"
echo "You can double click this file or run it via terminal to start the server and open the browser."
