// src/pages/Profile & settings/ProfilePage.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  Edit,
  FileText,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import "../../components/Sidebar.css";
import API from "../../APi/axiosConfig";
import { ENDPOINTS } from "../../APi/endpoints";
import { useMe } from "../../hooks/useMe";
import "./ProfilePage.css";

function ProfilePage() {
  const navigate = useNavigate();
  const { me, loading, refetch, error } = useMe();
  const [toggleError, setToggleError] = useState("");

  useEffect(() => {
    if (!loading && !localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [loading, navigate]);

  const userData = useMemo(
    () =>
      me
        ? {
            name: me.name,
            email: me.email,
            phone: me.phone,
            fleetId: me.fleet_id,
            photoUrl: me.photo_url || null,
          }
        : {
            name: localStorage.getItem("userName") || "…",
            email: "",
            phone: "",
            fleetId: "…",
            photoUrl: null,
          },
    [me]
  );

  const avatarInitials = useMemo(() => {
    const n = (me?.name || userData.name || "").trim();
    if (!n) return "?";
    return n
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [me?.name, userData.name]);

  const vehicles = me?.vehicles ?? [];
  const quickStats = me?.stats
    ? {
        totalTrips: me.stats.total_trips,
        totalFines: me.stats.unpaid_violations,
        totalFare: parseFloat(me.stats.total_fare_paid || 0),
      }
    : { totalTrips: 0, totalFines: 0, totalFare: 0 };

  const toggleVehicleStatus = async (vehicleId) => {
    setToggleError("");
    const v = vehicles.find((x) => x.id === vehicleId);
    if (!v) return;
    try {
      await API.patch(`${ENDPOINTS.VEHICLES}${vehicleId}/`, {
        is_active: !v.is_active,
      });
      await refetch();
    } catch {
      setToggleError("Could not update vehicle status.");
    }
  };

  const handleEditProfile = () => {
    navigate("/dashboard/profile/edit");
  };

  if (loading && !me) {
    return (
      <div className="wallet-page-container">
        <Sidebar userData={userData} />
        <main className="wallet-main-content">
          <p style={{ padding: "2rem" }}>Loading profile…</p>
        </main>
      </div>
    );
  }

  if (error && !me) {
    return (
      <div className="wallet-page-container">
        <Sidebar userData={userData} />
        <main className="wallet-main-content">
          <p style={{ padding: "2rem", color: "#b91c1c" }}>
            Could not load profile. Please sign in again.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="wallet-page-container">
      <Sidebar userData={userData} />

      <main className="wallet-main-content">
        <header className="profile-page-header">
          <h1>Profile Settings</h1>
        </header>

        {toggleError && (
          <p style={{ color: "#b91c1c", marginBottom: "1rem" }}>{toggleError}</p>
        )}

        <section className="profile-user-card">
          <div className="profile-avatar-section">
            {me?.photo_url ? (
              <img
                src={me.photo_url}
                alt=""
                className="profile-avatar-image"
              />
            ) : (
              <div className="profile-avatar-placeholder profile-avatar-initials">
                {avatarInitials}
              </div>
            )}
            <div className="profile-avatar-actions">
              <button
                type="button"
                className="profile-avatar-action-btn"
                onClick={handleEditProfile}
                title="Change photo"
                aria-label="Change profile photo"
              >
                📷
              </button>
            </div>
          </div>

          <div className="profile-user-details">
            <h2 className="profile-user-name">{userData.name}</h2>
            <div className="profile-contact-info">
              <div className="profile-contact-item">
                <Mail size={18} className="profile-contact-icon" />
                <span>{userData.email || "—"}</span>
              </div>
              <div className="profile-contact-item">
                <Phone size={18} className="profile-contact-icon" />
                <span>{userData.phone || "—"}</span>
              </div>
              {me?.national_id ? (
                <div className="profile-contact-item">
                  <span className="profile-national-icon" aria-hidden="true">
                    🪪
                  </span>
                  <span>National ID: {me.national_id}</span>
                </div>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            className="profile-edit-btn"
            onClick={handleEditProfile}
          >
            <Edit size={18} />
            Edit Profile
          </button>
        </section>

        <div className="profile-content-grid">
          <section className="profile-vehicles-card">
            <h3 className="profile-card-title">Linked Vehicles</h3>
            <div className="profile-vehicles-list">
              {vehicles.length === 0 ? (
                <p style={{ color: "#64748b" }}>No vehicles linked yet.</p>
              ) : (
                vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="profile-vehicle-item">
                    <div className="profile-vehicle-info">
                      <span className="profile-vehicle-plate">{vehicle.plate}</span>
                      <span className="profile-vehicle-model">{vehicle.model}</span>
                    </div>
                    <div className="profile-vehicle-actions">
                      <button
                        type="button"
                        className={`profile-vehicle-status ${
                          vehicle.status === "Active"
                            ? "profile-vehicle-status-active"
                            : "profile-vehicle-status-inactive"
                        }`}
                        onClick={() => toggleVehicleStatus(vehicle.id)}
                      >
                        {vehicle.status}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="profile-stats-card">
            <h3 className="profile-card-title">Quick Stats</h3>
            <div className="profile-stats-grid">
              <div className="profile-stat-item">
                <div className="profile-stat-icon-wrapper profile-stat-icon-blue">
                  <FileText size={24} className="profile-stat-icon" />
                </div>
                <h3 className="profile-stat-value">{quickStats.totalTrips}</h3>
                <p className="profile-stat-label">Total Trips</p>
              </div>

              <div className="profile-stat-item">
                <div className="profile-stat-icon-wrapper profile-stat-icon-red">
                  <AlertTriangle size={24} className="profile-stat-icon" />
                </div>
                <h3 className="profile-stat-value">{quickStats.totalFines}</h3>
                <p className="profile-stat-label">Unpaid Violations</p>
              </div>

              <div className="profile-stat-item">
                <div className="profile-stat-icon-wrapper profile-stat-icon-green">
                  <DollarSign size={24} className="profile-stat-icon" />
                </div>
                <h3 className="profile-stat-value">
                  {quickStats.totalFare.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  EGP
                </h3>
                <p className="profile-stat-label">Total Fare</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
