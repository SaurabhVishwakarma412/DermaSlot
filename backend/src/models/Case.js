// Case.js
const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // A case is routed to the doctor chosen by the patient when it is submitted.
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },

    title: { type: String, required: true },

    description: { type: String, required: true },

    duration: { type: String },

    childAge: { type: String },

    childName: { type: String }, // optional but good

    patientName: { type: String },

    patientAge: { type: String },

    patientGender: { type: String },

    visitType: { type: String, enum: ["online", "offline"], default: "online" },

    visitToken: { type: String, unique: true, sparse: true },

    appointmentDate: { type: String, default: null },

    timeSlot: { type: String, default: null },

    status: {
      type: String,
      enum: ["pending", "in_review", "completed"],
      default: "pending",
    },

    imageUrls: { type: [String], default: [] },

    doctorNotes: { type: String },

    additionalInfo: { type: String }, // parent extra notes

    severity: {
      type: String,
      enum: ["mild", "moderate", "severe", null],
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Case", caseSchema);
