import os
import re
import subprocess
import sys

def get_current_version(env_path):
    if not os.path.exists(env_path):
        return "0.0.0"
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.startswith('VITE_APP_VERSION='):
                return line.strip().split('=', 1)[1]
    return "0.0.0"

def update_env_version(env_path, new_version):
    if not os.path.exists(env_path):
        return
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

    v_animator = get_current_version(animator_env)
    v_player = get_current_version(player_env)

    print("======================================")
    print("Dernières versions trouvées :")
    print(f" - Animator UI : {v_animator}")
    print(f" - Player App  : {v_player}")
    print("======================================")

    parts = v_animator.split('.')
    if len(parts) == 3 and all(p.isdigit() for p in parts):
        v_major, v_minor, v_patch = map(int, parts)
        opt_major = f"{v_major + 1}.0.0"
        opt_minor = f"{v_major}.{v_minor + 1}.0"
        opt_patch = f"{v_major}.{v_minor}.{v_patch + 1}"
    else:
        opt_major, opt_minor, opt_patch = "1.0.0", "0.1.0", "0.0.1"

    print("\nQuel type de mise à jour souhaitez-vous faire ?")
    print(f" 1) Majeure ({opt_major})")
    print(f" 2) Mineure ({opt_minor})")
    print(f" 3) Patch   ({opt_patch}) - Par défaut")
    print(" Ou tapez directement la nouvelle version (ex: 1.2.3)")
    
    choice = input("\nVotre choix [3] : ").strip()
    
    if not choice or choice == '3':
        new_v = opt_patch
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
        old_tuple = parse_version(v_animator)
        new_tuple = parse_version(new_v)
        if new_tuple <= old_tuple:
            print(f"❌ La nouvelle version ({new_v}) doit être supérieure à l'ancienne ({v_animator}).")
            sys.exit(1)
    except ValueError:
        pass

    print(f"\nMise à jour des fichiers .env vers la version {new_v}...")
    update_env_version(animator_env, new_v)
    update_env_version(player_env, new_v)
    print("✅ Versions mises à jour !")

    confirm = input(f"\nVoulez-vous commit, créer le tag v{new_v} et push ? (y/N) : ").strip().lower()
    if confirm not in ['y', 'yes', 'o', 'oui']:
        print("Opération annulée.")
        sys.exit(0)

    try:
        # Note: .env files are often in .gitignore, so we force add them if needed, 
        subprocess.run(['git', 'commit', '-a', '-m', f"Bump version to {new_v}"], check=False)
        
        # Create tag
        subprocess.run(['git', 'tag', '-a', f"v{new_v}", '-m', f"Release v{new_v}"], check=True)
        print(f"✅ Tag v{new_v} créé.")

        push_confirm = input("\nVoulez-vous pousser le code et le tag sur GitHub pour déclencher la Release ? (y/N) : ").strip().lower()
        if push_confirm in ['y', 'yes', 'o', 'oui']:
            subprocess.run(['git', 'push', 'origin', 'main'], check=True)
            subprocess.run(['git', 'push', 'origin', f"v{new_v}"], check=True)
            print("🚀 Push terminé ! La pipeline de release GitHub Actions va se lancer d'ici quelques secondes.")
        else:
            print("Push annulé.")
            
    except subprocess.CalledProcessError as e:
        print(f"❌ Une erreur Git est survenue : {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
