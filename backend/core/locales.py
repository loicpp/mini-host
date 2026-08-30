from typing import Dict

BACKEND_LOCALES: Dict[str, Dict[str, str]] = {
    "fr": {
        "title": "MiniHost - Serveur",
        "running_tk": "Le serveur MiniHost est en cours d'exécution.\n\nFermez cette fenêtre pour tout arrêter.",
        "running_pg_1": "Le serveur MiniHost est en cours d'exécution.",
        "running_pg_2": "Fermez cette fenêtre pour tout arrêter.",
        "dialog_folder_title": "Sélectionnez un dossier de musiques",
        "dialog_files_title": "Sélectionnez des musiques",
        "dialog_audio_files": "Fichiers audio",
        "headless_running": "MiniHost fonctionne en arrière-plan (mode sans interface graphique).",
        "headless_stop": "Appuyez sur Entrée ou Ctrl+C dans ce terminal pour arrêter le serveur."
    },
    "en": {
        "title": "MiniHost - Server",
        "running_tk": "The MiniHost server is running.\n\nClose this window to stop everything.",
        "running_pg_1": "The MiniHost server is running.",
        "running_pg_2": "Close this window to stop everything.",
        "dialog_folder_title": "Select a music folder",
        "dialog_files_title": "Select music tracks",
        "dialog_audio_files": "Audio files",
        "headless_running": "MiniHost is running in the background (headless mode).",
        "headless_stop": "Press Enter or Ctrl+C in this terminal to stop the server."
    }
}

def get_locale(lang: str) -> Dict[str, str]:
    if not lang:
        return BACKEND_LOCALES["fr"]
    lang_code = lang.lower().split("-")[0].split("_")[0]
    return BACKEND_LOCALES.get(lang_code, BACKEND_LOCALES["fr"])
