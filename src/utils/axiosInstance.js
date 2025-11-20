import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL
const axiosInstance = axios.create({baseURL});

// Attach token automatically
axiosInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("portal_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
