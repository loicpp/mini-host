#!/usr/bin/env python3
import os
import sys
import json
import shutil
import argparse
import subprocess
import urllib.request
import urllib.error
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent.resolve()
PLAYER_DIR = ROOT_DIR / "player-app"
HOSTED_DIR = PLAYER_DIR / "hosted-releases"
FIREBASE_JSON_PATH = PLAYER_DIR / "firebase.json"
CONFIG_PATH = PLAYER_DIR / "hosting-config.json"
REMOTE_HOSTING_URL = "https://minihostapp-1.web.app"
MANIFEST_FILENAME = "versions-manifest.json"

def log(msg, emoji="ℹ️"):
    print(f"{emoji} {msg}")

def load_hosting_config():
    if CONFIG_PATH.exists():
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def ensure_dependencies():
    if not (PLAYER_DIR / "node_modules").exists():
        log("Installation des dépendances npm dans player-app...", "📦")
        cmd_install = ["npm", "ci"]
        if os.name == "nt":
            cmd_install = ["cmd", "/c", "npm", "ci"]
        res_inst = subprocess.run(cmd_install, cwd=PLAYER_DIR)
        if res_inst.returncode != 0:
            cmd_install = ["npm", "install"]
            if os.name == "nt":
                cmd_install = ["cmd", "/c", "npm", "install"]
            subprocess.run(cmd_install, cwd=PLAYER_DIR, check=True)

def get_remote_manifest():
    url = f"{REMOTE_HOSTING_URL}/{MANIFEST_FILENAME}"
    log(f"Vérification du manifeste distant sur {url}...")
    try:
        req = urllib.request.Request(
            url,
            headers={'User-Agent': 'MiniHost-Deploy/1.0'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            content_type = response.headers.get_content_type()
            raw_data = response.read().decode('utf-8')
            # Firebase rewrites missing files to HTML index.html, check content-type or structure
            if 'text/html' in content_type or raw_data.strip().startswith('<!doctype') or raw_data.strip().startswith('<html'):
                log("Aucun manifeste distant trouvé (page HTML retournée).", "⚠️")
                return None
            data = json.loads(raw_data)
            if isinstance(data, dict) and "active_versions" in data:
                log(f"Manifeste distant récupéré. Versions actives : {data.get('active_versions')}", "✅")
                return data
    except Exception as e:
        log(f"Impossible de récupérer le manifeste distant : {e}", "⚠️")
    return None

def pull_remote_versions(target_version=None, delete_versions=None):
    delete_versions = set(delete_versions or [])
    manifest = get_remote_manifest()
    if not manifest:
        log("Aucune version distante à récupérer.", "ℹ️")
        return

    HOSTED_DIR.mkdir(parents=True, exist_ok=True)
    active_versions = manifest.get("active_versions", [])
    files_map = manifest.get("files", {})

    for ver in active_versions:
        if ver == target_version:
            log(f"La version {ver} est la version cible en cours de compilation, pas besoin de la télécharger.", "⏩")
            continue
        if ver in delete_versions:
            log(f"La version {ver} est marquée pour suppression, elle ne sera pas téléchargée.", "🗑️")
            continue

        ver_files = files_map.get(ver, [])
        if not ver_files:
            continue

        log(f"Téléchargement de la version distante {ver} ({len(ver_files)} fichiers)...", "📥")
        ver_dir = HOSTED_DIR / ver
        ver_dir.mkdir(parents=True, exist_ok=True)

        for rel_file in ver_files:
            file_url = f"{REMOTE_HOSTING_URL}/{ver}/{rel_file}"
            local_file = ver_dir / rel_file
            local_file.parent.mkdir(parents=True, exist_ok=True)
            try:
                urllib.request.urlretrieve(file_url, local_file)
            except Exception as err:
                log(f"Erreur lors du téléchargement de {file_url} : {err}", "⚠️")

def build_player_version(version_name):
    ensure_dependencies()
    log(f"Compilation de player-app pour la version '{version_name}' (base: /{version_name}/)...", "🔨")
    env = os.environ.copy()
    env["VITE_APP_BASE_PATH"] = f"/{version_name}/"
    env["VITE_APP_VERSION"] = version_name

    cmd = ["npm", "run", "build"]
    if os.name == "nt":
        cmd = ["cmd", "/c", "npm", "run", "build"]

    res = subprocess.run(cmd, cwd=PLAYER_DIR, env=env)
    if res.returncode != 0:
        log("Erreur lors de la compilation Vite de player-app !", "❌")
        sys.exit(1)

    dist_dir = PLAYER_DIR / "dist"
    target_dir = HOSTED_DIR / version_name

    if target_dir.exists():
        shutil.rmtree(target_dir)

    target_dir.mkdir(parents=True, exist_ok=True)
    shutil.copytree(dist_dir, target_dir, dirs_exist_ok=True)
    log(f"Version '{version_name}' installée dans {target_dir.relative_to(ROOT_DIR)}.", "✅")

def get_hosted_versions():
    if not HOSTED_DIR.exists():
        return []
    versions = []
    for item in HOSTED_DIR.iterdir():
        if item.is_dir() and not item.name.startswith("."):
            if (item / "index.html").exists():
                versions.append(item.name)
    return sorted(versions)

def remove_version(version_name):
    ver_dir = HOSTED_DIR / version_name
    if ver_dir.exists():
        shutil.rmtree(ver_dir)
        log(f"Version '{version_name}' supprimée localement.", "🗑️")
    else:
        log(f"Version '{version_name}' introuvable dans {HOSTED_DIR}.", "⚠️")

def semver_sort_key(v):
    # Sort semver versions (e.g. 1.2.3), 'dev' is sorted lower than semver
    if v == "dev":
        return (-1, 0, 0, 0)
    parts = []
    for p in v.split('.'):
        try:
            parts.append(int(p))
        except ValueError:
            parts.append(0)
    while len(parts) < 3:
        parts.append(0)
    return (1, *parts[:3])

def update_manifest_and_firebase(active_versions):
    HOSTED_DIR.mkdir(parents=True, exist_ok=True)
    
    # Determine latest semver version
    semver_versions = [v for v in active_versions if v != "dev"]
    if semver_versions:
        semver_versions.sort(key=semver_sort_key, reverse=True)
        latest_version = semver_versions[0]
    elif active_versions:
        latest_version = active_versions[0]
    else:
        latest_version = "dev"

    # Scan files for each version
    files_map = {}
    for ver in active_versions:
        ver_dir = HOSTED_DIR / ver
        file_list = []
        if ver_dir.exists():
            for root, _, files in os.walk(ver_dir):
                for f in files:
                    full_p = Path(root) / f
                    rel_p = full_p.relative_to(ver_dir).as_posix()
                    file_list.append(rel_p)
        files_map[ver] = sorted(file_list)

    manifest_data = {
        "active_versions": active_versions,
        "latest_version": latest_version,
        "files": files_map
    }

    manifest_path = HOSTED_DIR / MANIFEST_FILENAME
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2)
    log(f"Fichier {MANIFEST_FILENAME} mis à jour.", "✅")

    # Generate root index.html (redirect to latest)
    root_index_path = HOSTED_DIR / "index.html"
    root_index_html = f"""<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MiniHost Player</title>
    <script>
      (function() {{
        var latest = "{latest_version}";
        var search = window.location.search || "";
        var hash = window.location.hash || "";
        window.location.replace("/" + latest + "/" + search + hash);
      }})();
    </script>
  </head>
  <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fafafa; color: #333;">
    <p>Redirection vers MiniHost Player ({latest_version})...</p>
  </body>
</html>
"""
    with open(root_index_path, "w", encoding="utf-8") as f:
        f.write(root_index_html)
    log(f"Page racine index.html (redirection vers /{latest_version}/) générée.", "✅")

    # Update firebase.json
    rewrites = []
    for ver in active_versions:
        rewrites.append({
            "source": f"/{ver}/**",
            "destination": f"/{ver}/index.html"
        })
    rewrites.append({
        "source": "**",
        "destination": f"/{latest_version}/index.html"
    })

    firebase_config = {
        "hosting": {
            "public": "hosted-releases",
            "ignore": [
                "firebase.json",
                "**/.*",
                "**/node_modules/**"
            ],
            "rewrites": rewrites
        }
    }

    with open(FIREBASE_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(firebase_config, f, indent=2)
    log("Fichier firebase.json mis à jour avec les règles de réécriture multi-versions.", "✅")

    return latest_version

def deploy_firebase():
    log("Déploiement sur Firebase Hosting...", "🚀")
    cmd = ["npx", "firebase", "deploy", "--only", "hosting"]
    if os.name == "nt":
        cmd = ["cmd", "/c", "npx", "firebase", "deploy", "--only", "hosting"]
    
    token = os.environ.get("FIREBASE_TOKEN")
    if token:
        cmd.extend(["--token", token])

    res = subprocess.run(cmd, cwd=PLAYER_DIR)
    if res.returncode != 0:
        log("Échec du déploiement Firebase Hosting !", "❌")
        sys.exit(res.returncode)
    log("Déploiement Firebase Hosting terminé avec succès !", "🎉")

def main():
    parser = argparse.ArgumentParser(description="Gestionnaire de déploiement multi-version de Player-App sur Firebase Hosting.")
    parser.add_argument("--dev", action="store_true", help="Compiler et déployer la version /dev/")
    parser.add_argument("--version", type=str, help="Version spécifique à compiler et déployer (ex: 1.0.0)")
    parser.add_argument("--delete", nargs="+", help="Version(s) à supprimer du déploiement")
    parser.add_argument("--no-pull", action="store_true", help="Ne pas télécharger les versions distantes existantes")
    parser.add_argument("--no-deploy", action="store_true", help="Préparer le dossier de build sans lancer le déploiement Firebase")
    parser.add_argument("--list", action="store_true", help="Lister les versions actuellement hébergées")

    args = parser.parse_args()

    if args.list:
        manifest = get_remote_manifest()
        if manifest:
            print("\nVersions actives sur Firebase Hosting :")
            for v in manifest.get("active_versions", []):
                is_latest = " (latest)" if v == manifest.get("latest_version") else ""
                print(f" - {v}{is_latest} -> {REMOTE_HOSTING_URL}/{v}/")
        else:
            print("\nAucun manifeste distant trouvé.")
        return

    config = load_hosting_config()
    configured_deletions = set(config.get("deleted_versions", []))
    delete_targets = set(args.delete or []).union(configured_deletions)

    target_ver = None
    if args.dev:
        target_ver = "dev"
    elif args.version:
        target_ver = args.version.lstrip("v")

    if not target_ver and not delete_targets:
        print("❌ Spécifiez soit --dev, soit --version X.Y.Z, soit --delete X.Y.Z")
        parser.print_help()
        sys.exit(1)

    # 1. Pull existing versions from remote if needed
    if not args.no_pull:
        pull_remote_versions(target_version=target_ver, delete_versions=delete_targets)

    # 2. Delete versions if requested
    for del_ver in delete_targets:
        remove_version(del_ver)

    # 3. Build target version if specified
    if target_ver:
        build_player_version(target_ver)

    # 4. Update manifest and firebase.json
    active_versions = get_hosted_versions()
    # Ensure deleted versions are not present
    active_versions = [v for v in active_versions if v not in delete_targets]

    if not active_versions:
        log("Aucune version active à déployer !", "❌")
        sys.exit(1)

    latest = update_manifest_and_firebase(active_versions)

    log(f"Versions prêtes à être servies : {', '.join(active_versions)} (latest: {latest})", "📋")

    # 5. Deploy to Firebase
    if not args.no_deploy:
        deploy_firebase()
    else:
        log("Mode --no-deploy actif : déploiement ignoré.", "ℹ️")

if __name__ == "__main__":
    main()
