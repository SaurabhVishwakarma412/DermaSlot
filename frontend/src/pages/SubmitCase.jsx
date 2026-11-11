// frontend/src/pages/SubmitCase.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Camera,
  X,
  AlertCircle,
  CheckCircle,
  Calendar,
  Clock,
  User,
  Thermometer,
  ChevronLeft,
  Shield,
} from "lucide-react";

import { getAvailableSlots, getDoctors, submitCase } from "../services/patientAPI";

const getLocalDate = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().split("T")[0];
};

const SubmitCase = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = React.useState(false);

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const [form, setForm] = useState({
    title: "",
    description: "",
    symptoms: "",
    duration: "",
    childAge: "",
    childGender: "",
    patientName: "",
    patientAge: "",
    patientGender: "",
    visitType: "online",
    appointmentDate: getLocalDate(new Date(Date.now() + 86400000)),
    timeSlot: "",
    bodyPart: "",
    severity: "moderate",
    previousTreatments: "",
    allergies: "",
    triggers: "",
    temperature: "",
    otherSymptoms: "",
    consentForSharing: false,
    doctorId: "",
  });

  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submittedCase, setSubmittedCase] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const response = await getDoctors();
        setDoctors(response.data || []);
      } catch {
        setError("Unable to load doctors. Please try again shortly.");
      } finally {
        setDoctorsLoading(false);
      }
    };
    loadDoctors();
  }, []);

  useEffect(() => {
    let active = true;

    const loadAvailableSlots = async () => {
      if (form.visitType !== "offline" || !form.doctorId || !form.appointmentDate) {
        setAvailableSlots([]);
        setSlotsError("");
        setSlotsLoading(false);
        return;
      }

      setSlotsLoading(true);
      setSlotsError("");
      setAvailableSlots([]);
      try {
        const response = await getAvailableSlots(form.doctorId, form.appointmentDate);
        if (active) setAvailableSlots(response.data || []);
      } catch (requestError) {
        if (active) {
          setAvailableSlots([]);
          setSlotsError(
            requestError.response?.status === 404
              ? "Appointment availability is not enabled on the connected server yet. Deploy the latest backend and try again."
              : requestError.response?.data?.message || "Unable to load appointment slots. Please check the server connection and try again."
          );
        }
      } finally {
        if (active) setSlotsLoading(false);
      }
    };

    loadAvailableSlots();
    return () => {
      active = false;
    };
  }, [form.visitType, form.doctorId, form.appointmentDate]);

  const bodyParts = [
    "Face",
    "Scalp",
    "Neck",
    "Chest",
    "Back",
    "Abdomen",
    "Arms",
    "Hands",
    "Legs",
    "Feet",
    "Groin",
    "Multiple Areas",
  ];

  const severityLevels = [
    { value: "mild", label: "Mild", description: "Minor irritation, no pain" },
    {
      value: "moderate",
      label: "Moderate",
      description: "Visible rash, some discomfort",
    },
    {
      value: "severe",
      label: "Severe",
      description: "Painful, spreading rapidly",
    },
    {
      value: "emergency",
      label: "Emergency",
      description: "Fever, difficulty breathing",
    },
  ];

  const commonSymptoms = [
    "Itching",
    "Redness",
    "Swelling",
    "Blisters",
    "Dryness",
    "Peeling",
    "Bumps",
    "Pustules",
    "Scaling",
    "Crusting",
    "Pain",
    "Burning",
    "Warmth",
    "Oozing",
    "Bleeding",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(["doctorId", "appointmentDate"].includes(name) ? { timeSlot: "" } : {}),
    }));
  };

  const handleVisitTypeChange = (visitType) => {
    setForm((prev) => ({
      ...prev,
      visitType,
      ...(visitType === "online"
        ? { appointmentDate: "", timeSlot: "" }
        : { appointmentDate: prev.appointmentDate || getLocalDate(new Date(Date.now() + 86400000)) }),
    }));
    setActiveStep(1);
    setError("");
  };

  const handleSymptomToggle = (symptom) => {
    const currentSymptoms = form.symptoms.split(",").filter((s) => s.trim());
    if (currentSymptoms.includes(symptom)) {
      setForm((prev) => ({
        ...prev,
        symptoms: currentSymptoms.filter((s) => s !== symptom).join(", "),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        symptoms: [...currentSymptoms, symptom].join(", "),
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
    }));
    setImages([...images, ...newImages].slice(0, 5)); // Limit to 5 images
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (
          (form.visitType === "online" && !form.title) ||
          !form.patientAge ||
          !form.patientGender ||
          !form.patientName.trim() ||
          !form.doctorId
        ) {
          setError("Please fill in all required fields");
          return false;
        }
        if (form.visitType === "offline" && (!form.appointmentDate || !form.timeSlot)) {
          setError("Please choose an appointment date and available time slot.");
          return false;
        }
        return true;
      case 2:
        if (!form.description || !form.symptoms) {
          setError("Please describe the condition and select symptoms");
          return false;
        }
        return true;
      case 3:
        if (images.length === 0) {
          setError(
            "Please upload at least one clear photo of the affected area",
          );
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(activeStep)) {
      setError("");
      if (form.visitType === "offline" && activeStep === 1) {
        setActiveStep(4);
      } else if (activeStep < 4) {
        setActiveStep(activeStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const prevStep = () => {
    setError("");
    if (form.visitType === "offline" && activeStep === 4) {
      setActiveStep(1);
    } else if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    let progressInterval;
    try {
      const formData = new FormData();
      const onlineForm = { ...form };
      delete onlineForm.appointmentDate;
      delete onlineForm.timeSlot;

      const dataToSend = form.visitType === "offline"
        ? {
            visitType: form.visitType,
            doctorId: form.doctorId,
            patientName: form.patientName,
            patientAge: form.patientAge,
            patientGender: form.patientGender,
            appointmentDate: form.appointmentDate,
            timeSlot: form.timeSlot,
          }
        : {
            ...onlineForm,
            childAge: form.patientAge,
            childName: form.patientName,
            childGender: form.patientGender,
          };

      // Append form data
      Object.entries(dataToSend).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Append images
      images.forEach((img) => {
        formData.append(`images`, img.file);
      });

      // Simulate upload progress
      if (form.visitType === "online") {
        progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);
      }

      const response = await submitCase(formData);

      clearInterval(progressInterval);
      if (form.visitType === "online") setUploadProgress(100);
      setSubmittedCase(response.data);

      setSuccess(form.visitType === "offline"
        ? "Clinic visit booked successfully."
        : "Skin case submitted successfully.");
    } catch (err) {
      clearInterval(progressInterval);
      if (err.response?.status === 409 && form.visitType === "offline") {
        setForm((prev) => ({ ...prev, timeSlot: "" }));
        setActiveStep(1);
        try {
          const response = await getAvailableSlots(form.doctorId, form.appointmentDate);
          setAvailableSlots(response.data || []);
        } catch (refreshError) {
          setSlotsError(refreshError.response?.data?.message || "Unable to refresh appointment slots.");
        }
      }
      setError(
        err.response?.data?.message ||
          "Failed to submit case. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const progressSteps = form.visitType === "offline" ? [1, 4] : [1, 2, 3, 4];

  return (
    <main
      className={`min-h-screen ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gradient-to-b from-blue-50 to-white"}`}
    >
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/parent/dashboard")}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {form.visitType === "offline" ? "Book a Clinic Visit" : "Submit New Dermatology Case"}
              </h1>
              <p className="text-gray-600">
                {form.visitType === "offline"
                  ? "Choose a doctor and appointment time. No medical details are needed to book an in-person visit."
                  : "Document symptoms, affected areas, and clear images for a focused dermatology review"}
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-4">
              {progressSteps.map((step, index) => (
                <div
                  key={step}
                  className="flex flex-col items-center relative z-10"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-all ${
                      step === activeStep
                        ? "bg-blue-600 text-white border-blue-600"
                        : step < activeStep
                          ? "bg-green-500 text-white border-green-500"
                          : "bg-white text-gray-400 border-gray-300"
                    }`}
                  >
                    {step < activeStep ? <CheckCircle size={20} /> : index + 1}
                  </div>
                  <span className="text-xs mt-2 font-medium">
                    {step === 1
                      ? "Patient Info"
                      : step === 2
                        ? "Symptoms"
                        : step === 3
                          ? "Photos"
                          : "Review"}
                  </span>
                </div>
              ))}
              <div className="absolute left-0 right-0 top-6 h-1 bg-gray-200 -z-10">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${(progressSteps.indexOf(activeStep) / (progressSteps.length - 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-green-700 font-medium">{success}</p>
                {submittedCase?.visitType === "offline" && submittedCase.visitToken && (
                  <div className="mt-3 rounded-lg border border-green-200 bg-white p-4">
                    <p className="text-sm font-semibold text-gray-800">
                      Your clinic visit token
                    </p>
                    <p className="mt-1 font-mono text-2xl font-bold tracking-wider text-green-800">
                      {submittedCase.visitToken}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Show this token at the clinic for your consultation.
                    </p>
                    <p className="mt-2 text-sm text-gray-700">
                      Appointment: {submittedCase.appointmentDate} • {submittedCase.timeSlot}
                    </p>
                  </div>
                )}
                {submittedCase && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/cases/${submittedCase._id}`)}
                      className="text-sm font-semibold text-green-800 underline"
                    >
                      View case details
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/parent/dashboard")}
                      className="text-sm font-semibold text-green-800 underline"
                    >
                      Go to dashboard
                    </button>
                  </div>
                )}
                {uploadProgress > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      {uploadProgress === 100 ? "Upload complete" : `Uploading... ${uploadProgress}%`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form Steps */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
          {/* Step 1: Patient Information */}
          {activeStep === 1 && (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Patient Information
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    How would you like to consult? *
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleVisitTypeChange("online")}
                      className={`rounded-lg border p-3 text-sm font-semibold transition ${
                        form.visitType === "online"
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300"
                      }`}
                    >
                      💻 Online Consultation
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVisitTypeChange("offline")}
                      className={`rounded-lg border p-3 text-sm font-semibold transition ${
                        form.visitType === "offline"
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300"
                      }`}
                    >
                      🏥 Offline Visit (In-Person)
                    </button>
                  </div>
                </div>

                {form.visitType === "online" && <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Case Title (Brief Description) *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="e.g., Red rash on cheeks, Itchy bumps on arms"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Give a brief title that describes the main concern
                  </p>
                </div>}

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient's Name *
                    </label>
                    <input
                      type="text"
                      name="patientName"
                      value={form.patientName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="e.g., John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient's Age (Years) *
                    </label>
                    <input
                      type="number"
                      name="patientAge"
                      value={form.patientAge}
                      onChange={handleChange}
                      required
                      min="0"
                      max="120"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="e.g., 25"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient's Gender *
                    </label>
                    <select
                      name="patientGender"
                      value={form.patientGender}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Your Doctor *
                  </label>
                  <select
                    name="doctorId"
                    value={form.doctorId}
                    onChange={handleChange}
                    required
                    disabled={doctorsLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="">
                      {doctorsLoading ? "Loading doctors..." : "Select a doctor"}
                    </option>
                    {doctors.map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        {doctor.name} — {doctor.specialization || doctor.specialty || "Dermatology"}
                      </option>
                    ))}
                  </select>
                  {!doctorsLoading && doctors.length === 0 && (
                    <p className="text-sm text-red-600 mt-1">No doctors are currently available.</p>
                  )}
                </div>

                {form.visitType === "online" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration of Problem *
                    </label>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="duration"
                        value={form.duration}
                        onChange={handleChange}
                        required
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="e.g., 3 days, 2 weeks, 1 month"
                      />
                    </div>
                  </div>
                )}

                {form.visitType === "offline" && (
                  <section className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/60 p-5">
                    <h3 className="font-semibold text-gray-800">Choose your clinic appointment</h3>
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        Appointment Date *
                      </label>
                      <input
                        type="date"
                        name="appointmentDate"
                        value={form.appointmentDate}
                        min={getLocalDate(new Date())}
                        onChange={handleChange}
                        required
                        className="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <p className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Clock className="h-4 w-4 text-gray-400" />
                        Available 15-minute slots *
                      </p>
                      {!form.doctorId ? (
                        <p className="text-sm text-gray-600">Choose a doctor to see available times.</p>
                      ) : slotsLoading ? (
                        <p className="text-sm text-gray-600">Loading available times...</p>
                      ) : slotsError ? (
                        <p className="text-sm text-red-600">{slotsError}</p>
                      ) : availableSlots.length ? (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setForm((prev) => ({ ...prev, timeSlot: slot }))}
                              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                                form.timeSlot === slot
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-gray-200 bg-white text-gray-700 hover:border-blue-400"
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">No appointment slots are available on this date.</p>
                      )}
                    </div>
                  </section>
                )}
              </div>
            </>
          )}

          {/* Step 2: Symptoms & Details */}
          {activeStep === 2 && (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-blue-600" />
                Symptoms & Details
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description *
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                    placeholder="Describe the skin condition in detail. Include when it started, how it has progressed, and any patterns you've noticed..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Common Symptoms *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    {commonSymptoms.map((symptom) => (
                      <button
                        key={symptom}
                        type="button"
                        onClick={() => handleSymptomToggle(symptom)}
                        className={`p-3 text-sm rounded-lg border transition ${
                          form.symptoms.includes(symptom)
                            ? "bg-blue-50 border-blue-300 text-blue-700"
                            : "bg-gray-50 border-gray-200 text-gray-700 hover:border-blue-300"
                        }`}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    name="symptoms"
                    value={form.symptoms}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="Selected symptoms will appear here"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Affected Body Part(s)
                    </label>
                    <select
                      name="bodyPart"
                      value={form.bodyPart}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    >
                      <option value="">Select affected area</option>
                      {bodyParts.map((part) => (
                        <option key={part} value={part}>
                          {part}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Severity Level
                    </label>
                    <select
                      name="severity"
                      value={form.severity}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    >
                      {severityLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label} - {level.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Previous Treatments Tried
                  </label>
                  <textarea
                    name="previousTreatments"
                    value={form.previousTreatments}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                    placeholder="List any creams, medications, or home remedies you've tried..."
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 3: Photo Upload */}
          {activeStep === 3 && (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                Upload Photos
              </h2>

              <div className="space-y-6">
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition bg-gray-50">
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <Upload className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        Click to upload photos
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Upload clear, well-lit photos from different angles
                      </p>
                      <p
                        type="button"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                      >
                        Select Photos
                      </p>
                      <p className="text-xs text-gray-500 mt-3">
                        Maximum 5 photos, 5MB each (JPG, PNG)
                      </p>
                    </div>
                  </label>
                </div>

                {images.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">
                      Uploaded Photos ({images.length}/5)
                    </h4>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.preview}
                            alt={`Upload ${index + 1}`}
                            className="w-32 h-32 object-cover rounded-lg border"
                          />

                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition rounded-lg flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="mt-2 text-xs text-gray-500 truncate">
                            {image.name} ({image.size})
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Step 4: Review & Submit */}
          {activeStep === 4 && (
            form.visitType === "offline" ? (
              <section className="space-y-5">
                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  Confirm Clinic Visit
                </h2>
                <p className="text-sm text-gray-600">
                  Review your patient information and appointment before booking.
                </p>
                <div className="grid gap-4 rounded-xl bg-gray-50 p-5 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-600">Patient Name</p>
                    <p className="font-medium">{form.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Patient Age</p>
                    <p className="font-medium">{form.patientAge} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Patient Gender</p>
                    <p className="font-medium capitalize">{form.patientGender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Selected Doctor</p>
                    <p className="font-medium">
                      {doctors.find((doctor) => String(doctor._id) === form.doctorId)?.name || "Not selected"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Appointment Date</p>
                    <p className="font-medium">{form.appointmentDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Appointment Time</p>
                    <p className="font-medium">{form.timeSlot}</p>
                  </div>
                </div>
                <p className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                  A clinic visit token will be generated after the booking is confirmed. Show it when you arrive at the clinic.
                </p>
              </section>
            ) : (
            <>
              <h2 className="text-xl font-bold text-gray-800  flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                Review & Submit
              </h2>

              <div className="space-y-2">
                {/* Review Summary */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-4">
                    Case Summary
                  </h4>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Case Title</p>
                        <p className="font-medium">{form.title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Patient Name</p>
                        <p className="font-medium">{form.patientName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Patient Age</p>
                        <p className="font-medium">{form.patientAge} years</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Patient Gender</p>
                        <p className="font-medium capitalize">{form.patientGender}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Selected Doctor</p>
                        <p className="font-medium">
                          {doctors.find((doctor) => String(doctor._id) === form.doctorId)?.name || "Not selected"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Visit Preference</p>
                        <p className="font-medium capitalize">{form.visitType === 'online' ? '💻 Online Consultation' : '🏥 Offline In-Person'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-medium">{form.duration}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Severity</p>
                        <p className="font-medium">
                          {
                            severityLevels.find(
                              (s) => s.value === form.severity,
                            )?.label
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Photos</p>
                        <p className="font-medium">
                          {images.length} photo(s) uploaded
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">Symptoms</p>
                        <p className="font-medium">{form.symptoms}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="font-medium">{form.description}</p>
                    </div>
                  </div>
                </div>

                {/* Consent */}
                <div className="space-y-4">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="consentForSharing"
                      checked={form.consentForSharing}
                      onChange={handleChange}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                    />
                    <div>
                      <span className="text-gray-700 font-medium">
                        I consent to share photos and medical information with
                        dermatologists *
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        Your information will be kept confidential and used only
                        for medical diagnosis.
                      </p>
                    </div>
                  </label>

                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-800 font-medium">
                          Privacy Assurance
                        </p>
                        <p className="text-xs text-blue-700">
                          All case information is encrypted and stored securely.
                          Photos are deleted after 30 days unless retained for
                          medical records.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
            )
          )}

          {/* Navigation Buttons */}
          <div className="mt-2 pt-2 border-t flex justify-between">
            {activeStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                ← Back
              </button>
            )}

            <button
              type="button"
              onClick={nextStep}
              disabled={loading || Boolean(submittedCase)}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                loading || submittedCase
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 transform hover:-translate-y-0.5"
              } text-white shadow-lg ml-auto`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3 inline-block"></div>
                  Submitting...
                </>
              ) : submittedCase ? (
                "Case Submitted"
              ) : activeStep === 4 ? (
                form.visitType === "offline" ? "Book Clinic Visit" : "Submit Case"
              ) : (
                "Continue →"
              )}
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <h4 className="font-semibold text-gray-800 mb-3">Need Help?</h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="text-blue-600 font-bold text-lg mb-2">1</div>
              <h5 className="font-medium text-gray-800 mb-2">
                Photo Guidelines
              </h5>
              <p className="text-sm text-gray-600">
                Clear photos help dermatologists make accurate diagnoses. Ensure
                good lighting and focus.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-blue-600 font-bold text-lg mb-2">2</div>
              <h5 className="font-medium text-gray-800 mb-2">Review Updates</h5>
              <p className="text-sm text-gray-600">
                Track your case status in Dermaslot. Review timing depends on clinician availability.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-blue-600 font-bold text-lg mb-2">3</div>
              <h5 className="font-medium text-gray-800 mb-2">Follow-up Care</h5>
              <p className="text-sm text-gray-600">
                Add new photos and symptom changes to keep your clinical history current.
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Notice */}
        <div
          className={`mt-6 p-4 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-red-50 border-red-200"} rounded-xl`}
        >
          <div className="flex items-center gap-3">
            <AlertCircle
              className={`w-5 h-5 ${darkMode ? "text-red-400" : "text-red-600"}`}
            />
            <div>
              <p
                className={`font-medium ${darkMode ? "text-red-300" : "text-red-800"}`}
              >
                Medical Emergency?
              </p>
              <p
                className={`text-sm ${darkMode ? "text-red-400" : "text-red-700"}`}
              >
                If your child has difficulty breathing, high fever, or spreading
                infection, please call 911 or visit the nearest emergency room
                immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SubmitCase;
