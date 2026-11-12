#!/bin/bash
# ========================================================
# PedoDerma - AWS EC2 One-Command Docker Setup Script
# Works on Ubuntu 20.04, 22.04, and 24.04 LTS
# ========================================================
set -e

echo "=========================================="
echo "🚀 Setting up Docker & Docker Compose on AWS EC2"
echo "=========================================="

# 1. Update OS packages
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release git

# 2. Add Docker official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 3. Add Docker APT repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. Install Docker CE and Compose plugin
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 5. Enable and start Docker service
sudo systemctl enable docker
sudo systemctl start docker

# 6. Add ubuntu user to docker group (so sudo is not required for docker commands)
sudo usermod -aG docker "$USER"

# 7. Install standalone docker-compose alias
sudo ln -sf /usr/libexec/docker/cli-plugins/docker-compose /usr/local/bin/docker-compose || true

echo "=========================================="
echo "✅ Docker setup completed on AWS EC2!"
echo "Please log out and log back in, or run:"
echo "  newgrp docker"
echo "Then clone your repo and run: npm run deploy"
echo "=========================================="
