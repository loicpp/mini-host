@echo off
echo ==^> Building Animator UI (Frontend)...
cd animator-ui
call npm install
call npm run build
cd ..

echo ==^> Preparing Python Environment...
cd backend
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt
pip install pyinstaller

echo ==^> Building Executable with PyInstaller...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
if exist MiniHost.spec del MiniHost.spec

:: Note the use of semicolon (;) instead of colon (:) for windows add-data
pyinstaller --noconfirm ^
    --name MiniHost ^
    --add-data "..\animator-ui\dist;animator-ui\dist" ^
    --hidden-import "flask" ^
    --hidden-import "flask_cors" ^
    --hidden-import "webview" ^
    main.py

echo ==^> Build complete!
echo Your executable is located at: backend\dist\MiniHost\MiniHost.exe
pause
