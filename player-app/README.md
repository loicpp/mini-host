# Player App - MiniHost

The web application for players, built with Vue 3, TypeScript, and Vite. Designed for hosting on Firebase Hosting, it communicates with the Host backend in real-time via Firebase Realtime Database.

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

## 🚀 Deployment (Firebase)

The app is deployed to Firebase Hosting to be accessible live by players on their smartphones.

### On Linux / macOS:
```bash
chmod +x deploy.sh
./deploy.sh
```

### On Windows:
```cmd
deploy.bat
```

These scripts build the application with `npm run build` and deploy static assets to Firebase Hosting (`npx firebase deploy --only hosting`).

