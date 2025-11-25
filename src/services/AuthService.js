// services/AuthService.js
import axiosInstance from "../utils/axiosInstance";

export const login = async (email, password, token = null, backupCode = null) => {
  const payload = { email, password };

  // keep 2FA optional for now (no UI changes)
  if (token) payload.token = token;
  if (backupCode) payload.backupCode = backupCode;

  const res = await axiosInstance.post("/auth/login", payload);
  return res.data;
};

export const requestPasswordReset = async (email) => {
  const res = await axiosInstance.post("/auth/forgot-password", { email });
  return res.data;
};

export const resetPassword = async (token, newPassword) => {
  const res = await axiosInstance.post("/auth/reset-password", {
    token,
    newPassword,
  });
  return res.data;
};