![AI](https://img.shields.io/badge/Built_with-LLM_Assistant-8A2BE2?logo=openai&logoColor=white)
# 🎮 MiniHost - Interactive Party & Event Game Host

MiniHost is an interactive game hosting and event entertainment application designed for parties, corporate events, gatherings, and game nights with friends and family. While featuring a full-fledged music quiz (Blind Test) engine, MiniHost is architected with the ambition to host a wide range of party games, trivia quizzes, and interactive group activities.

The platform is split into two core components:
1. **Host Interface (Desktop App)**: A local server application for the host/animator that manages game logic, playlists, scoring, local sound playback, and a dedicated secondary display projector screen.
2. **Player Interface (Mobile / Web App)**: A responsive web application hosted on Firebase, allowing players to join instantly from their smartphones via QR code or URL to buzz and answer in real time.

---

## 🏗️ Project Architecture

The project is organized into 3 main directories (each containing its own dedicated documentation):

- [**`backend/`**](backend/README.md): The core application engine (Python / Flask). Manages local server operations, audio playback (`pygame`), secondary display/projector windows (`pywebview`), and real-time database sync with Firebase. See [backend/README.md](backend/README.md) for backend specific setup and tests.
- [**`animator-ui/`**](animator-ui/README.md): The Host / Animator control dashboard (Vue 3 + TypeScript + Vite). This web interface is embedded inside the Python backend executable during build. See [animator-ui/README.md](animator-ui/README.md) for details.
- [**`player-app/`**](player-app/README.md): The Player mobile/web app (Vue 3 + TypeScript + Vite). Hosted on Firebase Hosting, communicating with Firebase Realtime Database for live interaction. See [player-app/README.md](player-app/README.md) for details.

User configurations, game states, and host playlists are saved locally on the host's machine (e.g., `~/.minihost/blindtest/` or `$XDG_CONFIG_HOME/minihost/blindtest/`).

---

## 🚀 Building the Host Application (Desktop)

To package and distribute the Host desktop application as a standalone executable (including `animator-ui`), use the build scripts provided in the root directory.

### On Linux (Flatpak):
Execute the root shell script to generate a standalone Flatpak package:
```bash
chmod +x flatpak.sh
./flatpak.sh
```
Once complete, the package will be available at: `MiniHost-linux.flatpak`.
Install it locally using: `flatpak install MiniHost-linux.flatpak`.

### On Windows:
Execute the root batch script:
```cmd
build.bat
```
Once complete:
* The portable executable will be located at: `backend\dist\MiniHost.exe`.
* If **Inno Setup** is installed on your system (accessible via `iscc`), the script will automatically compile a full installer: `installer\MiniHostSetup.exe`. This installer handles Program Files placement, Start Menu / Desktop shortcuts, and clean uninstallation via Windows.

> **Note:** Cross-compilation is not supported by PyInstaller. You must run `build.bat` on a Windows machine to generate the `.exe` binary.

---

## 📱 Deploying the Player App (Firebase)

The Player application must be accessible online for smartphones.
Ensure your environment variables are configured in `player-app/.env` (Firebase API keys).

Navigate to the player application folder to run the deployment script:

### On Linux / macOS:
```bash
cd player-app
chmod +x deploy.sh
./deploy.sh
```

### On Windows:
```cmd
cd player-app
deploy.bat
```
These scripts install dependencies, compile the frontend application, and deploy static assets to Firebase Hosting (`npx firebase deploy --only hosting`).

---

## 🧪 Unit Testing & Code Coverage

MiniHost follows Clean Architecture and Hexagonal Architecture principles. A target code coverage of at least 70% is enforced on core business logic.
Each module maintains its own testing environment and commands:

- **Backend**: Tests powered by `pytest` and `pytest-cov`.
- **Player App & Animator UI**: Tests powered by `Vitest` and `@vitest/coverage-v8`.

For detailed execution commands and coverage report generation, refer to the individual `README` documentation:
- [Backend Documentation](backend/README.md)
- [Animator UI Documentation](animator-ui/README.md)
- [Player App Documentation](player-app/README.md)

---

## 🛠️ Active Development

To modify the codebase and test in real time without rebuilding executables:

### 1. Animator UI (`animator-ui`)
```bash
cd animator-ui
npm run dev
```

### 2. Player Interface (`player-app`)
```bash
cd player-app
npm run dev
```

### 3. Backend Server (`backend`)
```bash
cd backend
source venv/bin/activate # On Windows: venv\Scripts\activate.bat
python main.py --dev
```
*(The `--dev` flag instructs the backend projector adapter to connect to Vite's development server on `http://127.0.0.1:5174/` instead of loading static built files).*

---

## 🏷️ Creating a New Release (Release Assistant)

The repository includes an interactive release wizard to automate version management and Git tagging:

### On Linux / macOS:
```bash
chmod +x release.sh
./release.sh
```

### On Windows:
```cmd
release.bat
```

This assistant guides you through incrementing the version (Major, Minor, or Patch) and creates/pushes the annotated Git tag (e.g., `v1.0.0`). The GitHub Actions CI/CD pipeline is then triggered automatically to:
1. Deploy the Player application to Firebase Hosting.
2. Build the Linux Flatpak bundle (`MiniHost-linux.flatpak`).
3. Compile the Windows portable binary and Inno Setup installer (`MiniHostSetup.exe`).
4. Publish all compiled assets automatically to the GitHub Releases page.

---

## 🎯 Key Features & Capabilities

- **Multi-Game Hosting**: Designed for hosting blind tests, quizzes, and custom party games during events, parties, and gatherings with friends or family.
- **SoundCloud & Local Audio Integration**: Import playlists directly from SoundCloud or load local audio files seamlessly.
- **Real-Time Smartphone Buzzing**: Instant response tracking, countdown timers, and title/artist/answer guessing from player phones.
- **Projector & Second-Screen Window**: Separate display window for external monitors or projectors, showing leaderboards, timers, and visual animations without exposing host management controls.
- **Automated CI/CD Deployment**: Integrated versioning and automated multi-platform compilation via GitHub Actions (`VITE_APP_VERSION`).

