#!/bin/bash
echo "==> Deploying Firebase Rules..."

npm install
npx firebase deploy --only database

echo "==> Rules Deployment Complete!"
