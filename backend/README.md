# Backend - MiniHost

Le backend est développé en Python avec Flask et PyWebView. Il est architecturé selon le modèle de l'Architecture Hexagonale (Ports et Adaptateurs).

---

## 💻 Développement local

### 1. Activer l'environnement virtuel
* **Sous Linux / macOS** :
  ```bash
  source venv/bin/activate
  ```
* **Sous Windows** :
  ```cmd
  venv\Scripts\activate.bat
  ```

### 2. Installer les dépendances
```bash
pip install -r requirements.txt
```

### 3. Lancer le serveur de développement
```bash
python main.py --dev
```
*(L'argument `--dev` permet au backend d'indiquer au projecteur de se brancher sur le port de développement de Vite `http://127.0.0.1:5174/` plutôt que sur les fichiers statiques compilés de la régie).*

---

## 🧪 Lancer les Tests

Les tests unitaires sont écrits avec `pytest`.

### 1. Activer l'environnement virtuel
```bash
source venv/bin/activate  # ou venv\Scripts\activate sous Windows
```

### 2. Lancer les tests simples
* **Sous Linux / macOS** :
  ```bash
  PYTHONPATH=. pytest tests/
  ```
* **Sous Windows (cmd)** :
  ```cmd
  set PYTHONPATH=.
  pytest tests/
  ```
* **Sous Windows (PowerShell)** :
  ```powershell
  $env:PYTHONPATH="."
  pytest tests/
  ```

### 3. Lancer les tests avec couverture (Coverage)
L'objectif est de maintenir au minimum **70% de couverture**.
* **Sous Linux / macOS** :
  ```bash
  PYTHONPATH=. pytest --cov=core tests/
  ```
* **Sous Windows (cmd)** :
  ```cmd
  set PYTHONPATH=.
  pytest --cov=core tests/
  ```

---

## 🚀 Compilation (Production)

L'exécutable final de MiniHost est créé à l'aide de **PyInstaller** qui embarque le code Python ainsi que les fichiers compilés du frontend `animator-ui/dist`.

Pour lancer la compilation Windows, utilisez le script à la racine :
```cmd
build.bat
```
*(Si Inno Setup est présent sur votre machine, cela compilera également l'installateur d'application `MiniHostSetup.exe`).*
