# 🎶 MiniHost - Le Blind Test Ultime

MiniHost est une application de quiz musical (Blind Test) interactive, pensée pour l'animation de soirées, d'événements ou entre amis.
Elle se divise en deux grandes parties :
1. **L'Interface Animateur (Bureau)** : Une application serveur locale qui gère la musique, les playlists, les points, et un projecteur déporté.
2. **L'Interface Joueur (Mobile/Web)** : Une application web hébergée sur Firebase, qui permet aux joueurs de rejoindre la partie via leur téléphone et de s'affronter en temps réel.

---

## 🏗️ Architecture du Projet

Le projet est divisé en 3 sous-dossiers principaux :

- **`backend/`** : Le cœur de l'application (Python/Flask). Il gère le serveur local, la lecture audio (`pygame`), l'ouverture du projecteur fenêtré (`pywebview`) et la communication avec Firebase.
- **`animator-ui/`** : L'interface web de la Régie de l'animateur (Vue 3 + Vite). Cette interface est empaquetée à l'intérieur du serveur Python lors de la compilation.
- **`player-app/`** : L'interface web des joueurs (Vue 3 + Vite). Elle est hébergée sur Firebase Hosting et communique avec la base de données en temps réel pour envoyer les réponses des joueurs.

Les fichiers de configuration et les playlists personnelles de l'animateur sont sauvegardés sur sa machine dans le dossier utilisateur (ex: `~/.minihost/blindtest/`).

---

## 🚀 Compiler l'Application Animateur (Desktop)

Pour distribuer ou utiliser l'application de façon fluide (sans ligne de commande), un exécutable peut être généré. 
Celui-ci inclut automatiquement l'interface graphique de l'animateur (`animator-ui`).

### Sous Linux / macOS :
Exécutez le script fourni à la racine :
```bash
./build.sh
```
Une fois terminé, l'exécutable sera disponible dans : `backend/dist/MiniHost/MiniHost`.

### Sous Windows :
Exécutez le script `.bat` fourni à la racine :
```cmd
build.bat
```
Une fois terminé, l'exécutable sera disponible dans : `backend\dist\MiniHost\MiniHost.exe`.

> **Note :** La compilation croisée n'est pas supportée nativement par PyInstaller. Vous devez exécuter `build.bat` sur une machine Windows pour générer un fichier `.exe`.

---

## 📱 Déployer l'Application Joueur (Firebase)

L'application des joueurs doit être accessible en ligne depuis n'importe quel smartphone.
Avant toute chose, assurez-vous de bien avoir paramétré vos variables d'environnement dans le fichier `player-app/.env` (clés API Firebase).

### Sous Linux / macOS :
```bash
./deploy_player.sh
```

### Sous Windows :
```cmd
deploy_player.bat
```
Ces scripts se chargeront d'installer les dépendances, de compiler l'interface et de pousser les fichiers statiques sur Firebase Hosting (`npx firebase deploy --only hosting`).

---

## 🛠️ Développement Actif

Si vous souhaitez modifier le code et tester en direct sans recompiler tout l'exécutable à chaque fois :

### 1. Interface Animateur (`animator-ui`)
```bash
cd animator-ui
npm run dev
```

### 2. Interface Joueurs (`player-app`)
```bash
cd player-app
npm run dev
```

### 3. Serveur Local (`backend`)
```bash
cd backend
source venv/bin/activate
python main.py --dev
```
*(L'argument `--dev` permet au backend d'indiquer au projecteur de se brancher sur le port de développement de Vite plutôt que sur les fichiers statiques compilés).*

---

## 🎯 Règles & Fonctionnalités du Jeu

- **SoundCloud & Local** : L'animateur peut préparer des playlists depuis SoundCloud ou charger des fichiers audios locaux.
- **Réponse au buzz** : Le chrono se lance, les joueurs doivent deviner le titre et/ou l'artiste sur leur téléphone.
- **Projecteur** : Une fenêtre annexe peut s'ouvrir pour être glissée sur un deuxième écran ou un vidéoprojecteur, affichant le classement et le timer sans dévoiler les réponses de la régie.
- **Versionning** : La version de l'application joueur est modifiable dans `player-app/.env` (`VITE_APP_VERSION`).
