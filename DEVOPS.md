# 🚀 PedoDerma Simple DevOps & Deployment Guide

This project is set up for clean, secure deployment using **Docker, Docker Compose, Kubernetes, GitHub Actions, and Jenkins**.

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

Kubernetes manifests are decoupled from secrets to prevent secret leakage in Git:
- `k8s/deployment.yaml`: ConfigMap, Backend, Frontend, and Ingress.
- `k8s/secret.template.yaml`: Template for credentials (never commit real secrets).

```bash
# 1. Create the Secret directly from your local backend/.env (Recommended & Secure):
kubectl create secret generic pedoderma-secrets --from-env-file=backend/.env

# 2. Deploy the rest of the application:
kubectl apply -f k8s/

# Check status
kubectl get pods

# Remove app from Kubernetes
kubectl delete -f k8s/
kubectl delete secret pedoderma-secrets
```

---

## 🔐 Secrets Management & Security

All secret credentials are protected to prevent accidental leaks on GitHub:

| Scope | Security Mechanism | How to Configure |
| :--- | :--- | :--- |
| **Local Development** | `.env` files | Create `backend/.env` from `backend/.env.example`. Ignored by `.gitignore`. |
| **Docker Compose** | `env_file: ./backend/.env` | Docker Compose automatically loads secrets from the uncommitted `backend/.env`. |
| **Kubernetes (k8s)** | Kubernetes `Secret` object | Run `kubectl create secret generic pedoderma-secrets --from-env-file=backend/.env`. No YAML secrets in Git! |
| **GitHub Actions** | GitHub Repository Secrets | Add secrets in **Repo Settings > Secrets & Variables > Actions**. |

### Required GitHub Secrets for Automated Deploy:
- `DOCKERHUB_USERNAME`: Your Docker Hub username.
- `DOCKERHUB_TOKEN`: Docker Hub Personal Access Token.
- `EC2_HOST`: Target server public IP.
- `EC2_SSH_KEY`: Server private SSH key (PEM format).
- `EC2_USER`: SSH username (defaults to `ubuntu`).
- `BACKEND_ENV`: *(Optional)* Full contents of your production `.env` file. The workflow safely injects it onto the server as `backend/.env` with `chmod 600` permissions.

### Protected by `.gitignore`:
- All `.env*` files (except `.example` templates)
- All Kubernetes secret manifests (`*secret*.yaml` except templates)
- Private keys & certificates (`*.pem`, `*.key`, `id_rsa*`)
- Patient medical image uploads (`uploads/cases/`)
- `node_modules/` and build directories

---

## 🔄 Automated CI/CD Pipelines

### 1. GitHub Actions (`.github/workflows/deploy.yml`)
Runs automatically on every push to `main` (or manual trigger):
1. **Tests**: Automatically runs backend unit & health checks (`npm test`).
2. **Build & Push**: Builds and pushes backend & frontend images to Docker Hub.
3. **Deploy**: Securely connects to your server via SSH, ensures `.env` permissions (`chmod 600`), and runs `docker-compose up -d`.

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
├── .github/workflows/deploy.yml  # Single, secure GitHub Actions deployment pipeline
├── backend/                      # Node.js Express API + Dockerfile + Tests
├── frontend/                     # React UI + Nginx Alpine Dockerfile
├── k8s/
│   ├── deployment.yaml           # Consolidated Kubernetes manifest (Config, Apps, Ingress)
│   └── secret.template.yaml      # Safe template for Kubernetes Secret
├── docker-compose.yml            # 1-command local & server orchestrator
├── deploy.sh / deploy.bat        # 1-click deploy scripts
├── Jenkinsfile                   # Simple 3-stage Jenkins pipeline
├── DEVOPS.md                     # DevOps manual & security guide
├── .gitignore                    # Bulletproof secret & dependency exclusion rules
└── package.json                  # Root shortcuts: "npm run deploy", "npm test", "npm run stop"
```
