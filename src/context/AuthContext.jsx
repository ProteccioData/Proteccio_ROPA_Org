// context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cachedUser = sessionStorage.getItem("user");
    const cachedPermissions = sessionStorage.getItem("permissions");

    if (cachedUser) setUser(JSON.parse(cachedUser));
    if (cachedPermissions) setPermissions(JSON.parse(cachedPermissions));

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
      setPermissions(res.data.permissions);

      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      sessionStorage.setItem("permissions", JSON.stringify(res.data.permissions));

    } catch (err) {
      sessionStorage.clear();
      setUser(null);
      setPermissions(null);
    } finally {
      setLoading(false);
    }
  };

  const loginUser = (user, token, permissions = null) => {
    sessionStorage.setItem("portal_token", token);
    sessionStorage.setItem("user", JSON.stringify(user));

    if (permissions) {
      setPermissions(permissions);
      sessionStorage.setItem("permissions", JSON.stringify(permissions));
    }

    setUser(user);
  };

  const logout = () => {
    sessionStorage.clear();
    setUser(null);
    setPermissions(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        loading,
        loginUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
