// frontend/src/pages/CaseDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCaseById } from "../services/patientAPI";
import { getCaseByIdDoctor } from "../services/DoctorApi.js";
import { useAuth } from "../context/AuthContext";
import { 
  ChevronLeft, 
  Calendar, 
  User, 
  Clock, 
  FileText, 
  Image as ImageIcon,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Clock as ClockIcon,
  MessageSquare,
  Download,
  Share2,
  CalendarPlus,
  Shield
} from "lucide-react";

const statusConfig = {
  pending: {
    label: "Pending Review",
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    textColor: "text-yellow-800 dark:text-yellow-300",
    icon: ClockIcon
  },
  in_review: {
    label: "In Review",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-800 dark:text-blue-300",
    icon: AlertCircle
  },
  completed: {
    label: "Completed",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-800 dark:text-green-300",
    icon: CheckCircle
  }
};

const InfoCard = ({ icon: Icon, label, value, darkMode }) => (
  <div className={`flex items-start gap-3 p-4 rounded-lg transition-all duration-300 ${
    darkMode 
      ? "bg-gray-800/50 border border-gray-700" 
      : "bg-gray-50 border border-gray-100"
  }`}>
    <div className={`p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <div>
      <p className={`text-xs uppercase tracking-wide ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
      <p className={`font-semibold mt-1 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{value}</p>
    </div>
  </div>
);

const SectionCard = ({ title, icon: Icon, children, darkMode, headerAction }) => (
  <div className={`rounded-xl p-6 transition-all duration-300 ${
    darkMode 
      ? "bg-gray-800/90 backdrop-blur-sm border border-gray-700/50" 
      : "bg-white border border-gray-100 shadow-lg"
  }`}>
    <div className="flex items-center justify-between mb-4 pb-3 border-b dark:border-gray-700">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h2 className={`text-lg font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{title}</h2>
      </div>
      {headerAction && headerAction}
    </div>
    {children}
  </div>
);

// Format case ID to human-readable form
const formatCaseId = (id) => {
  if (!id) return "N/A";
  const numericId = parseInt(id.slice(-6), 16).toString().padStart(6, '0');
  return `CASE-${numericId}`;
};

const CaseDetails = () => {
  const { id } = useParams();
  const { role } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [caseData, setCaseData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFullImage, setShowFullImage] = useState(false);

  const baseURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    setDarkMode(document.documentElement.classList.contains("dark"));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res = role === "doctor"
          ? await getCaseByIdDoctor(id)
          : await getCaseById(id);
        setCaseData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load case details");
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [id, role]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Case ${formatCaseId(caseData._id)}`,
        text: caseData.title,
        url: window.location.href,
      });
    }
  };

  if (loading) {
    return (
      <main className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 via-white to-blue-50/30"
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 via-white to-blue-50/30"
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className={`p-6 rounded-xl border ${
            darkMode 
              ? "bg-red-900/20 border-red-800" 
              : "bg-red-50 border-red-200"
          }`}>
            <div className="flex items-center gap-3">
              <AlertCircle className={`w-6 h-6 ${darkMode ? "text-red-400" : "text-red-600"}`} />
              <div>
                <h3 className={`font-semibold ${darkMode ? "text-red-400" : "text-red-800"}`}>Error Loading Case</h3>
                <p className={darkMode ? "text-red-300" : "text-red-700"}>{error}</p>
              </div>
            </div>
            <Link
              to={role === "doctor" ? "/doctor/dashboard" : "/parent/dashboard"}
              className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg transition ${
                darkMode 
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!caseData) return null;

  const status = statusConfig[caseData.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  // Schedule button shown only to doctors on this case
  const scheduleButton = role === "doctor" ? (
    <button
      onClick={() => navigate(`/cases/${caseData._id}/review`)}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
      title="Schedule appointment for this case"
    >
      <CalendarPlus className="w-4 h-4" />
      Schedule Appointment
    </button>
  ) : null;

  return (
    <main className={`min-h-screen transition-colors duration-300 ${
      darkMode ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 via-white to-blue-50/30"
    }`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with Navigation */}
        <div className="mb-6">
          <Link
            to={role === "doctor" ? "/doctor/dashboard" : "/parent/dashboard"}
            className={`inline-flex items-center gap-2 text-sm font-medium transition mb-4 ${
              darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          {/* Title and Status */}
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
                {formatCaseId(caseData._id)}
              </h1>
              <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {caseData.title}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                Submitted on {new Date(caseData.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Action Buttons */}
              
              <button
                onClick={handleShare}
                className={`p-2 rounded-lg transition ${
                  darkMode 
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-400" 
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
              
              {/* Status Badge */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${status.bgColor}`}>
                <StatusIcon className={`w-4 h-4 ${status.textColor}`} />
                <span className={`text-sm font-medium ${status.textColor}`}>{status.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`mb-8 p-1 rounded-full ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
          <div 
            className={`h-2 rounded-full bg-gradient-to-r ${status.color} transition-all duration-500`}
            style={{ 
              width: caseData.status === 'pending' ? '33%' : 
                     caseData.status === 'in_review' ? '66%' : '100%' 
            }}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Information — with Schedule button for doctor */}
            <SectionCard
              title="Case Information"
              icon={FileText}
              darkMode={darkMode}
              headerAction={scheduleButton}
            >
              <p className={`mb-4 leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                {caseData.description}
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <InfoCard icon={User} label="Patient Name" value={caseData.patientName || caseData.childName || "N/A"} darkMode={darkMode} />
                <InfoCard icon={User} label="Patient Age" value={`${caseData.patientAge || caseData.childAge || "N/A"} years`} darkMode={darkMode} />
                <InfoCard icon={User} label="Patient Gender" value={caseData.patientGender || caseData.childGender || "N/A"} darkMode={darkMode} />
                <InfoCard icon={Clock} label="Visit Preference" value={caseData.visitType === 'offline' ? "🏥 Offline Visit" : "💻 Online Consultation"} darkMode={darkMode} />
                {caseData.visitType === "offline" && caseData.visitToken && (
                  <InfoCard icon={Shield} label="Clinic Visit Token" value={caseData.visitToken} darkMode={darkMode} />
                )}
                {caseData.timeSlot && caseData.appointmentDate && (
                  <>
                    <InfoCard icon={Calendar} label="Appointment Date" value={new Date(caseData.appointmentDate).toLocaleDateString()} darkMode={darkMode} />
                    <InfoCard icon={Clock} label="Appointment Time" value={caseData.timeSlot} darkMode={darkMode} />
                  </>
                )}
                <InfoCard icon={Clock} label="Duration" value={caseData.duration || "N/A"} darkMode={darkMode} />
                <InfoCard icon={Calendar} label="Submitted" value={new Date(caseData.createdAt).toLocaleDateString()} darkMode={darkMode} />
              </div>
            </SectionCard>

            {/* Case Images */}
            {caseData.imageUrls && caseData.imageUrls.length > 0 && (
              <SectionCard title="Medical Images" icon={ImageIcon} darkMode={darkMode}>
                <div className="grid grid-cols-2 gap-3">
                  {caseData.imageUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className={`relative group rounded-lg overflow-hidden cursor-pointer ${
                        darkMode ? "bg-gray-700" : "bg-gray-100"
                      }`}
                      onClick={() => setShowFullImage(url)}
                    >
                      <img
                        src={url}
                        alt={`Case Medical Image ${idx + 1}`}
                        className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50`}>
                        <span className="text-white text-sm font-medium px-3 py-1 rounded-full bg-black/50">
                          View Full
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className={`text-xs text-center mt-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Click image to view full size
                </p>
              </SectionCard>
            )}
            
            {/* Legacy single imageUrl support */}
            {!caseData.imageUrls?.length && caseData.imageUrl && (
              <SectionCard title="Medical Images" icon={ImageIcon} darkMode={darkMode}>
                <div className="space-y-4">
                  <div 
                    className={`relative group rounded-lg overflow-hidden cursor-pointer ${
                      darkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                    onClick={() => setShowFullImage(caseData.imageUrl)}
                  >
                    <img
                      src={`${baseURL}${caseData.imageUrl}`}
                      alt="Case Medical Image"
                      className="w-full max-h-96 object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50`}>
                      <span className="text-white text-sm font-medium px-3 py-1 rounded-full bg-black/50">
                        Click to enlarge
                      </span>
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Doctor Notes */}
            {caseData.doctorNotes && (
              <SectionCard title="Doctor's Assessment" icon={Stethoscope} darkMode={darkMode}>
                <div className={`p-4 rounded-lg ${
                  darkMode ? "bg-blue-900/20 border border-blue-800" : "bg-blue-50 border border-blue-100"
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium mb-2 ${darkMode ? "text-blue-400" : "text-blue-800"}`}>
                        Medical Professional's Assessment
                      </p>
                      <p className={`whitespace-pre-line leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {caseData.doctorNotes}
                      </p>
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className={`rounded-xl p-6 transition-all duration-300 ${
              darkMode 
                ? "bg-gray-800/90 backdrop-blur-sm border border-gray-700/50" 
                : "bg-white border border-gray-100 shadow-lg"
            }`}>
              <h3 className={`font-semibold mb-4 pb-2 border-b ${darkMode ? "text-gray-200 border-gray-700" : "text-gray-800 border-gray-200"}`}>
                Quick Actions
              </h3>
              <div className="space-y-3">
                {/* Doctor: link to review/schedule page */}
                {role === "doctor" && (
                  <button
                    onClick={() => navigate(`/cases/${caseData._id}/review`)}
                    className={`flex items-center justify-between w-full p-3 rounded-lg transition group ${
                      darkMode 
                        ? "bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 border border-blue-800" 
                        : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                    }`}
                  >
                    <span className="text-sm font-medium">Schedule / Review Case</span>
                    <CalendarPlus className="w-4 h-4 opacity-60 group-hover:opacity-100" />
                  </button>
                )}
                {/* Patient: message doctor only if doctor is assigned */}
                {role !== "doctor" && caseData.doctorId && (
                  <Link
                    to={`/parent/messages`}
                    className={`flex items-center justify-between w-full p-3 rounded-lg transition group ${
                      darkMode 
                        ? "bg-gray-700/50 hover:bg-gray-700 text-gray-300" 
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span className="text-sm font-medium">Message Doctor</span>
                    <MessageSquare className="w-4 h-4 opacity-60 group-hover:opacity-100" />
                  </Link>
                )}
                {/* Download image if available */}
                {(caseData.imageUrls?.length > 0 || caseData.imageUrl) && (
                  <button
                    onClick={() => {
                      const imgUrl = caseData.imageUrls?.[0] || `${baseURL}${caseData.imageUrl}`;
                      const link = document.createElement('a');
                      link.href = imgUrl;
                      link.download = `case-${formatCaseId(caseData._id)}-image.jpg`;
                      link.click();
                    }}
                    className={`flex items-center justify-between w-full p-3 rounded-lg transition group ${
                      darkMode 
                        ? "bg-gray-700/50 hover:bg-gray-700 text-gray-300" 
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span className="text-sm font-medium">Download Image</span>
                    <Download className="w-4 h-4 opacity-60 group-hover:opacity-100" />
                  </button>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className={`rounded-xl p-6 transition-all duration-300 ${
              darkMode 
                ? "bg-gray-800/90 backdrop-blur-sm border border-gray-700/50" 
                : "bg-white border border-gray-100 shadow-lg"
            }`}>
              <h3 className={`font-semibold mb-4 pb-2 border-b ${darkMode ? "text-gray-200 border-gray-700" : "text-gray-800 border-gray-200"}`}>
                Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 mt-1 rounded-full bg-green-500"></div>
                    {caseData.doctorNotes && <div className="absolute top-5 left-1.5 w-0.5 h-12 bg-gray-300 dark:bg-gray-600"></div>}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Case Submitted</p>
                    <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                      {new Date(caseData.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {caseData.status !== 'pending' && (
                  <div className="flex gap-3">
                    <div className="relative">
                      <div className="w-3 h-3 mt-1 rounded-full bg-blue-500"></div>
                      {caseData.status === 'completed' && <div className="absolute top-5 left-1.5 w-0.5 h-12 bg-gray-300 dark:bg-gray-600"></div>}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Under Review</p>
                      <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                        Doctor assigned to case
                      </p>
                    </div>
                  </div>
                )}
                
                {caseData.appointmentDate && caseData.timeSlot && (
                  <div className="flex gap-3">
                    <div className="relative">
                      <div className="w-3 h-3 mt-1 rounded-full bg-purple-500"></div>
                      {caseData.status === 'completed' && <div className="absolute top-5 left-1.5 w-0.5 h-10 bg-gray-300 dark:bg-gray-600"></div>}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Appointment Scheduled</p>
                      <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                        {caseData.appointmentDate} • {caseData.timeSlot}
                      </p>
                    </div>
                  </div>
                )}
                
                {caseData.status === 'completed' && (
                  <div className="flex gap-3">
                    <div className="w-3 h-3 mt-1 rounded-full bg-green-500"></div>
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Case Completed</p>
                      <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                        Diagnosis and treatment provided
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Need Help */}
            <div className={`rounded-xl p-6 transition-all duration-300 ${
              darkMode 
                ? "bg-blue-900/20 border border-blue-800" 
                : "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100"
            }`}>
              <h3 className={`font-semibold mb-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Need Assistance?</h3>
              <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Our support team is here to help with any questions about this case.
              </p>
              <Link
                to="/contact"
                className={`block text-center py-2 rounded-lg transition text-sm font-medium ${
                  darkMode 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {showFullImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-5xl w-full mx-4">
            <img
              src={showFullImage.startsWith('http') ? showFullImage : `${baseURL}${showFullImage}`}
              alt="Case Medical Image Full Size"
              className="w-full h-auto rounded-lg"
            />
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default CaseDetails;
