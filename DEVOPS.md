# 🚀 PedoDerma DevOps & Deployment Guide

This guide covers the deployment workflow for **PedoDerma** using **Docker, Docker Compose, Docker Hub, AWS EC2, Kubernetes, GitHub Actions, Jenkins, Prometheus, and Grafana**.

---

## 📑 Table of Contents

1. [Quick Start (Local & Server Deployment)](#-1-quick-start-local--server-deployment)
2. [Prometheus & Grafana Monitoring](#-2-prometheus--grafana-monitoring)
3. [Docker Hub Integration](#-3-docker-hub-integration)
4. [AWS EC2 Deployment](#-4-aws-ec2-deployment)
5. [Secrets & Environment Variables Management](#-5-secrets--environment-variables-management)
6. [CI/CD Automation (GitHub Actions & Jenkins)](#-6-cicd-automation-github-actions--jenkins)
7. [Kubernetes Cluster Deployment (k8s)](#-7-kubernetes-cluster-deployment-k8s)

---

## ⚡ 1. Quick Start (Local & Server Deployment)

Launch the full stack with a single command:
```bash
npm run deploy
```
*(Or run `./deploy.sh` on Linux / `deploy.bat` on Windows)*

### Services Spun Up:
| Service | URL / Port | Credentials / Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | [http://localhost:5173](http://localhost:5173) | Patient & Doctor Web App |
| **Backend REST API** | [http://localhost:5000](http://localhost:5000) | Node.js Express API & Sockets |
| **Prometheus** | [http://localhost:9091](http://localhost:9091) | Time-series Metrics Server |
| **Grafana** | [http://localhost:3001](http://localhost:3001) | Dashboards (`admin` / `admin`) |
| **MongoDB** | Port `27017` | Local Database (Persisted) |

To stop all services:
```bash
npm run stop
```

---

## 📈 2. Prometheus & Grafana Monitoring

### Backend Prometheus Exporter
The backend natively exposes real-time application metrics at `GET /metrics` without extra dependencies:
- **`process_uptime_seconds`**: Server uptime
- **`nodejs_memory_heap_used_bytes` / `heap_total` / `rss`**: Memory consumption
- **`pedoderma_db_connection_status`**: Live database status (1 = connected, 0 = down)
- **`pedoderma_http_requests_total`**: Request rates sliced by method, route, and status
- **`pedoderma_http_request_duration_ms_total`**: Request latency tracking

### Prometheus (`prometheus.yml`)
Scrapes `backend:5000/metrics` every 10 seconds automatically via Docker's internal network.

### Grafana Auto-Provisioning (`monitoring/grafana/provisioning/`)
When Grafana boots up, it automatically:
1. Adds Prometheus as the default data source (`http://prometheus:9090`).
2. Loads the pre-configured **PedoDerma Overview** dashboard with visual graphs for CPU, memory, uptime, database connectivity, and HTTP traffic.
3. Accessible at `http://localhost:3001` (User: `admin`, Password: `admin`).

---

## 🐳 3. Docker Hub Integration

Both GitHub Actions and Jenkins are integrated with Docker Hub to automatically build, tag, and publish production images.

### Image Names:
- **Backend**: `saurabhkv/project-pedo-backend:latest`
- **Frontend**: `saurabhkv/project-pedo-frontend:latest`

### Manual Build & Push (if needed):
```bash
# Log in to Docker Hub
docker login -u saurabhkv

# Build images
docker build -t saurabhkv/project-pedo-backend:latest ./backend
docker build -t saurabhkv/project-pedo-frontend:latest ./frontend

# Push images
docker push saurabhkv/project-pedo-backend:latest
docker push saurabhkv/project-pedo-frontend:latest
```

---

## ☁️ 4. AWS EC2 Deployment

### A. AWS Security Group Rules
Open the following inbound ports on your AWS EC2 instance security group:
- `22` (SSH) — Restricted to your IP
- `80` (HTTP) & `443` (HTTPS)
- `5000` (Backend REST API)
- `5173` (Frontend Web App)
- `3001` (Grafana Dashboard)
- `9091` (Prometheus Server)

### B. Bootstrap Docker on EC2 in 1 Command
SSH into your Ubuntu EC2 instance and run the bootstrap script:
```bash
curl -sSL https://raw.githubusercontent.com/SaurabhVishwakarma412/PedoDerma/main/scripts/aws-ec2-setup.sh | bash
```

### C. Run on EC2:
```bash
git clone https://github.com/SaurabhVishwakarma412/PedoDerma.git ~/devops-derma
cd ~/devops-derma
npm run deploy
```

---

## 🔐 5. Secrets & Environment Variables Management

Secrets are kept strictly isolated and protected from accidental GitHub exposure:

| Environment | Secret Strategy | How It Works |
| :--- | :--- | :--- |
| **Local Dev** | `backend/.env` | Ignored by `.gitignore`. Loaded automatically. |
| **Docker Compose** | `env_file: ./backend/.env` | Loads from local `.env` if present, with safe defaults. |
| **AWS EC2** | GitHub Secrets `BACKEND_ENV` | CI/CD automatically injects secrets directly to `backend/.env` on the EC2 host with `chmod 600` permissions. |
| **Kubernetes** | In-Cluster `Secret` | Created dynamically with: `kubectl create secret generic pedoderma-secrets --from-env-file=backend/.env`. |

### Protected by `.gitignore`:
- All `.env*` files (except `.example` templates)
- All Kubernetes secret manifests (`*secret*.yaml` except templates)
- Private keys (`*.pem`, `*.key`, `id_rsa*`)
- Patient medical uploads (`uploads/cases/`)

---

## 🔄 6. CI/CD Automation (GitHub Actions & Jenkins)

### A. GitHub Actions (`.github/workflows/deploy.yml`)
Triggers on every `git push` to `main` (or manual trigger):
1. **Automated Tests**: Runs backend health tests (`npm test`).
2. **Docker Hub Build & Push**: Builds and pushes Docker images using GitHub Secrets.
3. **AWS Deployment**: Connects via SSH to your AWS EC2 server, updates code, pulls latest Docker Hub images, and restarts containers.

#### Required GitHub Secrets:
Add these in **Repo Settings > Secrets and variables > Actions**:
- `DOCKERHUB_USERNAME`: Your Docker Hub username.
- `DOCKERHUB_TOKEN`: Docker Hub Personal Access Token.
- `EC2_HOST`: AWS EC2 Public IPv4 address.
- `EC2_SSH_KEY`: AWS EC2 private key (`.pem` contents).
- `EC2_USER`: Remote username (default: `ubuntu`).
- `BACKEND_ENV`: *(Optional)* Full production `.env` contents to write onto the EC2 server.

---

### B. Jenkins Pipeline (`Jenkinsfile`)
Declarative 3-stage pipeline:
1. **Test**: Runs `npm test` across Linux or Windows agents.
2. **Build & Push**: Authenticates via `dockerhub-creds` and pushes `latest` images to Docker Hub.
3. **Deploy**: Runs `docker-compose pull && docker-compose up -d --remove-orphans`.

---

## ☸️ 7. Kubernetes Cluster Deployment (k8s)

All Kubernetes resources (ConfigMap, Deployments, Services, and Ingress) are consolidated into a single file: [`k8s/deployment.yaml`](k8s/deployment.yaml).

```bash
# 1. Create Secret in cluster from your local backend/.env:
kubectl create secret generic pedoderma-secrets --from-env-file=backend/.env

# 2. Deploy application and ingress:
kubectl apply -f k8s/

# 3. Check status:
kubectl get pods
kubectl get svc
kubectl get ingress

# 4. Teardown:
kubectl delete -f k8s/
kubectl delete secret pedoderma-secrets
```
