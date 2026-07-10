#!/bin/bash
echo "==> Deploying Player App to Firebase..."

cd player-app || exit

echo "--> Building Vue application..."
npm install
npm run build

echo "--> Deploying to Firebase Hosting..."
npx firebase deploy --only hosting

echo "==> Deployment Complete!"
