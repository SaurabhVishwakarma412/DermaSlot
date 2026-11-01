// backend/src/controllers/caseController.js
const Case = require("../models/Case");
const Doctor = require("../models/Doctor");
const mongoose = require("mongoose");
const { randomBytes } = require("crypto");
const cloudinary = require("../config/cloudinary");  // Import your cloudinary config
const streamifier = require("streamifier");
const { getAppointmentSlots, getOccupiedAppointmentSlots } = require("../utils/appointmentSlots");

// Helper function for Cloudinary upload
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "pedoderma/cases" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// Submit a new case (Parent)
exports.submitCase = async (req, res) => {
  try {
    const { doctorId, ...caseData } = req.body;
    delete caseData.visitToken;
    if (!doctorId || !mongoose.isValidObjectId(doctorId)) {
      return res.status(400).json({ message: "Please select a doctor for this case." });
    }

    const visitType = caseData.visitType || "online";
    if (!["online", "offline"].includes(visitType)) {
      return res.status(400).json({ message: "Please select a valid visit type." });
    }

    if (visitType === "online") {
      delete caseData.appointmentDate;
      delete caseData.timeSlot;
    }

    if (visitType === "offline") {
      const { patientName, patientAge, patientGender, appointmentDate, timeSlot } = caseData;
      if (!patientName?.trim() || !patientAge || !patientGender || !appointmentDate || !timeSlot) {
        return res.status(400).json({ message: "Patient details, appointment date, and time slot are required for a clinic visit." });
      }
      if (!/^\d+$/.test(patientAge) || Number(patientAge) > 120 || !["male", "female", "other"].includes(patientGender)) {
        return res.status(400).json({ message: "Please provide valid patient age and gender." });
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate) || Number.isNaN(Date.parse(`${appointmentDate}T00:00:00Z`)) || new Date(`${appointmentDate}T00:00:00Z`).toISOString().slice(0, 10) !== appointmentDate || appointmentDate < new Date().toISOString().slice(0, 10)) {
        return res.status(400).json({ message: "Please select a valid appointment date that is not in the past." });
      }
      if (!getAppointmentSlots().includes(timeSlot)) {
        return res.status(400).json({ message: "Please select a valid 15-minute appointment slot." });
      }
      const existingBookings = await Case.find({ doctorId, appointmentDate, timeSlot: { $ne: null } }).select("timeSlot");
      if (getOccupiedAppointmentSlots(existingBookings.map((booking) => booking.timeSlot)).includes(timeSlot)) {
        return res.status(409).json({ message: "This time slot has just been booked. Please choose another slot." });
      }
    }

    const doctor = await Doctor.findById(doctorId).select("_id");
    if (!doctor) {
      return res.status(400).json({ message: "The selected doctor is not available." });
    }

    const imageUrls = [];
    if (visitType === "online" && req.files?.length) {
      for (const file of req.files) {
        imageUrls.push(await uploadToCloudinary(file.buffer));
      }
    }

    const submissionData = visitType === "offline"
      ? {
          title: "In-person dermatology consultation",
          description: "Clinic visit requested.",
          patientName: caseData.patientName.trim(),
          patientAge: caseData.patientAge,
          patientGender: caseData.patientGender,
          appointmentDate: caseData.appointmentDate,
          timeSlot: caseData.timeSlot,
        }
      : caseData;

    const created = await Case.create({
      parentId: req.user._id,
      doctorId: doctor._id,
      imageUrls: imageUrls,
      visitType,
      ...(visitType === "offline" && {
        visitToken: `PEDO-${randomBytes(5).toString("hex").toUpperCase()}`,
      }),
      ...submissionData,
    });

    res.json(created);
  } catch (e) {
    console.error("SubmitCase ERROR:", e);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all cases for a specific parent (Parent Dashboard)
exports.getMyCases = async (req, res) => {
  res.json(await Case.find({ parentId: req.user._id }));
};

// Get single case by ID (Parent & Doctor)
exports.getCaseById = async (req, res) => {
  const patientCase = await Case.findById(req.params.id);
  if (!patientCase) return res.status(404).json({ message: "Case not found" });

  const isOwner = req.user.role === "parent" && String(patientCase.parentId) === String(req.user._id);
  const isAssignedDoctor = req.user.role === "doctor" && String(patientCase.doctorId) === String(req.user._id);
  if (!isOwner && !isAssignedDoctor) {
    return res.status(403).json({ message: "You do not have access to this case." });
  }

  res.json(patientCase);
};

// Get all cases for doctors (Doctor Dashboard)
exports.getAllCases = async (req, res) => {
  res.json(await Case.find({ doctorId: req.user._id }));
};

// Review/update case (Doctor)
exports.reviewCase = async (req, res) => {
  try {
    const patientCase = await Case.findOne({ _id: req.params.id, doctorId: req.user._id });
    if (!patientCase) {
      return res.status(404).json({ message: "Case not found or not assigned to you." });
    }

    // A doctor can update clinical details, but can never reassign a case.
    const { doctorId, parentId, ...updateData } = req.body;

    const { appointmentDate, timeSlot } = req.body;
    if (appointmentDate || timeSlot) {
      if (!appointmentDate || !timeSlot) {
        return res.status(400).json({ message: "Appointment date and time slot must be provided together." });
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate) || Number.isNaN(Date.parse(`${appointmentDate}T00:00:00Z`)) || new Date(`${appointmentDate}T00:00:00Z`).toISOString().slice(0, 10) !== appointmentDate || appointmentDate < new Date().toISOString().slice(0, 10)) {
        return res.status(400).json({ message: "Please select a valid appointment date that is not in the past." });
      }
      if (!getAppointmentSlots().includes(timeSlot)) {
        return res.status(400).json({ message: "Please select a valid 15-minute appointment slot." });
      }
      const existingBookings = await Case.find({
        doctorId: req.user._id,
        appointmentDate,
        timeSlot: { $ne: null },
        _id: { $ne: req.params.id },
      }).select("timeSlot");
      if (getOccupiedAppointmentSlots(existingBookings.map((booking) => booking.timeSlot)).includes(timeSlot)) {
        return res.status(400).json({ message: "This time slot is already booked for another patient." });
      }
    }

    const updated = await Case.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.user._id },
      updateData,
      { new: true }
    );
    res.json(updated);
  } catch (e) {
    console.error("reviewCase ERROR:", e);
    res.status(500).json({ message: "Server Error" });
  }
};
