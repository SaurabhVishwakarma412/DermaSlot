#!/bin/bash
set -e

echo "========================================"
echo "🚀 Deploying PedoDerma Full Stack"
echo "========================================"

# Pull or build latest images and start containers in the background
docker-compose pull 2>/dev/null || true
docker-compose up -d --build --remove-orphans

echo ""
echo "========================================"
echo "✅ Deployment complete!"
echo "🌐 Frontend:   http://localhost:5173"
echo "🔌 Backend:    http://localhost:5000"
echo "========================================"
