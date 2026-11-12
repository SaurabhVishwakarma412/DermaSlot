# 🧒 Pediatric Teledermatology Platform

A full-stack **MERN** (MongoDB, Express.js, React.js, Node.js) based web application that enables parents to consult pediatric dermatologists online or book in-person clinic visits.

---

## 🚀 Features

### 👨‍👩‍👧 Patient Side
- Register/Login to the platform
- Submit online cases with skin issue details and image uploads
- Book an in-person clinic visit with patient details, a selected doctor, and an available 15-minute appointment slot; receive a token to present at the clinic
- Track status of submitted dermatology cases
- View doctor's diagnosis and recommendations

### 🩺 Doctor Side
- Secure login for dermatologists
- View pending patient cases
- Review case details and provide medical notes / treatment guidance
- Update case status (Pending → Reviewed)

### 🗂 Admin
- Manage doctors data
- View analytics and total case counts

---

## 🏗️ Tech Stack

| Layer | Technologies Used |
|-------|------------------|
| **Frontend** | React.js, Tailwind CSS, Axios, React Router |
| **Backend** | Node.js, Express.js, Multer (image upload), JWT Auth |
| **Database** | MongoDB, Mongoose ORM |
| **Deployment** | https://dermaslot.vercel.app |

---

## 📁 Folder Structure

```
devops-derma/
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD automated deployment workflow
│
├── backend/
│   ├── src/
│   │   ├── config/                 # Cloudinary, CORS, DB, Multer configs
│   │   │   ├── cloudinary.js
│   │   │   ├── cors.js
│   │   │   ├── db.js
│   │   │   └── multer.js
│   │   ├── controllers/            # Auth, case, contact, doctor controllers
│   │   ├── middleware/             # JWT auth & role-based middleware
│   │   ├── models/                 # Mongoose schemas (User, Doctor, Case, Message)
│   │   ├── routes/                 # Express API route endpoints
│   │   ├── utils/                  # Token generation, email sending, appointment slots
│   │   ├── app.js                  # Express app setup & health probes
│   │   ├── seedAdmin.js            # Initial admin seed script
│   │   ├── seedDoctor.js           # Doctor seeding utility
│   │   └── server.js               # HTTP & Socket.IO server entrypoint
│   ├── tests/
│   │   └── app.test.js             # Automated unit & health probe tests
│   ├── .dockerignore               # Docker build exclusions
│   ├── .env.example                # Environment variables template
│   ├── .gitignore                  # Git secret & dependency exclusion rules
│   ├── Dockerfile                  # Production Node.js Alpine container
│   └── package.json                # Backend scripts & dependencies
│
├── frontend/
│   ├── public/                     # Static assets & favicon
│   ├── src/
│   │   ├── assets/                 # Images & icons
│   │   ├── components/             # Reusable UI components (Navbar, Footer, Input, etc.)
│   │   ├── context/                # React context (AuthContext)
│   │   ├── pages/                  # Route views (Home, Dashboards, Case submit, etc.)
│   │   ├── services/               # Axios API clients
│   │   ├── utils/                  # Frontend appointment & chat utilities
│   │   ├── App.css
│   │   ├── App.jsx                 # App routing & layout
│   │   ├── index.css
│   │   └── main.jsx                # Application root mount
│   ├── .dockerignore               # Docker build exclusions
│   ├── .env.example                # Frontend environment template
│   ├── .gitignore                  # Git exclusion rules
│   ├── Dockerfile                  # Multi-stage Nginx Alpine container
│   ├── nginx.conf                  # Nginx configuration (SPA routing & security)
│   ├── package.json                # Frontend dependencies & scripts
│   └── vite.config.js              # Vite & Tailwind configuration
│
├── k8s/
│   ├── deployment.yaml             # All-in-one Kubernetes manifest (ConfigMap, Deployments, Services, Ingress)
│   └── secret.template.yaml        # Template for Kubernetes secrets
│
├── monitoring/                     # Grafana auto-provisioned dashboards & datasources
│   └── grafana/provisioning/
│
├── scripts/
│   └── aws-ec2-setup.sh            # 1-command AWS EC2 Docker bootstrap script
│
├── .env.docker.example             # Docker Compose environment template
├── .gitignore                      # Root Git ignore rules (secrets, keys, node_modules)
├── deploy.bat                      # 1-click Windows deployment script
├── deploy.sh                       # 1-click Linux/macOS deployment script
├── DEVOPS.md                       # Comprehensive DevOps & deployment manual
├── docker-compose.yml              # Multi-container orchestration (App, Mongo, Prometheus, Grafana)
├── Jenkinsfile                     # 3-stage Declarative Jenkins pipeline
├── package.json                    # Root shortcuts (npm run deploy, npm test, etc.)
└── prometheus.yml                  # Prometheus scrape configuration
```

---

## 🔐 Authentication Flow

- JSON Web Tokens (JWT) used for secure route access
- Separate login portals for Parent and Doctor roles
- Middleware validates token before protected route access

- Parent → Login → JWT Created → Access Dashboard → Submit Case
- Doctor → Login → JWT Created → Access Dashboard → Review Cases
- Admin → Login → JWT Created → Admin Dashboard → Register doctor accounts

### Admin setup

Admin accounts are not publicly registered. Add these variables to `backend/.env`, then run `npm run seed:admin` from the `backend` directory:

```env
ADMIN_NAME=Platform Admin
ADMIN_EMAIL=saurabhkv412@gmail.com
ADMIN_PASSWORD=12345678
```

The admin can sign in at `/admin/login` and create doctor accounts from `/admin/dashboard`. The doctor creation API (`POST /api/doctors`) requires an admin JWT.


---

## 🩻 Case Submission Workflow
```
Parent Chooses Online Consultation or Offline Clinic Visit
↓
Online: Parent Submits Case Details and Images
Offline: Parent Enters Patient Details and Books a 15-Minute Slot
↓
Case Stored and Routed to Selected Doctor
↓
Offline Visit Receives a Clinic Token; Online Case Continues Through Doctor Review
↓
Doctor Reviews Case
↓
Doctor Adds Notes & Marks as Reviewed
↓
Parent Sees Diagnosis Report

```
---

## 🛠️ Installation & Running

### Clone the repository
```bash
git clone https://github.com/SaurabhVishwakarma412/PedoDerma.git
cd devops-derma
```

### Option 1: 🐳 1-Click Run with Docker (Recommended)

Run the entire application stack (Frontend, Backend, MongoDB) in one command:
```bash
npm run deploy
```
*(Or execute `./deploy.sh` on Linux / `deploy.bat` on Windows)*

- 🌐 **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- 🔌 **Backend API**: [http://localhost:5000](http://localhost:5000)
- 📊 **Prometheus**: [http://localhost:9091](http://localhost:9091)
- 📈 **Grafana**: [http://localhost:3001](http://localhost:3001) *(login: `admin` / `admin`)*

To stop all containers:
```bash
npm run stop
```

### Option 2: Run Locally without Docker

Install dependencies in both applications, then run the backend and frontend in separate terminals:

```bash
npm install --prefix backend
npm install --prefix frontend
npm run backend:dev
npm run frontend
```

The frontend sends API requests to `http://localhost:5000/api` by default.

> 📖 **DevOps Manual**: For Kubernetes cluster deployment (`kubectl apply -f k8s/`), Jenkins pipeline, GitHub Actions CI/CD, and secrets management, see [DEVOPS.md](DEVOPS.md).


---

## 🎯 Project Status

🚧 **In Progress**  
More features coming soon including:
- Real-time chat with dermatologists
- Appointment scheduling system

---

## 🤝 Contributing

Pull requests are welcome!  
For major changes, please open an issue first to discuss what you would like to improve.

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 👤 Author

**Saurabh Vishwakarma**  
B.Tech CSE • Lovely Professional University  
📧 Email: saurabhkv412@gmail.com
🌐 LinkedIn: https://www.linkedin.com/feed/update/urn:li:activity:7408114263015292928/

## 👤 Author
**Aviral  Chaurasia**  
B.Tech CSE • Lovely Professional University
📧 Email: aviralchaurasia175@gmail.com
🌐 LinkedIn: https://www.linkedin.com/in/aviralchaurasia05/

## 👤 Author
**Aditya Khot**  
B.Tech CSE • Lovely Professional University  
📧 Email: khot.aditya7618@gmail.com
🌐 LinkedIn: https://www.linkedin.com/feed/update/urn:li:activity:7408558428039680000/

---

> *Pediatric Teledermatology aims to bridge the gap between healthcare and accessibility by enabling early skin condition detection for children, anytime and anywhere.*

---

🌟 **Star this repo** if you like the project!  
