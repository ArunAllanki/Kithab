// src/context/AuthContext.js
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // Check token expiry on load (optional: add JWT decode if needed)
  useEffect(() => {
    if (!token || !user) {
      logout();
    }
  }, []);

  const login = async (idRaw, passwordRaw) => {
    const id = idRaw?.trim();
    const password = passwordRaw?.trim();
    if (!id || !password)
      return { success: false, message: "ID and password required" };

    const backendBase = process.env.REACT_APP_BACKEND_URL?.trim() || "";

    let endpoint = "";
    let body = {};

    // ---------- ADMIN ----------
    if (id === process.env.REACT_APP_ADMIN_ID) {
      endpoint = "admin/login";
      body = { adminId: id, password };
    }
    // ---------- FACULTY ----------
    else if (id.startsWith("FAC")) {
      endpoint = "faculty/login";
      body = { employeeId: id, password };
    }
    // ---------- STUDENT ----------
    else {
      endpoint = "student/login";
      body = { rollNumber: id, password };
    }

    const url = `${backendBase.replace(/\/$/, "")}/auth/${endpoint}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Login failed");

      const userKey =
        endpoint === "admin/login" ? "admin" : endpoint.split("/")[0];
      const userData = data[userKey];

      setUser(userData);
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", data.token);

      return { success: true, role: userData.role };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
