@echo off
setlocal

echo ==^> Building Animator UI (Frontend)...
pushd animator-ui
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed.
    popd
    goto error
)
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] npm run build failed.
    popd
    goto error
)
popd

echo ==^> Preparing Python Environment...
pushd backend
if not exist venv (
    python -m venv venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment.
        popd
        goto error
    )
)

call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo [ERROR] Failed to activate virtual environment.
    popd
    goto error
)

echo ==^> Installing backend dependencies...
python -m pip install --upgrade pip
if %errorlevel% neq 0 (
    echo [WARNING] Failed to upgrade pip. Continuing...
)

python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install requirements from requirements.txt.
    popd
    goto error
)

python -m pip install pyinstaller
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install PyInstaller.
    popd
    goto error
)

echo ==^> Building Executable with PyInstaller...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
if exist MiniHost.spec del MiniHost.spec

:: Note the use of semicolon (;) instead of colon (:) for windows add-data
pyinstaller --noconfirm ^
    --noconsole ^
    --name MiniHost ^
    --icon="favicon.ico" ^
    --add-data "favicon.ico;." ^
    --add-data "favicon.png;." ^
    --add-data "..\animator-ui\dist;animator-ui\dist" ^
    --hidden-import "flask" ^
    --hidden-import "flask_cors" ^
    --hidden-import "webview" ^
    --hidden-import "core" ^
    --hidden-import "infrastructure" ^
    --hidden-import "controllers" ^
    --paths "." ^
    main.py

if %errorlevel% neq 0 (
    echo [ERROR] PyInstaller compilation failed.
    popd
    goto error
)

popd

echo ==^> Build complete!
echo Your executable is located at: backend\dist\MiniHost\MiniHost.exe
pause
exit /b 0

:error
echo [ERROR] Build failed. Please check the logs above.
pause
exit /b 1
