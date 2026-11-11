@echo off
echo ========================================
echo Deploying PedoDerma Full Stack...
echo ========================================

docker-compose pull 2>nul
docker-compose up -d --build --remove-orphans

echo ========================================
echo Deployment complete!
echo Frontend:   http://localhost:5173
echo Backend:    http://localhost:5000
echo ========================================
