import axios from "axios";

// Retrieve or generate a unique device ID
let deviceId = localStorage.getItem("deviceId");
if (!deviceId) {
  try {
    deviceId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  } catch {
    deviceId = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  }
  localStorage.setItem("deviceId", deviceId);
}

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ""}/api`,
  withCredentials: true,
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach device ID to all outgoing requests
    config.headers["X-Device-ID"] = deviceId;

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API ERROR:", error?.response?.data || error.message);

    // If server returned 401 Unauthorized, notify the app so auth can be cleared
    const status = error?.response?.status;
    if (status === 401) {
      try {
        const evt = new CustomEvent("unauthorized", { detail: 401 });
        window.dispatchEvent(evt);
      } catch {
        // fallback for older browsers
        window.dispatchEvent(new Event("unauthorized"));
      }
    }

    return Promise.reject(error);
  }
);

export default api;