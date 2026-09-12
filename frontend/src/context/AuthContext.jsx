import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/client";

const AuthContext = createContext(null);

const formatErrorMessage = (err, fallback) => {
  if (!err?.response) {
    return "Cannot connect to StudyVault backend (http://localhost:8000). Please verify the backend server is running.";
  }
  const detail = err.response.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || (typeof d === "string" ? d : JSON.stringify(d))).join(", ");
  }
  if (typeof detail === "object" && detail !== null) {
    return JSON.stringify(detail);
  }
  return fallback;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("studyvault_token");
      if (token) {
        try {
          const res = await authApi.getMe();
          setUser(res.data);
        } catch (err) {
          console.error("Token verification failed:", err);
          localStorage.removeItem("studyvault_token");
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem("studyvault_token", res.data.access_token);
      setUser(res.data.user);
      return true;
    } catch (err) {
      setError(formatErrorMessage(err, "Login failed. Please check your credentials."));
      return false;
    }
  };

  const register = async (formData) => {
    setError(null);
    try {
      const res = await authApi.register(formData);
      localStorage.setItem("studyvault_token", res.data.access_token);
      setUser(res.data.user);
      return true;
    } catch (err) {
      setError(formatErrorMessage(err, "Registration failed."));
      return false;
    }
  };

  const loginDemo = async () => {
    return login("student@studyvault.ai", "Student@123");
  };

  const resetPassword = async (email, newPassword) => {
    setError(null);
    try {
      const res = await authApi.resetPassword(email, newPassword);
      localStorage.setItem("studyvault_token", res.data.access_token);
      setUser(res.data.user);
      return true;
    } catch (err) {
      setError(formatErrorMessage(err, "Password reset failed."));
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("studyvault_token");
    setUser(null);
  };

  const updateSemester = async (semNumber) => {
    try {
      await authApi.updateSemester(semNumber);
      setUser((prev) => prev ? { ...prev, current_semester: semNumber } : null);
      return true;
    } catch (err) {
      console.error("Failed to update semester:", err);
      return false;
    }
  };

  const updateBranch = async (branchName) => {
    try {
      const res = await authApi.updateBranch(branchName);
      setUser((prev) => prev ? { ...prev, branch: branchName } : null);
      return true;
    } catch (err) {
      console.error("Failed to update branch:", err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      setError,
      login,
      register,
      loginDemo,
      resetPassword,
      logout,
      updateSemester,
      updateBranch
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
