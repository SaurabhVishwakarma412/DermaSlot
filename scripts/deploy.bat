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
echo Prometheus: http://localhost:9091
echo Grafana:    http://localhost:3001
echo ========================================
