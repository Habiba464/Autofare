// src/pages/Auth/Login.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../APi/axiosConfig"; 
import { ENDPOINTS } from "../../APi/endpoints"; 
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(""); 

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); 

    try {
      const response = await API.post(ENDPOINTS.LOGIN, {
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 200) {
        localStorage.setItem("token", response.data.access);
        localStorage.setItem("userName", response.data.name);
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.non_field_errors?.[0] || 
                       err.response?.data?.detail || 
                       "Invalid email or password.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="login-container">
        <div className="login-branding">
          <div className="branding-content">
            <h1 className="branding-title">
              Your Journey <br /> Starts Here.
            </h1>
            <p className="branding-description">
              Experience the next generation of transport management with our
              secure, efficient, and smart platform.
            </p>

            <div className="branding-features">
              <div className="feature-item">
                <span className="feature-icon">🛡️</span>
                <span>Secure Payments & Wallets</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span>Real-time Trip Tracking</span>
              </div>
            </div>
            <div className="branding-badge">Certified Smart System 2026</div>
          </div>
        </div>

        <div className="login-form-section">
          <div className="form-wrapper">
            <div className="form-header">
              <h2 className="form-title">Welcome Back</h2>
              <p className="form-subtitle">
                Please enter your credentials to access your account.
              </p>
            </div>

            {/* Error Message UI */}
            {error && (
              <div className="error-message-ui">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="name@example.com"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{ paddingLeft: '16px' }} // عشان شلنا الأيقونة فبنظبط الـ padding
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-input"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    style={{ paddingLeft: '16px' }}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                  />
                  <span className="checkbox-text">Remember me</span>
                </label>
                
                <a href="#" className="forgot-link" onClick={(e) => e.preventDefault()}>
                  Forgot password?
                </a>
              </div>

              <button type="submit" className="submit-button" disabled={loading}>
                <span>{loading ? "Processing..." : "Sign In"}</span>
                {!loading && <span className="button-arrow">→</span>}
              </button>

              <div className="form-divider"><span>OR</span></div>
              {/*div Mode TO skip Sign in */}
              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  style={{
                    marginTop: '10px',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    textDecoration: 'underline'
                  }}
                >
                  (Dev Mode) Skip to Dashboard → 
                </button>
              </div>
              
              <div className="signup-prompt">
                <p>
                  Don't have an account?{" "}
                  <a href="/signup" className="signup-link">Create Account</a>
                </p>
              </div>
            </form>

            <div className="back-home">
              <button onClick={() => navigate("/")} className="home-link">
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
