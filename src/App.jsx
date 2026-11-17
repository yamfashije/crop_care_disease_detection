import React, { useState } from "react";
import "./App.css";

import Login from "./pages/Login.jsx";
import Register from "./pages/register.jsx";
import FarmerDashboard from "./pages/FarmerDashboard.jsx";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // NAVIGATION
  function navigateTo(nextPage) {
    setError("");
    setSuccess("");
    setPage(nextPage);
  }

  // API REQUEST FUNCTION
  async function requestApi(endpoint, options = {}) {
    let response;

    const token = localStorage.getItem("cropcare_token");

    try {
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : {}),
          ...(options.headers || {}),
        },
      });
    } catch (err) {
      throw new Error(
        "Ntibishobotse kugera kuri backend. Reba ko server.js iri gukora."
      );
    }

    const raw = await response.text();

    let data = {};

    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      throw new Error(
        "Backend yagaruye igisubizo kitari JSON."
      );
    }

    // SESSION EXPIRED
    if (
      response.status === 401 &&
      endpoint !== "/auth/login"
    ) {
      localStorage.removeItem("cropcare_token");
      localStorage.removeItem("cropcare_user");

      setUser(null);
      setPage("login");

      throw new Error(
        "Session yawe yarangiye. Ongera winjire."
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message || `Request failed (${response.status}).`
      );
    }

    return data;
  }

  // LOGIN
  async function handleLogin(credentials) {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await requestApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: credentials.email.trim(),
          password: credentials.password,
        }),
      });

      if (!data.token || !data.user) {
        throw new Error(
          "Backend ntiyagaruye token cyangwa user."
        );
      }

      localStorage.setItem(
        "cropcare_token",
        data.token
      );

      localStorage.setItem(
        "cropcare_user",
        JSON.stringify(data.user)
      );

      setUser(data.user);
      setPage("dashboard");

    } catch (err) {
      setError(err.message);
      throw err;

    } finally {
      setLoading(false);
    }
  }

  // REGISTER
  async function handleRegister(details) {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const fullName =
        details.fullName?.trim() ||
        details.name?.trim();

      const data = await requestApi("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName,
          email: details.email?.trim(),
          phone: details.phone,
          district: details.district,
          password: details.password,
        }),
      });

      setPage("login");

      setSuccess(
        data.message ||
        "Kwiyandikisha byagenze neza. Injira."
      );

      return data;

    } catch (err) {
      setError(err.message);
      throw err;

    } finally {
      setLoading(false);
    }
  }

  // LOGOUT
  function handleLogout() {
    localStorage.removeItem("cropcare_token");
    localStorage.removeItem("cropcare_user");

    setUser(null);
    setError("");
    setSuccess("");
    setPage("login");
  }

  // FARMER DASHBOARD
  if (page === "dashboard" && user) {
    return (
      <FarmerDashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  // REGISTER PAGE
  if (page === "register") {
    return (
      <Register
        onRegister={handleRegister}
        onNavigate={navigateTo}
        loading={loading}
        error={error}
      />
    );
  }

  // LOGIN PAGE
  return (
    <Login
      onLogin={handleLogin}
      onNavigate={navigateTo}
      loading={loading}
      error={error}
      success={success}
    />
  );
}

export default App;