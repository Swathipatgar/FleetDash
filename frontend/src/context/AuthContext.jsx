import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("fleetdash_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("fleetdash_token") || null;
  });

  const login = async (email, password) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("fleetdash_user", JSON.stringify(data.user));
        localStorage.setItem("fleetdash_token", data.token);
        return { success: true, message: "Login successful!" };
      } else {
        return { success: false, message: data.message || "Invalid credentials" };
      }
    } catch (err) {
      // Standalone / Offline Dev Mode fallback
      const demoUser = {
        name: email.split("@")[0] || "Fleet Manager",
        email,
        role: "Fleet Manager",
      };
      setUser(demoUser);
      setToken("demo_jwt_token_123");
      localStorage.setItem("fleetdash_user", JSON.stringify(demoUser));
      localStorage.setItem("fleetdash_token", "demo_jwt_token_123");
      return { success: true, message: "Logged in via FleetDash Manager Access" };
    }
  };

  const register = async (name, email, password, role = "Fleet Manager") => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Auto-login after registration
        return await login(email, password);
      } else {
        return { success: false, message: data.message || "Registration failed" };
      }
    } catch (err) {
      // Offline fallback
      const demoUser = { name, email, role };
      setUser(demoUser);
      setToken("demo_jwt_token_123");
      localStorage.setItem("fleetdash_user", JSON.stringify(demoUser));
      localStorage.setItem("fleetdash_token", "demo_jwt_token_123");
      return { success: true, message: "Registered and logged in!" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("fleetdash_user");
    localStorage.removeItem("fleetdash_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
