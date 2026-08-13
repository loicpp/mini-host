#!/bin/bash

# Rendre le script robuste
set -e

# Se placer à la racine du projet, même si lancé depuis un autre dossier
cd "$(dirname "$0")"

echo "==========================================="
echo "   MiniHost - Générateur de Licences       "
echo "==========================================="

# Vérifier si Python est installé
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "❌ Erreur : Python n'est pas installé sur ce système."
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

# Lancer le script python
$PYTHON_CMD tools/generate_licenses.py
