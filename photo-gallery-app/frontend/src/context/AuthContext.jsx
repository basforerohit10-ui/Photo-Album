import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("gallery-current-user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("gallery-current-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("gallery-current-user");
    }
  }, [user]);

  const login = async (username, password, adminSecurityKey = "") => {
    try {
      const result = await api.login({ username, password, adminSecurityKey });
      const sessionUser = { ...result.user, token: result.token };
      setUser(sessionUser);
      return { ok: true, message: "Login successful.", user: sessionUser };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const result = await api.register(userData);
      return { ok: true, message: result.message };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  const registerAdmin = async (token, userData) => {
    try {
      const result = await api.registerAdmin(token, userData);
      return { ok: true, message: result.message };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, registerAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);