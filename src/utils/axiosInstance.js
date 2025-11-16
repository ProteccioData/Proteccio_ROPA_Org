import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000", // backend URL
});

// Attach token automatically
axiosInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("portal_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
