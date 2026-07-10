@echo off
echo ==^> Deploying Player App to Firebase...

cd player-app

echo --^> Building Vue application...
call npm install
call npm run build

echo --^> Deploying to Firebase Hosting...
call npx firebase deploy --only hosting

echo ==^> Deployment Complete!
pause
