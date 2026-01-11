import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import PasswordInput from "../components/PasswordInput"; // ✅ Reusable password field
import LoginFooter from "../components/LoginFooter";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        setError("Invalid email or password.");
      }
    } catch {
      setError("Server error. Please try again later.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin(e);
  };

  return (
    <div className="login-page">
      <img src="/logo.png" alt="Logo" className="logo" />

      <div className="login-container slide-in">
        <h2>Admin Login</h2>

        <form onSubmit={handleLogin} noValidate>
          {/* Email Input */}
          <div className="input-icon-wrapper">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="username"
              required
            />
          </div>

          {/* Password Input (global field) */}
          <PasswordInput
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 8 chars)"
            required
          />

          {error && <p className="alert-text error-text">{error}</p>}

          <button className="primary-btn" type="submit">
            Login
          </button>

          <p
            onClick={() => navigate("/forgot")}
            className="forgot-link"
            tabIndex={0}
          >
            Forgot Password?
          </p>
        </form>
      </div>

      <LoginFooter />
    </div>
  );
};

export default Login;
