//patientAPI.js

import api from "./api";

// auth ------
// Register parent
export const registerParent = (data) => {
  return api.post("/patients/register", data);
};

// Login parent
export const loginParent = (data) => {
  return api.post("/patients/login", data);
};

// case management ----
// Get logged-in parent's cases
export const getMyCases = () => {
  return api.get("/cases/my");
};

// Submit new case (with image)
export const submitCase = (formData) => {
  return api.post("/cases", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Get single case by ID
export const getCaseById = (caseId) => {
  return api.get(`/cases/${caseId}`);
};

// Appoitments
export const bookAppointment = (data) => {
  return api.post("/appointments", data);
};

export const getAppointments = () => {
  return api.get("/appointments");
};

export const getUpcomingAppointments = () => {
  return api.get("/appointments/upcoming");
};

// Medical Records
export const getMedicalRecords = () => {
  return api.get("/medical-records");
};

//DOCTORS
export const getDoctors = () => {
  return api.get("/doctors");
};

export const getAvailableSlots = (doctorId, date) => {
  return api.get(`/doctors/${doctorId}/available-slots?date=${encodeURIComponent(date)}`);
};

//Prescription
export const getPrescriptions = () => {
  return api.get("/prescriptions");
};

//Profile
export const getParentProfile = () => {
  return api.get("/patients/profile");
};

// Update parent profile
export const updateParentProfile = (data) => {
  return api.put("/patients/profile", data);
};

//Dashboard
export const getDashboardStats = () => {
  return api.get("/dashboard/stats");
};
