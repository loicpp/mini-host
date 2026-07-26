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

if not exist ".env" (
    echo [ERROR] backend/.env file is missing! The application requires it to build.
    popd
    goto error
)

:: Note the use of semicolon (;) instead of colon (:) for windows add-data
pyinstaller --noconfirm ^
    --onefile ^
    --noconsole ^
    --name MiniHost ^
    --icon="favicon.ico" ^
    --add-data "favicon.ico;." ^
    --add-data "favicon.png;." ^
    --add-data "..\animator-ui\dist;animator-ui\dist" ^
    --add-data ".env;." ^
    --hidden-import "flask" ^
    --hidden-import "flask_cors" ^
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
echo Your executable is located at: backend\dist\MiniHost.exe

echo.
echo ==^> Building Windows Installer (Optional)...

:: Extract version from animator-ui\.env
set "VERSION=1.0.0"
if exist "animator-ui\.env" (
    for /f "tokens=2 delims==" %%i in ('findstr "VITE_APP_VERSION" animator-ui\.env') do (
        set "VERSION=%%i"
    )
)

:: Detect Inno Setup Compiler (ISCC)
set "ISCC_PATH="
where iscc >nul 2>&1
if %errorlevel% equ 0 (
    set "ISCC_PATH=iscc"
) else if exist "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" (
    set "ISCC_PATH=C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
) else if exist "C:\Program Files\Inno Setup 6\ISCC.exe" (
    set "ISCC_PATH=C:\Program Files\Inno Setup 6\ISCC.exe"
)

if defined ISCC_PATH (
    echo Found Inno Setup Compiler at: %ISCC_PATH%
    echo Compiling installer for version %VERSION%...
    if not exist installer mkdir installer
    "%ISCC_PATH%" /DMyAppVersion=%VERSION% installer.iss
    if %errorlevel% neq 0 (
        echo [WARNING] Installer compilation failed.
    ) else (
        echo ==^> Installer created successfully!
        echo Installer is located at: installer\MiniHostSetup.exe
    )
) else (
    echo [INFO] Inno Setup compiler ISCC.exe was not found.
    echo To generate the Windows installer, install Inno Setup from:
    echo https://jrsoftware.org/isdownload.php
    echo and run 'iscc installer.iss' or re-run this script.
)

if not "%GITHUB_ACTIONS%"=="true" pause
exit /b 0

:error
echo [ERROR] Build failed. Please check the logs above.
if not "%GITHUB_ACTIONS%"=="true" pause
exit /b 1
