import axiosInstance from "../utils/axiosInstance";

export const login = async (email, password) => {
  const res = await axiosInstance.post("/auth/login", {
    email,
    password,
  });

  return res.data;
};
