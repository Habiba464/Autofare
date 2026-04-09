// src/pages/Auth/Signup.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../APi/axiosConfig";
import { ENDPOINTS } from "../../APi/endpoints";
import {
  validateNationalIdEG,
  validatePhoneDigits,
} from "../../utils/paymentValidation";
import "./Signup.css";

function firstApiErrorMessage(data) {
  if (!data || typeof data !== "object") return null;
  if (Array.isArray(data.non_field_errors) && data.non_field_errors[0]) {
    return data.non_field_errors[0];
  }
  if (typeof data.detail === "string") return data.detail;
  for (const [key, val] of Object.entries(data)) {
    if (Array.isArray(val) && val[0]) return `${key.replace(/_/g, " ")}: ${val[0]}`;
    if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      const nested = firstApiErrorMessage(val);
      if (nested) return nested;
    }
  }
  return null;
}

function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Multi-step form: 1, 2, 3
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    fullName: "",
    email: "",
    phone: "",
    nationalId: "",

    // Step 2: Vehicle Information
    vehiclePlate: null,
    vehicleType: "",
    vehicleModel: "",
    vehicleColor: "",

    // Step 3: Account Security
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
          ? files[0]
          : value,
    });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setError("");
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    setError("");
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const nidErr = validateNationalIdEG(formData.nationalId);
    if (nidErr) {
      setError(nidErr);
      return;
    }
    const phErr = validatePhoneDigits(formData.phone);
    if (phErr) {
      setError(phErr);
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = new FormData();
      payload.append("fullName", formData.fullName);
      payload.append("email", formData.email);
      payload.append("phone", formData.phone);
      payload.append("nationalId", formData.nationalId);
      payload.append("vehiclePlate", formData.vehiclePlate);
      payload.append("vehicleType", formData.vehicleType);
      payload.append("vehicleModel", formData.vehicleModel);
      payload.append("vehicleColor", formData.vehicleColor);
      payload.append("password", formData.password);
      payload.append("confirmPassword", formData.confirmPassword);
      payload.append("agreeToTerms", formData.agreeToTerms);
      const response = await API.post(ENDPOINTS.SIGNUP, payload);
      if (response.status === 201 || response.status === 200) {
        localStorage.setItem("token", response.data.access);
        localStorage.setItem("userName", response.data.name);
        navigate("/dashboard");
      }
    } catch (err) {
      const msg =
        firstApiErrorMessage(err.response?.data) ||
        "Could not create account. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      {/* Background decoration */}
      <div className="signup-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      {/* Signup Container */}
      <div className="signup-container">
        {/* Left Side - Branding */}
        <div className="signup-branding">
          <div className="branding-content">
            <div className="brand-logo">
              <span className="logo-text">GatePass</span>
            </div>

            <h1 className="branding-title">
              Join GatePass
              <br />
              Today
            </h1>

            <p className="branding-description">
              Create your account in just 3 simple steps and start experiencing
              seamless, automated gate payments across Egypt.
            </p>

            {/* Progress Indicator */}
            <div className="signup-progress">
              <div className="progress-steps">
                <div
                  className={`progress-step ${step >= 1 ? "active" : ""} ${
                    step > 1 ? "completed" : ""
                  }`}
                >
                  <div className="step-circle">{step > 1 ? "✓" : "1"}</div>
                  <div className="step-label">Personal Info</div>
                </div>
                <div className="progress-line"></div>
                <div
                  className={`progress-step ${step >= 2 ? "active" : ""} ${
                    step > 2 ? "completed" : ""
                  }`}
                >
                  <div className="step-circle">{step > 2 ? "✓" : "2"}</div>
                  <div className="step-label">Vehicle Details</div>
                </div>
                <div className="progress-line"></div>
                <div className={`progress-step ${step >= 3 ? "active" : ""}`}>
                  <div className="step-circle">3</div>
                  <div className="step-label">Security</div>
                </div>
              </div>
            </div>

            <div className="branding-features">
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Quick 3-Step Registration</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Instant Account Activation</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>No Setup Fees</span>
              </div>
            </div>

            <div className="branding-badge">
              🇪🇬 Official Government Platform
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="signup-form-section">
          <div className="form-wrapper">
            {/* Form Header */}
            <div className="form-header">
              <h2 className="form-title">Create Your Account</h2>
              <p className="form-subtitle">
                Step {step} of 3 -{" "}
                {step === 1
                  ? "Personal Information"
                  : step === 2
                  ? "Vehicle Information"
                  : "Account Security"}
              </p>
            </div>

            {error && (
              <div className="error-message-ui">
                <span className="error-icon" aria-hidden="true">
                  ⚠️
                </span>
                {error}
              </div>
            )}

            {/* Multi-Step Form */}
            <form
              className="signup-form"
              onSubmit={step === 3 ? handleSubmit : handleNextStep}
            >
              {/* STEP 1: Personal Information */}
              {step === 1 && (
                <div className="form-step" data-step="1">
                  {/* Full Name */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="fullName">
                      Full Name
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon">👤</span>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        className="form-input"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">
                      Email Address
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon">✉️</span>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-input"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">
                      Phone Number
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon">📱</span>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="form-input"
                        placeholder="+20 123 456 7890"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  {/* National ID */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="nationalId">
                      National ID Number
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon">🪪</span>
                      <input
                        type="text"
                        id="nationalId"
                        name="nationalId"
                        className="form-input"
                        placeholder="Enter your national ID"
                        value={formData.nationalId}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Vehicle Information */}
              {step === 2 && (
                <div className="form-step" data-step="2">
                  {/* Vehicle Plate Number */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="vehiclePlate">
                      License Plate Number
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon">🚗</span>
                      <input
                        type="file"
                        id="vehiclePlate"
                        name="vehiclePlate"
                        className="form-input"
                        accept="image/*"
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    {formData.vehiclePlate && (
                      <p className="selected-file-name">
                        Selected file: {formData.vehiclePlate.name}
                      </p>
                    )}

                  </div>

                  {/* Vehicle Type */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="vehicleType">
                      Vehicle Type
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon">🚙</span>
                      <select
                        id="vehicleType"
                        name="vehicleType"
                        className="form-input form-select"
                        value={formData.vehicleType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select vehicle type</option>
                        <option value="sedan">Sedan</option>
                        <option value="suv">SUV</option>
                        <option value="truck">Truck</option>
                        <option value="van">Van</option>
                        <option value="motorcycle">Motorcycle</option>
                      </select>
                    </div>
                  </div>

                  {/* Vehicle Model */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="vehicleModel">
                      Vehicle Model & Year
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon">📋</span>
                      <input
                        type="text"
                        id="vehicleModel"
                        name="vehicleModel"
                        className="form-input"
                        placeholder="e.g., Toyota Camry 2022"
                        value={formData.vehicleModel}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Vehicle Color */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="vehicleColor">
                      Vehicle Color
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon">🎨</span>
                      <input
                        type="text"
                        id="vehicleColor"
                        name="vehicleColor"
                        className="form-input"
                        placeholder="e.g., Black, White, Silver"
                        value={formData.vehicleColor}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Account Security */}
              {step === 3 && (
                <div className="form-step" data-step="3">
                  {/* Password */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="password">
                      Create Password
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon">🔒</span>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        className="form-input"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                    <small className="input-hint">
                      Minimum 8 characters, include uppercase, lowercase, and
                      numbers
                    </small>
                  </div>

                  {/* Confirm Password */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="confirmPassword">
                      Confirm Password
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon">🔒</span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        className="form-input"
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="form-group">
                    <label className="checkbox-label terms-checkbox">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        required
                      />
                      <span className="checkbox-text">
                        I agree to the{" "}
                        <a href="/terms" className="link">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="/privacy" className="link">
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                  </div>

                  {/* Security Notice */}
                  <div className="security-notice">
                    <span className="notice-icon">🔐</span>
                    <p>
                      Your information is encrypted and stored securely. We
                      never share your personal data with third parties.
                    </p>
                  </div>
                </div>
              )}

              {/* Form Navigation Buttons */}
              <div className="form-navigation">
                {step > 1 && (
                  <button
                    type="button"
                    className="btn-back"
                    onClick={handlePrevStep}
                  >
                    ← Back
                  </button>
                )}

                <button
                  type="submit"
                  className="submit-button"
                  style={{ flex: step === 1 ? 1 : "initial" }}
                  disabled={loading}
                >
                  {step === 3
                    ? loading
                      ? "Creating account..."
                      : "Create Account"
                    : "Continue"}
                  {!loading && <span className="button-arrow">→</span>}
                </button>
              </div>
            </form>

            {/* Login Link */}
            <div className="login-prompt">
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="login-link"
                >
                  Sign In
                </button>
              </p>
            </div>

            {/* Back to Home Link */}
            <div className="back-home">
              <button onClick={() => navigate("/")} className="home-link">
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges Footer */}
      <div className="signup-footer">
        <div className="footer-badges">
          <div className="badge-item">
            <span className="badge-icon">🔒</span>
            <span>SSL Secured</span>
          </div>
          <div className="badge-item">
            <span className="badge-icon">✓</span>
            <span>Government Certified</span>
          </div>
          <div className="badge-item">
            <span className="badge-icon">🛡️</span>
            <span>Data Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
