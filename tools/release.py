import os
import re
import subprocess
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent.resolve()
sys.path.insert(0, str(ROOT_DIR / "tools"))

def get_latest_git_tag():
    print("Synchronisation des tags avec le dépôt distant...")
    try:
        # Synchro et nettoyage des tags supprimés sur origin
        subprocess.run(['git', 'fetch', 'origin', '--prune', '+refs/tags/*:refs/tags/*'], capture_output=True, text=True, check=False)
    except Exception as e:
        print(f"⚠️ Impossible de synchroniser les tags distants : {e}")

    try:
        res = subprocess.run(['git', 'tag', '-l', 'v*', '--sort=-version:refname'], capture_output=True, text=True, check=True)
        tags = [t.strip() for t in res.stdout.splitlines() if t.strip()]
        if tags:
            tag = tags[0]
            if tag.startswith('v'):
                return tag[1:]
            return tag
    except Exception:
        pass

    try:
        result = subprocess.run(['git', 'describe', '--tags', '--abbrev=0'], capture_output=True, text=True, check=True)
        tag = result.stdout.strip()
        if tag.startswith('v'):
            return tag[1:]
        return tag
    except Exception:
        pass

    return "0.0.0"

def parse_version(v):
    return tuple(map(int, v.split('.')))

def regenerate_licenses(version):
    print("\n📜 1. Régénération des licences open source...")
    gen_script = ROOT_DIR / "tools" / "generate_licenses.py"
    res = subprocess.run([sys.executable, str(gen_script)], cwd=ROOT_DIR)
    if res.returncode != 0:
        print("❌ Erreur lors de la régénération des licences. Abandon de la release.")
        sys.exit(1)

    # Vérification des fichiers modifiés dans Git
    status_res = subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True, cwd=ROOT_DIR)
    changed_files = [line.strip().split()[-1] for line in status_res.stdout.splitlines() if line.strip()]
    license_files = [
        f for f in changed_files 
        if 'license' in f.lower() or f.endswith('LICENSE.md') or f.endswith('licenses.json')
    ]

    if license_files:
        print(f"📝 Commit des fichiers de licences mis à jour : {', '.join(license_files)}")
        subprocess.run(['git', 'add'] + license_files, check=True, cwd=ROOT_DIR)
        subprocess.run(['git', 'commit', '-m', f"chore: update licenses for v{version}"], check=True, cwd=ROOT_DIR)
        print("✅ Commit de mise à jour des licences effectué.")
    else:
        print("✅ Les licences sont déjà à jour.")

def main():
    git_v = get_latest_git_tag()
    
    base_v = git_v
    if base_v == "0.0.0":
        base_v = "1.0.0"

    print("======================================")
    print(f"Dernière version trouvée (Git Tag) : {git_v}")
    print(f"Version de base utilisée           : {base_v}")
    print("======================================")

    try:
        is_missing_tag = False
        if git_v != "0.0.0" and base_v != "0.0.0":
            if parse_version(base_v) > parse_version(git_v):
                is_missing_tag = True
    except ValueError:
        is_missing_tag = False

    parts = base_v.split('.')
    if len(parts) == 3 and all(p.isdigit() for p in parts):
        v_major, v_minor, v_patch = map(int, parts)
        opt_major = f"{v_major + 1}.0.0"
        opt_minor = f"{v_major}.{v_minor + 1}.0"
        opt_patch = base_v if is_missing_tag else f"{v_major}.{v_minor}.{v_patch + 1}"
    else:
        opt_major, opt_minor, opt_patch = "1.0.0", "0.1.0", base_v if is_missing_tag else "0.0.1"

    print("\nQuel type de mise à jour souhaitez-vous faire ?")
    print(f" 0) Actuelle ({base_v}) - Relancer/Recréer le tag")
    print(f" 1) Majeure ({opt_major})")
    print(f" 2) Mineure ({opt_minor})")
    print(f" 3) Patch   ({opt_patch}) - Par défaut")
    print(" Ou tapez directement la nouvelle version (ex: 1.2.3)")
    
    choice = input("\nVotre choix [3] : ").strip()
    
    if not choice or choice == '3':
        new_v = opt_patch
    elif choice == '0':
        new_v = base_v
    elif choice == '1':
        new_v = opt_major
    elif choice == '2':
        new_v = opt_minor
    else:
        new_v = choice

    if not re.match(r'^[0-9]+\.[0-9]+\.[0-9]+$', new_v):
        print("❌ Format de version invalide. Doit être X.X.X")
        sys.exit(1)

    # Check if new version is greater
    try:
        old_tuple = parse_version(base_v)
        new_tuple = parse_version(new_v)
        if new_tuple <= old_tuple:
            downgrade_confirm = input(f"⚠️ La nouvelle version ({new_v}) est inférieure ou égale à l'ancienne ({base_v}). Êtes-vous sûr de vouloir continuer ? (y/N) : ").strip().lower()
            if downgrade_confirm not in ['y', 'yes', 'o', 'oui']:
                print("Opération annulée.")
                sys.exit(0)
    except ValueError:
        pass

    # Option de suppression d'anciennes versions sur Firebase Hosting
    delete_versions = []
    try:
        from deploy_player import get_remote_manifest
        manifest = get_remote_manifest()
        if manifest and manifest.get("active_versions"):
            active = manifest.get("active_versions")
            print(f"\nVersions actuellement actives sur Firebase Hosting : {', '.join(active)}")
            del_input = input("Souhaitez-vous supprimer une ou plusieurs versions obsolètes ? (séparez par des espaces, ou Entrée pour ignorer) : ").strip()
            if del_input:
                delete_versions = [v.strip().lstrip('v') for v in del_input.split() if v.strip()]
                print(f"Versions sélectionnées pour suppression dans la pipeline : {', '.join(delete_versions)}")
                # Enregistrer dans player-app/hosting-config.json pour la pipeline CI
                import json
                config_path = ROOT_DIR / "player-app" / "hosting-config.json"
                config = {}
                if config_path.exists():
                    try:
                        with open(config_path, "r", encoding="utf-8") as f:
                            config = json.load(f)
                    except Exception:
                        pass
                config["deleted_versions"] = delete_versions
                with open(config_path, "w", encoding="utf-8") as f:
                    json.dump(config, f, indent=2)
                subprocess.run(['git', 'add', str(config_path)], check=True, cwd=ROOT_DIR)
    except Exception as e:
        print(f"⚠️ Impossible de vérifier les versions distantes : {e}")

    confirm = input(f"\nVoulez-vous lancer la release pour la version v{new_v} ? (y/N) : ").strip().lower()
    if confirm not in ['y', 'yes', 'o', 'oui']:
        print("Opération annulée.")
        sys.exit(0)

    # 1. Régénération des licences AVANT le tag
    regenerate_licenses(new_v)

    # 2. Création du tag Git
    print(f"\n🏷️ 2. Création du tag Git v{new_v}...")
    try:
        tag_exists = False
        try:
            check = subprocess.run(['git', 'rev-parse', f"v{new_v}"], capture_output=True, text=True, cwd=ROOT_DIR)
            if check.returncode == 0:
                tag_exists = True
        except Exception:
            pass

        if tag_exists:
            force = input(f"⚠️ Le tag v{new_v} existe déjà localement. Voulez-vous l'écraser (force) ? (y/N) : ").strip().lower()
            if force in ['y', 'yes', 'o', 'oui']:
                subprocess.run(['git', 'tag', '-a', '-f', f"v{new_v}", '-m', f"Release v{new_v}"], check=True, cwd=ROOT_DIR)
                print(f"✅ Tag v{new_v} recréé (force).")
            else:
                print("Création du tag annulée.")
                sys.exit(0)
        else:
            subprocess.run(['git', 'tag', '-a', f"v{new_v}", '-m', f"Release v{new_v}"], check=True, cwd=ROOT_DIR)
            print(f"✅ Tag v{new_v} créé.")

        # 3. Push vers GitHub
        push_confirm = input("\nVoulez-vous pousser la branche et le tag sur GitHub pour déclencher le déploiement et la Release ? (y/N) : ").strip().lower()
        if push_confirm in ['y', 'yes', 'o', 'oui']:
            current_branch = subprocess.run(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], capture_output=True, text=True, cwd=ROOT_DIR).stdout.strip() or 'main'
            subprocess.run(['git', 'push', 'origin', current_branch], check=True, cwd=ROOT_DIR)
            if tag_exists:
                subprocess.run(['git', 'push', '-f', 'origin', f"v{new_v}"], check=True, cwd=ROOT_DIR)
            else:
                subprocess.run(['git', 'push', 'origin', f"v{new_v}"], check=True, cwd=ROOT_DIR)
            print("🚀 Push terminé ! Les workflows GitHub Actions vont compiler les exécutables Linux et Windows.")
        else:
            print("Push annulé. Vous pourrez pousser manuellement avec :")
            print(f"  git push origin HEAD && git push origin v{new_v}")
            
    except subprocess.CalledProcessError as e:
        print(f"❌ Une erreur Git est survenue : {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()

