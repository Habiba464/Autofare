// src/pages/Profile & settings/EditProfile.jsx

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Eye,
  EyeOff,
  Car,
  Trash2,
  Lock,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import "../../components/Sidebar.css";
import API from "../../APi/axiosConfig";
import { ENDPOINTS } from "../../APi/endpoints";
import { useMe } from "../../hooks/useMe";
import { validatePhoneDigits } from "../../utils/paymentValidation";
import "./EditProfile.css";

function stripEgyptPrefix(phone) {
  const p = String(phone || "").trim();
  if (p.startsWith("+20")) return p.slice(3).trim();
  if (p.startsWith("20") && p.length > 10) return p.slice(2).trim();
  return p.replace(/^\+/, "");
}

function EditProfile() {
  const navigate = useNavigate();
  const { me, loading, refetch } = useMe();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoMsg, setPhotoMsg] = useState({ type: "", text: "" });
  const photoInputRef = useRef(null);

  const [verificationPassword, setVerificationPassword] = useState("");
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verificationMessage, setVerificationMessage] = useState("");

  const [saveError, setSaveError] = useState("");
  const [saveOk, setSaveOk] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [loading, navigate]);

  useEffect(() => {
    if (!me) return;
    setFullName(me.name || "");
    setEmail(me.email || "");
    setPhone(stripEgyptPrefix(me.phone));
  }, [me]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  const userData = useMemo(
    () =>
      me
        ? { name: me.name, fleetId: me.fleet_id, photoUrl: me.photo_url || null }
        : { name: fullName || "…", fleetId: "…", photoUrl: null },
    [me, fullName]
  );

  const vehicles = me?.vehicles ?? [];

  const handleSaveChanges = async (event) => {
    event.preventDefault();
    setSaveError("");
    setSaveOk("");

    const phDigits = phone.replace(/\D/g, "");
    const phErr = validatePhoneDigits(phDigits);
    if (phErr) {
      setSaveError(phErr);
      return;
    }
    if (!verificationPassword) {
      setSaveError("Enter your current password to save changes.");
      return;
    }
    if (verificationStatus !== "success") {
      setSaveError('Click "Verify" and confirm your current password first.');
      return;
    }
    if (password && password.length < 8) {
      setSaveError("New password must be at least 8 characters.");
      return;
    }

    const body = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phDigits.startsWith("20") ? `+${phDigits}` : `+20${phDigits}`,
      currentPassword: verificationPassword,
    };
    if (password.trim()) {
      body.newPassword = password.trim();
    }

    setSaving(true);
    try {
      await API.patch(ENDPOINTS.ME, body);
      setSaveOk("Profile updated successfully.");
      setPassword("");
      await refetch();
    } catch (err) {
      const d = err.response?.data;
      let msg =
        (Array.isArray(d?.non_field_errors) && d.non_field_errors[0]) ||
        d?.detail ||
        "Could not save changes.";
      if (d && typeof d === "object") {
        const entry = Object.entries(d).find(
          ([, v]) => Array.isArray(v) && v[0]
        );
        if (entry) msg = `${entry[0]}: ${entry[1][0]}`;
      }
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard/profile");
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm("Remove this vehicle from your account?")) return;
    try {
      await API.delete(`${ENDPOINTS.VEHICLES}${id}/`);
      await refetch();
    } catch {
      setSaveError("Could not remove vehicle.");
    }
  };

  const handlePickPhoto = (e) => {
    const f = e.target.files?.[0];
    setPhotoMsg({ type: "", text: "" });
    if (!f) {
      setPhotoFile(null);
      return;
    }
    const okTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!okTypes.includes(f.type)) {
      setPhotoMsg({ type: "error", text: "Use a JPG, PNG, or WebP image." });
      setPhotoFile(null);
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setPhotoMsg({ type: "error", text: "Image must be 2 MB or smaller." });
      setPhotoFile(null);
      return;
    }
    setPhotoFile(f);
  };

  const handleUploadPhoto = async () => {
    if (!photoFile) {
      setPhotoMsg({ type: "error", text: "Choose a photo first." });
      return;
    }
    setPhotoUploading(true);
    setPhotoMsg({ type: "", text: "" });
    try {
      const fd = new FormData();
      fd.append("photo", photoFile);
      await API.post(ENDPOINTS.ME_PHOTO, fd);
      setPhotoFile(null);
      if (photoInputRef.current) photoInputRef.current.value = "";
      setPhotoMsg({ type: "ok", text: "Profile photo updated." });
      await refetch();
    } catch (err) {
      const d = err.response?.data;
      const msg =
        (Array.isArray(d?.photo) && d.photo[0]) ||
        d?.detail ||
        "Could not upload photo.";
      setPhotoMsg({ type: "error", text: msg });
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleVerifyPassword = async () => {
    setVerificationMessage("");
    if (!verificationPassword) {
      setVerificationStatus("error");
      setVerificationMessage("Enter your current password.");
      return;
    }
    try {
      const { data } = await API.post(ENDPOINTS.VERIFY_PASSWORD, {
        password: verificationPassword,
      });
      if (data.valid) {
        setVerificationStatus("success");
        setVerificationMessage("Correct password. You can save changes.");
      } else {
        setVerificationStatus("error");
        setVerificationMessage("Wrong password. Please try again.");
      }
    } catch {
      setVerificationStatus("error");
      setVerificationMessage("Could not verify. Try again.");
    }
  };

  if (loading && !me) {
    return (
      <div className="wallet-page-container">
        <Sidebar userData={userData} />
        <main className="wallet-main-content edit-profile-main">
          <p style={{ padding: "2rem" }}>Loading…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="wallet-page-container">
      <Sidebar userData={userData} />

      <main className="wallet-main-content edit-profile-main">
        <header className="edit-profile-header">
          <h1>Edit Profile</h1>
          <p>Update your personal and vehicle information.</p>
        </header>

        {(saveError || saveOk) && (
          <p
            style={{
              marginBottom: "1rem",
              color: saveOk ? "#15803d" : "#b91c1c",
            }}
          >
            {saveOk || saveError}
          </p>
        )}

        <section className="edit-profile-card edit-profile-photo-card">
          <h2 className="edit-profile-card-title">Profile photo</h2>
          <p className="edit-profile-hint">
            JPG, PNG, or WebP — max 2 MB. Shown on your profile and in the sidebar.
          </p>
          <div className="edit-profile-photo-row">
            <div className="edit-profile-photo-preview-wrap">
              {(photoPreview || me?.photo_url) && (
                <img
                  src={photoPreview || me?.photo_url}
                  alt=""
                  className="edit-profile-photo-preview"
                />
              )}
            </div>
            <div className="edit-profile-photo-actions">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="edit-profile-photo-input"
                id="profile-photo-input"
                onChange={handlePickPhoto}
              />
              <label
                htmlFor="profile-photo-input"
                className="edit-profile-photo-browse"
              >
                Choose image
              </label>
              <button
                type="button"
                className="edit-profile-save-btn edit-profile-photo-upload-btn"
                onClick={handleUploadPhoto}
                disabled={photoUploading || !photoFile}
              >
                {photoUploading ? "Uploading…" : "Upload photo"}
              </button>
            </div>
          </div>
          {photoMsg.text && (
            <p
              className={
                photoMsg.type === "ok"
                  ? "edit-profile-verification-success"
                  : "edit-profile-verification-error"
              }
              style={{ marginTop: "0.75rem" }}
            >
              {photoMsg.text}
            </p>
          )}
        </section>

        <div className="edit-profile-grid">
          <section className="edit-profile-card">
            <h2 className="edit-profile-card-title">Profile Information</h2>
            <form className="edit-profile-form" onSubmit={handleSaveChanges}>
              <div className="edit-profile-field-group">
                <label htmlFor="full-name" className="edit-profile-label">
                  Full Name
                </label>
                <div className="edit-profile-input-wrapper">
                  <input
                    id="full-name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={150}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="edit-profile-input"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="edit-profile-field-group">
                <label htmlFor="email" className="edit-profile-label">
                  Email Address
                </label>
                <div className="edit-profile-input-wrapper">
                  <Mail className="edit-profile-input-icon" size={18} />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="edit-profile-input edit-profile-input-with-icon"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className="edit-profile-field-group">
                <label htmlFor="new-password" className="edit-profile-label">
                  New Password (optional)
                </label>
                <div className="edit-profile-input-wrapper">
                  <Lock className="edit-profile-input-icon" size={18} />
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="edit-profile-input edit-profile-input-with-icon edit-profile-input-with-toggle"
                    placeholder="Leave blank to keep current password"
                  />
                  <button
                    type="button"
                    className="edit-profile-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="edit-profile-field-group">
                <label htmlFor="phone" className="edit-profile-label">
                  Phone Number
                </label>
                <div className="edit-profile-input-row">
                  <span className="edit-profile-prefix">+20</span>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="edit-profile-input edit-profile-input-flex"
                    placeholder="10 XXXX XXXX"
                  />
                </div>
              </div>

              <div className="edit-profile-field-group">
                <span className="edit-profile-label">National ID</span>
                <p className="edit-profile-readonly">
                  {me?.national_id || "—"}
                </p>
                <p className="edit-profile-hint">
                  National ID is set at registration and cannot be changed.
                </p>
              </div>

              <div className="edit-profile-actions">
                <button
                  type="button"
                  className="edit-profile-cancel-btn"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="edit-profile-save-btn"
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </section>

          <div className="edit-profile-right-column">
            <section className="edit-profile-card edit-profile-vehicles-card">
              <div className="edit-profile-vehicles-header">
                <h2 className="edit-profile-card-title">My Vehicles</h2>
                <button
                  type="button"
                  className="edit-profile-add-vehicle-btn"
                  onClick={() => navigate("/dashboard/profile/add-vehicle")}
                >
                  + Add Vehicle
                </button>
              </div>
              <div className="edit-profile-vehicle-list">
                {vehicles.length === 0 ? (
                  <p style={{ color: "#64748b" }}>No vehicles yet.</p>
                ) : (
                  vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="edit-profile-vehicle-item">
                      <div className="edit-profile-vehicle-main">
                        <div className="edit-profile-vehicle-icon">
                          <Car size={18} />
                        </div>
                        <div className="edit-profile-vehicle-info">
                          <span className="edit-profile-vehicle-plate">
                            {vehicle.plate}
                          </span>
                          <span className="edit-profile-vehicle-model">
                            {vehicle.model}
                          </span>
                        </div>
                      </div>
                      <div className="edit-profile-vehicle-meta">
                        <span className="edit-profile-vehicle-type-badge">
                          {vehicle.type}
                        </span>
                        <div className="edit-profile-vehicle-actions">
                          <button
                            type="button"
                            className="edit-profile-icon-btn edit-profile-icon-danger"
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            aria-label="Delete vehicle"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="edit-profile-card edit-profile-verification-card">
              <h2 className="edit-profile-card-title">Password Verification</h2>
              <p className="edit-profile-verification-text">
                Confirm your current password before saving profile changes.
              </p>
              <div className="edit-profile-field-group">
                <label htmlFor="verify-password" className="edit-profile-label">
                  Current Password
                </label>
                <input
                  id="verify-password"
                  type="password"
                  value={verificationPassword}
                  onChange={(e) => {
                    setVerificationPassword(e.target.value);
                    setVerificationStatus(null);
                    setVerificationMessage("");
                  }}
                  className={`edit-profile-input ${
                    verificationStatus === "success"
                      ? "edit-profile-input-success"
                      : verificationStatus === "error"
                        ? "edit-profile-input-error"
                        : ""
                  }`}
                  placeholder="Enter your current password"
                />
              </div>
              <button
                type="button"
                className="edit-profile-verify-btn"
                onClick={handleVerifyPassword}
              >
                Verify
              </button>
              {verificationMessage && (
                <p
                  className={`edit-profile-verification-message ${
                    verificationStatus === "success"
                      ? "edit-profile-verification-success"
                      : verificationStatus === "error"
                        ? "edit-profile-verification-error"
                        : ""
                  }`}
                >
                  {verificationMessage}
                </p>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EditProfile;
