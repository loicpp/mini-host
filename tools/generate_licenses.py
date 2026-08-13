import os
import sys
import json
import subprocess
import datetime
from pathlib import Path

# Paths
ROOT_DIR = Path(__file__).parent.parent.resolve()
BACKEND_DIR = ROOT_DIR / "backend"
ANIMATOR_DIR = ROOT_DIR / "animator-ui"
PLAYER_DIR = ROOT_DIR / "player-app"
VENV_PYTHON = BACKEND_DIR / "venv" / "bin" / "python"
PIP_LICENSES = BACKEND_DIR / "venv" / "bin" / "pip-licenses"
if os.name == 'nt':
    VENV_PYTHON = BACKEND_DIR / "venv" / "Scripts" / "python.exe"
    PIP_LICENSES = BACKEND_DIR / "venv" / "Scripts" / "pip-licenses.exe"

AUTHOR_NAME = "MiniHost Team"
CURRENT_YEAR = datetime.datetime.now().year

MIT_LICENSE = f"""MIT License

Copyright (c) {CURRENT_YEAR} {AUTHOR_NAME}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""

def run_cmd(cmd, cwd=ROOT_DIR, capture_output=True, shell=False, env=None):
    try:
        result = subprocess.run(cmd, cwd=cwd, capture_output=capture_output, text=True, check=True, shell=shell, env=env)
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur lors de l'exécution de la commande: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
        if capture_output:
            print(f"Sortie erreur:\n{e.stderr}")
        sys.exit(1)

def ensure_tools():
    print("🔍 Vérification des outils nécessaires...")
    # Check if license-checker is available globally
    try:
        subprocess.run(["license-checker", "--version"], capture_output=True, check=True, shell=(os.name == 'nt'))
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("📥 Installation de license-checker (globale)...")
        run_cmd(["npm", "install", "-g", "license-checker"], shell=(os.name == 'nt'))

    # Check if pip-licenses is installed in the backend venv
    try:
        run_cmd([str(PIP_LICENSES), "--version"])
    except SystemExit:
        print("📥 Installation de pip-licenses dans le backend...")
        run_cmd([str(VENV_PYTHON), "-m", "pip", "install", "pip-licenses"])

def run_npm_ci(target_dir):
    print(f"📦 Installation des dépendances via npm ci dans {target_dir.name}...")
    run_cmd(["npm", "ci"], cwd=target_dir, capture_output=False, shell=(os.name == 'nt'))

def get_node_licenses(target_dir):
    print(f"🔎 Extraction des licences Node.js depuis {target_dir.name}...")
    output = run_cmd(["license-checker", "--production", "--json"], cwd=target_dir, shell=(os.name == 'nt'))
    return json.loads(output)

def get_python_licenses():
    print("🔎 Extraction des licences Python depuis backend...")
    env = os.environ.copy()
    env.pop("PYTHONPATH", None)
    output = run_cmd([str(PIP_LICENSES), "--format=json", "--with-license-file"], cwd=BACKEND_DIR, env=env)
    return json.loads(output)

def parse_node_package_name(pkg_key):
    # e.g., "vue@3.5.39" -> "vue", "@lucide/vue@1.25.0" -> "@lucide/vue"
    parts = pkg_key.split('@')
    if pkg_key.startswith('@'):
        return '@' + parts[1]
    return parts[0]

def parse_node_package_version(pkg_key):
    parts = pkg_key.split('@')
    return parts[-1]

def main():
    print("🚀 Début de la génération des licences...")
    if not VENV_PYTHON.exists():
        print(f"❌ Erreur: L'environnement virtuel du backend n'a pas été trouvé à {VENV_PYTHON}")
        sys.exit(1)

    ensure_tools()

    # Update dependencies
    run_npm_ci(ANIMATOR_DIR)
    run_npm_ci(PLAYER_DIR)

    animator_licenses = get_node_licenses(ANIMATOR_DIR)
    player_licenses = get_node_licenses(PLAYER_DIR)
    backend_licenses = get_python_licenses()

    all_licenses = {}

    # Merge Node
    for pkg_key, info in {**animator_licenses, **player_licenses}.items():
        name = parse_node_package_name(pkg_key)
        # Avoid duplicate merging issue, keep the first encountered (or could check versions)
        if name not in all_licenses:
            all_licenses[name] = {
                "licenses": info.get("licenses", "Unknown"),
                "repository": info.get("repository", ""),
                "publisher": info.get("publisher", ""),
                "version": parse_node_package_version(pkg_key),
                "language": "JavaScript/TypeScript"
            }

    # Merge Python
    for info in backend_licenses:
        name = info.get("Name")
        if name not in all_licenses:
            all_licenses[name] = {
                "licenses": info.get("License", "Unknown"),
                "repository": info.get("URL", ""),
                "publisher": info.get("Author", ""),
                "version": info.get("Version", ""),
                "language": "Python"
            }

    # Sort alphabetically
    all_licenses = dict(sorted(all_licenses.items(), key=lambda x: x[0].lower()))

    # Write JSON files
    json_output = json.dumps(all_licenses, indent=2)
    for out_dir in [ANIMATOR_DIR / "public", PLAYER_DIR / "public"]:
        out_dir.mkdir(exist_ok=True)
        out_file = out_dir / "licenses.json"
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(json_output)
        print(f"✅ Fichier {out_file.relative_to(ROOT_DIR)} mis à jour.")

    # Generate LICENSE.md
    md_content = f"# License\n\n{MIT_LICENSE}\n"
    md_content += "---\n\n## Third-Party Open Source Software\n\n"
    md_content += "This software uses the following open source libraries. We warmly thank their authors.\n\n"
    
    for name, info in all_licenses.items():
        md_content += f"### {name} (v{info['version']})\n"
        md_content += f"- **License**: {info['licenses']}\n"
        if info.get("publisher"):
            md_content += f"- **Author/Publisher**: {info['publisher']}\n"
        if info.get("repository"):
            md_content += f"- **Repository**: {info['repository']}\n"
        md_content += f"- **Ecosystem**: {info['language']}\n\n"

    license_md_path = ROOT_DIR / "LICENSE.md"
    with open(license_md_path, "w", encoding="utf-8") as f:
        f.write(md_content)
    
    print(f"✅ Fichier LICENSE.md mis à jour à la racine.")
    print("🎉 Opération terminée avec succès !")

if __name__ == "__main__":
    main()
