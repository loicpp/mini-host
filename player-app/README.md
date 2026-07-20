# Player App - MiniHost

L'application web des joueurs, développée en Vue 3 + TypeScript avec Vite et destinée à être hébergée sur Firebase Hosting.

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

## 🚀 Déploiement (Firebase)

L'application est déployée sur Firebase Hosting pour être accessible en direct par les joueurs sur leur smartphone.

### Sous Linux / macOS :
```bash
chmod +x deploy.sh
./deploy.sh
```

### Sous Windows :
```cmd
deploy.bat
```

Ces scripts buildent l'application avec `npm run build` et déploient les assets statiques sur Firebase (`npx firebase deploy --only hosting`).
