import os
import re
import subprocess
import sys

def get_latest_git_tag():
    try:
        result = subprocess.run(['git', 'describe', '--tags', '--abbrev=0'], capture_output=True, text=True, check=True)
        tag = result.stdout.strip()
        if tag.startswith('v'):
            return tag[1:]
        return tag
    except subprocess.CalledProcessError:
        return "0.0.0"

def get_current_version(env_path):
    if not os.path.exists(env_path):
        return None
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.startswith('VITE_APP_VERSION='):
                return line.strip().split('=', 1)[1]
    return None

def update_env_version(env_path, new_version):
    # Create the directory if it doesn't exist just in case
    os.makedirs(os.path.dirname(env_path), exist_ok=True)
    
    lines = []
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    
    with open(env_path, 'w', encoding='utf-8') as f:
        found = False
        for line in lines:
            if line.startswith('VITE_APP_VERSION='):
                f.write(f"VITE_APP_VERSION={new_version}\n")
                found = True
            else:
                f.write(line)
        if not found:
            f.write(f"VITE_APP_VERSION={new_version}\n")

def parse_version(v):
    return tuple(map(int, v.split('.')))

def main():
    animator_env = os.path.join('animator-ui', '.env')
    player_env = os.path.join('player-app', '.env')

    git_v = get_latest_git_tag()
    v_animator = get_current_version(animator_env)
    v_player = get_current_version(player_env)
    
    base_v = v_animator if v_animator else (v_player if v_player else git_v)
    if base_v == "0.0.0":
        base_v = "1.0.0"

    print("======================================")
    print("Dernières versions trouvées :")
    print(f" - Git Tag     : {git_v}")
    print(f" - Animator UI : {v_animator or 'Aucune'}")
    print(f" - Player App  : {v_player or 'Aucune'}")
    print(f" -> Version de base utilisée : {base_v}")
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

    confirm = input(f"\nVoulez-vous créer le tag v{new_v} et push ? (y/N) : ").strip().lower()
    if confirm not in ['y', 'yes', 'o', 'oui']:
        print("Opération annulée.")
        sys.exit(0)

    print(f"\nMise à jour des fichiers .env vers la version {new_v}...")
    update_env_version(animator_env, new_v)
    update_env_version(player_env, new_v)
    print("✅ Versions mises à jour dans les .env locaux !")

    try:
        # Verify if tag already exists locally
        tag_exists = False
        try:
            check = subprocess.run(['git', 'rev-parse', f"v{new_v}"], capture_output=True, text=True)
            if check.returncode == 0:
                tag_exists = True
        except Exception:
            pass

        if tag_exists:
            force = input(f"⚠️ Le tag v{new_v} existe déjà localement. Voulez-vous l'écraser (force) ? (y/N) : ").strip().lower()
            if force in ['y', 'yes', 'o', 'oui']:
                subprocess.run(['git', 'tag', '-a', '-f', f"v{new_v}", '-m', f"Release v{new_v}"], check=True)
                print(f"✅ Tag v{new_v} recréé (force).")
            else:
                print("Création du tag annulée.")
                sys.exit(0)
        else:
            subprocess.run(['git', 'tag', '-a', f"v{new_v}", '-m', f"Release v{new_v}"], check=True)
            print(f"✅ Tag v{new_v} créé.")

        push_confirm = input("\nVoulez-vous pousser le tag sur GitHub pour déclencher la Release ? (y/N) : ").strip().lower()
        if push_confirm in ['y', 'yes', 'o', 'oui']:
            if tag_exists:
                subprocess.run(['git', 'push', '-f', 'origin', f"v{new_v}"], check=True)
            else:
                subprocess.run(['git', 'push', 'origin', f"v{new_v}"], check=True)
            print("🚀 Push du tag terminé ! La pipeline de release GitHub Actions va se lancer.")
        else:
            print("Push annulé.")
            
    except subprocess.CalledProcessError as e:
        print(f"❌ Une erreur Git est survenue : {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
