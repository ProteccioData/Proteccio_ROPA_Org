import axiosInstance from "../utils/axiosInstance";

// GET profile
export const getProfile = () =>
  axiosInstance.get("/portal/profile");

// UPDATE profile
export const updateProfile = (payload) =>
  axiosInstance.put("/portal/profile", payload);

// CHANGE password
export const changePassword = (payload) =>
  axiosInstance.put("/portal/profile/password", payload);
