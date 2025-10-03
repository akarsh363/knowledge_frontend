// src/utils/api.js
import axios from "axios";

const DEFAULT_BASE = "http://localhost:5058/api"; // <-- includes /api so calls like '/Posts' resolve to http://localhost:5058/api/Posts

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || DEFAULT_BASE,
  // increased timeout to 60s for uploads / slow dev servers
  timeout: 60000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("fnf_token");
    if (token) {
      // ensure headers object exists
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // if backend returned 401, clear and redirect to login
    if (error.response?.status === 401) {
      localStorage.clear();
      // keep it simple: navigate by location change
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
