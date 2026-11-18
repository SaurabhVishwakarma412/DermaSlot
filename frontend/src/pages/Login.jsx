// frontend/src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Stethoscope, User, AlertCircle, LogIn, Cross, MoveUpLeft, CrossIcon, ChartNoAxesColumnDecreasingIcon, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState("parent"); // "parent" or "doctor"

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validateForm = () => {
    if (!form.email.trim()) {
      setError("Email is required");
      return false;
    }

    if (!form.password.trim()) {
      setError("Password is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (userType === "parent") {
        // Call real parent login endpoint
        const response = await API.post("/patients/login", {
          email: form.email,
          password: form.password
        });

        const { token, user } = response.data;
        login(user, token);
        navigate("/parent/dashboard");
      } else {
        // Call real doctor login endpoint
        const response = await API.post("/doctors/login", {
          email: form.email,
          password: form.password
        });

        const { token, user } = response.data;
        login(user, token);
        navigate("/doctor/dashboard");
      }
    } catch (err) {
      let errorMessage = `Invalid ${userType} credentials. Please try again.`;

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 py-4 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Login Form */}
          <div className="bg-white rounded-2xl shadow-xl p-4 border border-blue-100">
            <div className=" flex justify-around text-center mb-2">
              <h2 className="text-2xl font-bold text-gray-800">Sign In to Your Account</h2>
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  
                  <button onClick={() => navigate(-1)} className="">
                    <X className="font-black text-blue-600" />
                  </button>
                  
                </div>
              </div>
            </div>

            {/* User Type Selection */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am logging in as:
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setUserType("parent");
                    setError(""); // Clear error when switching user type
                  }}
                  className={`p-2 rounded-xl border-2 transition-all ${userType === "parent"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                    }`}
                >
                  <div className="flex flex-col items-center">
                    <User className={`w-6 h-6 mb-2 ${userType === "parent" ? "text-blue-600" : "text-gray-400"}`} />
                    <span className={`font-medium ${userType === "parent" ? "text-blue-700" : "text-gray-600"}`}>
                      Parent/Guardian
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserType("doctor");
                    setError(""); // Clear error when switching user type
                  }}
                  className={`p-2 rounded-xl border-2 transition-all ${userType === "doctor"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                    }`}
                >
                  <div className="flex flex-col items-center">
                    <Stethoscope className={`w-6 h-6 mb-2 ${userType === "doctor" ? "text-blue-600" : "text-gray-400"}`} />
                    <span className={`font-medium ${userType === "doctor" ? "text-blue-700" : "text-gray-600"}`}>
                      Doctor/Specialist
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="Enter your email address"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Lock className="w-4 h-4 mr-2 text-gray-400" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition pr-12"
                      placeholder="Enter your password"
                      disabled={isLoading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline disabled:opacity-50"
                    tabIndex={isLoading ? -1 : 0}
                  >
                    Forgot your password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 rounded-xl font-semibold transition-all ${isLoading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 transform hover:-translate-y-0.5 active:translate-y-0'
                    } text-white shadow-lg flex items-center justify-center`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-3" />
                      Sign In as {userType === "parent" ? "Parent" : "Doctor"}
                    </>
                  )}
                </button>
              </div>
            </form>




            {/* Registration Link */}
            <div className="mt-2 pt-2 border-t border-gray-200 text-center">
              <p className="text-gray-600">
                {userType === "parent"
                  ? "Don't have an account? "
                  : "Not registered as a doctor? "}
                <Link
                  to={userType === "parent" ? "/register" : "/admin/login"}
                  className="text-blue-600 font-semibold hover:text-blue-800 hover:underline disabled:opacity-50"
                  tabIndex={isLoading ? -1 : 0}
                >
                  {userType === "parent" ? "Create account" : "Admin portal"}
                </Link>
              </p>
              {userType === "parent" && <Link to="/admin/login" className="text-xs text-gray-500 hover:text-blue-600">Admin login</Link>}
            </div>
          </div>

          {/* Right Side - Info Section */}
          <div className="space-y-6">
            {/* Parent Login Info */}
            <div className="bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-8 h-8" />
                <h3 className="text-xl font-bold">For Parents & Guardians</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>Access your child's medical records and treatment history</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>Submit photo-led skin cases and schedule dermatology follow-up</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>Upload photos and track treatment progress</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>Secure messaging with healthcare providers</span>
                </li>
              </ul>
            </div>

            {/* Doctor Login Info */}
            <div className="bg-linear-to-br from-green-600 to-emerald-600 rounded-2xl p-8 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Stethoscope className="w-8 h-8" />
                <h3 className="text-xl font-bold">For Doctors & Specialists</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>Access patient cases and medical history</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>Provide remote consultations and prescriptions</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>Collaborate with other healthcare professionals</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>Manage appointment schedule and availability</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
