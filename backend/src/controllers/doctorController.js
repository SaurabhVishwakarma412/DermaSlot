// backend/controllers/doctorController.js
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Doctor = require("../models/Doctor");
const Case = require("../models/Case");
const generateToken = require("../utils/generateToken");
const { getAppointmentSlots, getOccupiedAppointmentSlots } = require("../utils/appointmentSlots");

// Admin-only doctor provisioning. Doctor credentials are never accepted from
// the public registration endpoint.
exports.createDoctor = async (req, res) => {
  try {
    const { name, email, password, specialization } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
      return res.status(400).json({ message: "Name, email and a password of at least 6 characters are required" });
    }

    const existing = await Doctor.findOne({ email: email.trim().toLowerCase() });
    if (existing) return res.status(409).json({ message: "A doctor with this email already exists" });

    const doctor = await Doctor.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: await bcrypt.hash(password, 10),
      specialization: specialization?.trim() || "Dermatology",
    });

    res.status(201).json({
      message: "Doctor registered successfully",
      doctor: { _id: doctor._id, name: doctor.name, email: doctor.email, specialization: doctor.specialization, role: "doctor" },
    });
  } catch (e) {
    console.error("CreateDoctor ERROR:", e);
    res.status(500).json({ message: "Server Error" });
  }
};

// Doctor login function
exports.loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find doctor by email
    const doctor = await Doctor.findOne({ email });
    
    if (!doctor || !(await bcrypt.compare(password, doctor.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Generate token and return
    const deviceId = req.headers["x-device-id"] || "";
    const token = generateToken(doctor._id, "doctor", deviceId);
    
    res.json({
      token,
      user: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        role: "doctor",
        specialization: doctor.specialization
      }
    });
  } catch (e) {
    console.error("LoginDoctor ERROR:", e);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all doctors (PUBLIC - no auth required)
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select("name specialization").sort({ name: 1 });
    res.json(doctors.map((doctor) => ({
      _id: doctor._id,
      id: doctor._id,
      name: doctor.name,
      specialization: doctor.specialization,
      specialty: doctor.specialization,
    })));
  } catch (e) {
    console.error("GetDoctors ERROR:", e);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get single doctor by ID (PUBLIC)
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select("name specialization");
    
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    
    res.json({ _id: doctor._id, id: doctor._id, name: doctor.name, specialization: doctor.specialization, specialty: doctor.specialization });
  } catch (e) {
    console.error("GetDoctorById ERROR:", e);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get doctor appointments (PROTECTED - doctor only)
exports.getDoctorAppointments = async (req, res) => {
  try {
    const cases = await Case.find({ doctorId: req.user._id, timeSlot: { $ne: null } }).populate("parentId");
    const appointments = cases.map(c => ({
      id: c._id,
      patientName: c.patientName || (c.parentId ? c.parentId.name : "Patient"),
      date: c.appointmentDate,
      time: c.timeSlot,
      type: c.visitType === 'online' ? 'video' : 'in_person',
      reason: c.title,
      patientId: c.parentId ? c.parentId._id : null,
      status: c.status === 'in_review' ? 'scheduled' : c.status
    }));
    res.json(appointments);
  } catch (e) {
    console.error("GetDoctorAppointments ERROR:", e);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get doctor stats (PROTECTED - doctor only)
exports.getDoctorStats = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const totalCases = await Case.countDocuments({ doctorId });
    const pendingCases = await Case.countDocuments({ doctorId, status: "pending" });
    const completedCases = await Case.countDocuments({ doctorId, status: "completed" });
    const appointments = await Case.find({ doctorId, timeSlot: { $ne: null } });
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.appointmentDate === todayStr).length;
    const waitingPatients = appointments.filter(a => a.status === "in_review").length;

    const stats = {
      totalCases,
      pendingCases,
      completedCases,
      todayAppointments,
      waitingPatients,
      avgResponseTime: "1h 45m",
      patientSatisfaction: "4.9",
      monthlyGrowth: "+15%"
    };
    
    res.json(stats);
  } catch (e) {
    console.error("GetDoctorStats ERROR:", e);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get booked slots for date (PROTECTED - doctor only)
exports.getBookedSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }
    const bookedCases = await Case.find({
      doctorId: req.user._id,
      appointmentDate: date,
      timeSlot: { $ne: null }
    });
    const bookedSlots = getOccupiedAppointmentSlots(bookedCases.map(c => c.timeSlot));
    res.json(bookedSlots);
  } catch (e) {
    console.error("GetBookedSlots ERROR:", e);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get available appointment slots for a public booking form.
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Please select a valid doctor." });
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`)) || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
      return res.status(400).json({ message: "Please provide a valid appointment date." });
    }

    const doctor = await Doctor.exists({ _id: req.params.id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found." });
    }

    const bookedCases = await Case.find({
      doctorId: req.params.id,
      appointmentDate: date,
      timeSlot: { $ne: null }
    }).select("timeSlot");
    const bookedSlots = new Set(getOccupiedAppointmentSlots(bookedCases.map((patientCase) => patientCase.timeSlot)));

    res.json(getAppointmentSlots().filter((slot) => !bookedSlots.has(slot)));
  } catch (e) {
    console.error("GetAvailableSlots ERROR:", e);
    res.status(500).json({ message: "Server Error" });
  }
};
