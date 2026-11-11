# 🚀 PedoDerma Simple DevOps & Deployment Guide

This project is set up for clean, simple deployment using **Docker, Docker Compose, Kubernetes, GitHub Actions, and Jenkins**.

---

## ⚡ 1-Step Quick Deploy

### Option A: Local or Server (Docker Compose)
Run this single command:
```bash
npm run deploy
```
*(Or run `./deploy.sh` on Linux / `deploy.bat` on Windows)*

Everything starts in the background:
- 🌐 **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- 🔌 **Backend API**: [http://localhost:5000](http://localhost:5000)
- 🗄️ **MongoDB**: Port 27017

To stop:
```bash
npm run stop
```

---

### Option B: Kubernetes Cluster (k8s)
All Kubernetes components (ConfigMap, Secrets, Backend, Frontend, and Ingress) are in a single file: `k8s/deployment.yaml`.

```bash
# Deploy entire app to Kubernetes
kubectl apply -f k8s/

# Check status
kubectl get pods

# Remove app from Kubernetes
kubectl delete -f k8s/
```

---

## 🔄 Automated CI/CD Pipelines

### 1. GitHub Actions (`.github/workflows/deploy.yml`)
Runs automatically on every push to `main` (or click **Run workflow** in GitHub Actions):
1. **Tests**: Automatically runs backend unit & health checks (`npm test`).
2. **Build & Push**: Builds and pushes backend & frontend images to Docker Hub.
3. **Deploy**: Automatically SSHs into your server and runs `docker-compose up -d`.

**Required GitHub Secrets (in Repo Settings > Secrets > Actions):**
- `DOCKERHUB_USERNAME` & `DOCKERHUB_TOKEN`
- `EC2_HOST` & `EC2_SSH_KEY` *(for automated server deployment)*

---

### 2. Jenkins (`Jenkinsfile`)
A clean 3-stage Declarative pipeline:
1. **Test**: Runs `npm test`
2. **Build & Push**: Authenticates with `dockerhub-creds` and pushes `latest` images
3. **Deploy**: Runs `docker-compose up -d` on the agent

---

## 📁 Directory Overview

```
devops-derma/
├── .github/workflows/deploy.yml  # Single, clean GitHub Actions deployment pipeline
├── backend/                      # Node.js Express API + Dockerfile + Tests
├── frontend/                     # React UI + Nginx Alpine Dockerfile
├── k8s/deployment.yaml           # Single consolidated Kubernetes manifest
├── docker-compose.yml            # 1-command local & server orchestrator
├── deploy.sh / deploy.bat        # 1-click deploy scripts
├── Jenkinsfile                   # Simple 3-stage Jenkins pipeline
└── package.json                  # Root shortcuts: "npm run deploy", "npm test", "npm run stop"
```
