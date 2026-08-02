# Animator UI - MiniHost

The Host / Animator control panel interface, built with Vue 3, TypeScript, and Vite. It implements a clean architecture utilizing the Repository pattern to abstract Firebase communication.

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file based on `.env.example` and populate it with your Firebase project credentials.

### 3. Start Local Development Server
```bash
npm run dev
```
*(The development server typically runs on port `5174` and is directly consumed by the backend when launched with the `--dev` flag).*

---

## 🧪 Running Tests

Unit testing and code coverage reports are powered by `Vitest` and `@vitest/coverage-v8`.

### 1. Run Tests in Interactive Mode (Watch Mode)
```bash
npx vitest
```

### 2. Run Tests with Code Coverage Report
The objective is to maintain a minimum of **70% code coverage**.
```bash
npx vitest run --coverage
```

---

## 📦 Production Compilation

To compile the Animator UI application for packaging inside the Python desktop backend server:
```bash
npm run build
```
Compiled static files are output to the `dist/` folder and automatically copied during the main desktop build process.

