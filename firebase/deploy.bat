@echo off
echo ==^> Deploying Firebase Rules...

call npm install
call npx firebase deploy --only database

echo ==^> Rules Deployment Complete!
pause
