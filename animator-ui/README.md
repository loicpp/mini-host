# Animator UI - MiniHost

L'interface de régie de l'animateur, développée en Vue 3 + TypeScript avec Vite. Elle implémente une architecture propre avec un Repository pattern pour abstraire Firebase.

---

## 💻 Développement local

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer les variables d'environnement
Créez un fichier `.env` basé sur `.env.example` et renseignez les identifiants de votre projet Firebase.

### 3. Lancer le serveur de développement local
```bash
npm run dev
```
*(Le serveur se lance généralement sur le port `5174` et est directement accessible depuis le backend en mode `--dev`)*

---

## 🧪 Lancer les Tests

Les tests unitaires et la couverture de code sont assurés par `Vitest` et `@vitest/coverage-v8`.

### 1. Lancer les tests en mode interactif (Watch)
```bash
npx vitest
```

### 2. Lancer les tests avec le rapport de couverture (Coverage)
L'objectif est de maintenir au minimum **70% de couverture**.
```bash
npx vitest run --coverage
```

---

## 📦 Compilation de Production

Pour compiler l'application de régie afin de l'empaqueter dans le serveur Python :
```bash
npm run build
```
Les fichiers compilés seront générés dans le dossier `dist/` et seront recopiés automatiquement par le script global de build de l'application desktop.
