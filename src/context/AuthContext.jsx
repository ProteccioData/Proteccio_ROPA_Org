import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("portal_token");

    if (!token) {
      setLoading(false);
      return;
    }

    verifyUser();
  }, []);

  const verifyUser = async () => {
    try {
      const res = await axiosInstance.get("/auth/verify");
      setUser(res.data.user);
    } catch (err) {
      sessionStorage.removeItem("portal_token");
    } finally {
      setLoading(false);
    }
  };

  const loginUser = (user, token) => {
    sessionStorage.setItem("portal_token", token);
    sessionStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    sessionStorage.removeItem("portal_token");
    sessionStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
