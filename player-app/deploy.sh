#!/bin/bash
# Script de déploiement multi-version de player-app sur Firebase Hosting
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

python3 "$ROOT_DIR/tools/deploy_player.py" "$@"

