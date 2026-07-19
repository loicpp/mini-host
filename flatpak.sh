#!/bin/bash
set -e

echo "==> Préparation de l'environnement pour la construction Flatpak..."

# Installation de flatpak-builder s'il est manquant
if ! command -v flatpak-builder &> /dev/null; then
    echo "Installation de flatpak-builder système via apt (le mot de passe administrateur peut être requis)..."
    sudo apt update
    sudo apt install -y flatpak-builder
fi

# Utilisation d'un environnement virtuel pour éviter l'erreur "externally-managed-environment" (PEP 668)
if [ ! -d "flatpak/venv" ]; then
    echo "Création d'un environnement virtuel temporaire pour les générateurs..."
    python3 -m venv flatpak/venv
fi

source flatpak/venv/bin/activate

if ! command -v flatpak-node-generator &> /dev/null || ! python3 -c "import packaging" &> /dev/null; then
    echo "Installation des dépendances des générateurs (flatpak-node-generator, packaging)..."
    pip install flatpak-node-generator aiohttp packaging requirements-parser
fi

if [ ! -f "flatpak/flatpak-pip-generator.py" ]; then
    echo "Téléchargement de flatpak-pip-generator..."
    curl -L https://raw.githubusercontent.com/flatpak/flatpak-builder-tools/master/pip/flatpak-pip-generator.py -o flatpak/flatpak-pip-generator.py
fi

echo "==> Génération des sources Node.js hors-ligne..."
cd animator-ui
flatpak-node-generator -o ../flatpak/node-sources.json npm package-lock.json
cd ..

echo "==> Génération des sources Python hors-ligne..."
# On crée un requirements sans les paquets de tests (pytest) qui causent des problèmes et sont inutiles en prod
grep -v "pytest" backend/requirements.txt > flatpak/requirements-prod.txt
# On génère le python-deps.json basé sur les dépendances de prod
python3 flatpak/flatpak-pip-generator.py --output flatpak/python-deps -r flatpak/requirements-prod.txt

echo "==> Configuration de Flathub..."
flatpak remote-add --user --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo

echo "==> Nettoyage et construction du Flatpak..."
flatpak-builder --repo=repo build-dir flatpak/com.github.loicpp.MiniHost.json --force-clean --install-deps-from=flathub

echo "==> Génération du bundle..."
flatpak build-bundle repo MiniHost-linux.flatpak com.github.loicpp.MiniHost

echo "==> Construction terminée !"
echo "Vous pouvez installer l'application avec :"
echo "flatpak install MiniHost-linux.flatpak"
