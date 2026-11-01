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

### **Frontend**

```
"frontend/src/
│── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── FileUpload.jsx
│   ├── Input.jsx
│   ├── CaseCard.jsx
|   ├── Logo.jsx
│
│── pages/
│   ├── Home.jsx
│   ├── About.jsx
│   ├── Contact.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── ParentDashboard.jsx
│   ├── SubmitCase.jsx
│   ├── CaseDetails.jsx
│   ├── DoctorLogin.jsx
|   ├── DoctorList.jsx
│   ├── DoctorDashboard.jsx
│   ├── CaseReview.jsx
|   ├── Messaging.jsx
|   ├── DoctorMessaging.jsx
│
│── services/
│   ├── api.js
│   ├── patientAPI.js
│   ├── doctorAPI.js
│
│── context/
│   └── AuthContext.jsx
│
└── App.jsx
```

---

### **Backend**


```
backend/
│── src/
│   ├── config/
│   │   ├── db.js
│   │   └── multer.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Doctor.js
|   |   ├── Message.js
│   │   └── Case.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── caseController.js
│   │   └── doctorController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── caseRoutes.js
|   |   ├── messageRoutes.js
│   │   └── doctorRoutes.js
│   │
│   ├── utils/
│   │   └── generateToken.js
|   ├── uploads/
│   │   └── cases/
│   │
│   ├── app.js
|   ├── seedDoctor.js
│   └── server.js
|
├── uploads/
│   └── cases/
│
└── .env
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

## 🛠️ Installation Steps

### Clone the repository
- git clone https://github.com/SaurabhVishwakarma412/PedoDerma.git

### Run locally

Install dependencies in both applications, then run the backend and frontend in separate terminals:

```bash
npm install --prefix backend
npm install --prefix frontend
npm run backend:dev
npm run frontend
```

The frontend uses `frontend/.env` and sends API requests to `http://localhost:5000/api` by default. For a deployed frontend, set `VITE_API_URL` to the public backend URL in the hosting provider's environment variables; `localhost` only points to the visitor's own computer.


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
