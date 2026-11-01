// frontend/src/components/CaseCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const statusColor = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "in_review":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const statusLabel = (status) => {
  switch (status) {
    case "pending": return "Pending Review";
    case "in_review": return "In Review";
    case "completed": return "Completed";
    default: return status;
  }
};

const formatCaseId = (id) => {
  if (!id) return "N/A";
  const numericId = parseInt(id.slice(-6), 16).toString().padStart(6, '0');
  return `CASE-${numericId}`;
};

const CaseCard = ({ caseData, onClickOverride }) => {
  const [darkMode, setDarkMode] = React.useState(false);
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_API_URL;

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    setDarkMode(document.documentElement.classList.contains("dark"));
    return () => observer.disconnect();
  }, []);

  const handleClick = () => {
    if (onClickOverride) {
      onClickOverride();
    } else {
      navigate(`/cases/${caseData._id}`);
    }
  };

  const patientAge = caseData.patientAge || caseData.childAge;
  const firstImage = caseData.imageUrls?.[0] || (caseData.imageUrl ? `${baseURL}${caseData.imageUrl}` : null);

  return (
    <div
      onClick={handleClick}
      className={`border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 ${
        darkMode ? "bg-gray-800 border-gray-600 text-gray-100" : "bg-white border-gray-200 text-gray-700"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2 gap-2">
        <div>
          <p className={`text-xs font-mono font-semibold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
            {formatCaseId(caseData._id)}
          </p>
          <h3 className="font-semibold text-sm mt-0.5 leading-tight">
            {caseData.title || "Untitled Case"}
          </h3>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${statusColor(caseData.status)}`}
        >
          {statusLabel(caseData.status)}
        </span>
      </div>

      {/* Image */}
      {firstImage && (
        <img
          src={firstImage}
          alt="Case"
          className={`w-full h-32 object-cover rounded-lg mb-3 border ${
            darkMode ? "border-gray-600" : "border-gray-200"
          }`}
        />
      )}

      {/* Description */}
      <p className={`text-xs line-clamp-2 mb-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
        {caseData.description || "No description provided"}
      </p>

      {/* Extra info */}
      <div className={`flex justify-between text-[11px] mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
        <span>Patient Age: {patientAge ? `${patientAge} yrs` : "N/A"}</span>
        <span>Duration: {caseData.duration || "N/A"}</span>
      </div>

      {/* Appointment info if scheduled */}
      {caseData.appointmentDate && caseData.timeSlot && (
        <div className={`text-[11px] px-2 py-1 rounded mb-2 ${
          darkMode ? "bg-blue-900/20 text-blue-400" : "bg-blue-50 text-blue-700"
        }`}>
          📅 {caseData.appointmentDate} • {caseData.timeSlot}
        </div>
      )}

      {caseData.visitType === "offline" && caseData.visitToken && (
        <div className={`text-[11px] px-2 py-1 rounded mb-2 font-semibold ${
          darkMode ? "bg-green-900/20 text-green-400" : "bg-green-50 text-green-700"
        }`}>
          Clinic visit token: {caseData.visitToken}
        </div>
      )}

      {/* Doctor Notes */}
      {caseData.status === "completed" && caseData.doctorNotes && (
        <p className={`text-[11px] italic border-t pt-2 mt-2 ${darkMode ? "border-gray-700 text-gray-400" : "border-gray-100"}`}>
          Doctor Notes: {caseData.doctorNotes.slice(0, 80)}{caseData.doctorNotes.length > 80 ? "..." : ""}
        </p>
      )}

      {/* Timestamp */}
      <p className={`text-[11px] mt-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
        Submitted:{" "}
        {caseData.createdAt
          ? new Date(caseData.createdAt).toLocaleDateString()
          : "Unknown"}
      </p>
    </div>
  );
};

export default CaseCard;
