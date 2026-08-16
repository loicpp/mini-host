# Backend - MiniHost

The backend engine is developed in Python using Flask. It is architected following Clean Architecture and Hexagonal Architecture principles (Ports and Adapters), relying on standard web browsers to display the local UI interfaces.

---

## 💻 Local Development

### 1. Activate Virtual Environment
* **On Linux / macOS**:
  ```bash
  source venv/bin/activate
  ```
* **On Windows**:
  ```cmd
  venv\Scripts\activate.bat
  ```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Development Server
```bash
python main.py --dev
```
*(The `--dev` argument instructs the backend projector adapter to connect to Vite's dev server at `http://127.0.0.1:5174/` instead of loading static built assets).*

---

## 🧪 Running Tests

Unit tests are written using `pytest` and `pytest-cov`.

### 1. Activate Virtual Environment
```bash
source venv/bin/activate  # or venv\Scripts\activate.bat on Windows
```

### 2. Run Basic Tests
* **On Linux / macOS**:
  ```bash
  PYTHONPATH=. pytest tests/
  ```
* **On Windows (cmd)**:
  ```cmd
  set PYTHONPATH=.
  pytest tests/
  ```
* **On Windows (PowerShell)**:
  ```powershell
  $env:PYTHONPATH="."
  pytest tests/
  ```

### 3. Run Tests with Code Coverage
The objective is to maintain a minimum of **70% code coverage** on core business logic.
* **On Linux / macOS**:
  ```bash
  PYTHONPATH=. pytest --cov=core tests/
  ```
* **On Windows (cmd)**:
  ```cmd
  set PYTHONPATH=.
  pytest --cov=core tests/
  ```

---

## 🚀 Production Build

The final executable for MiniHost is created using **PyInstaller**, which bundles the Python backend along with the pre-compiled `animator-ui/dist` frontend.

To initiate the Windows build process, execute the script located in the repository root:
```cmd
..\build.bat
```
*(If Inno Setup is installed on your system, this will also generate the full setup installer `installer\MiniHostSetup.exe`).*

