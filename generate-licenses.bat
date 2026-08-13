@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo ===========================================
echo    MiniHost - Generateur de Licences       
echo ===========================================

rem Vérifier si Python est installé
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Python n'est pas installe ou n'est pas dans le PATH.
    pause
    exit /b 1
)

python tools\generate_licenses.py

if %errorlevel% neq 0 (
    echo [ERREUR] Le script de generation a echoue.
    pause
    exit /b 1
)

pause
exit /b 0
