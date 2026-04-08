// src/pages/Profile & settings/AddVehicle/AddVehicle.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import "../../../components/Sidebar.css";
import API from "../../../APi/axiosConfig";
import { ENDPOINTS } from "../../../APi/endpoints";
import { useMe } from "../../../hooks/useMe";
import "./AddVehicle.css";

function AddVehicle() {
  const navigate = useNavigate();
  const { me, loading: meLoading } = useMe();

  const [licensePlate, setLicensePlate] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const userData = useMemo(
    () =>
      me
        ? { name: me.name, fleetId: me.fleet_id, photoUrl: me.photo_url || null }
        : {
            name: localStorage.getItem("userName") || "…",
            fleetId: "…",
            photoUrl: null,
          },
    [me]
  );

  useEffect(() => {
    if (!meLoading && !localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [meLoading, navigate]);

  const validate = () => {
    const err = {};
    const plate = licensePlate.trim().toUpperCase();
    if (plate.length < 3) err.licensePlate = "Enter a valid license plate.";
    else if (!/^[\w\s-]+$/i.test(plate)) {
      err.licensePlate = "Plate contains invalid characters.";
    }
    if (!vehicleType) err.vehicleType = "Select a vehicle type.";
    if (!vehicleModel.trim() || vehicleModel.trim().length < 2) {
      err.vehicleModel = "Enter model and year (min. 2 characters).";
    }
    if (!vehicleColor.trim() || vehicleColor.trim().length < 2) {
      err.vehicleColor = "Enter a color (min. 2 characters).";
    }
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleAddVehicle = async (event) => {
    event.preventDefault();
    setToast(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await API.post(ENDPOINTS.VEHICLES, {
        vehicleType,
        licensePlate: licensePlate.trim(),
        vehicleModel: vehicleModel.trim(),
        vehicleColor: vehicleColor.trim(),
      });
      setToast({ type: "success", message: "Vehicle added successfully." });
      setTimeout(() => navigate("/dashboard/profile/edit"), 1000);
    } catch (err) {
      const d = err.response?.data;
      let msg = "Could not add vehicle.";
      if (d && typeof d === "object") {
        const key = Object.keys(d).find((k) => Array.isArray(d[k]) && d[k][0]);
        if (key) msg = `${key}: ${d[key][0]}`;
        else if (d.detail) msg = d.detail;
      }
      setToast({ type: "error", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="wallet-page-container">
      <Sidebar userData={userData} />

      <main className="wallet-main-content add-vehicle-main">
        <header className="add-vehicle-header">
          <h1>Add Vehicle</h1>
          <p>Enter your vehicle details to link it to your Autofare account.</p>
        </header>

        <section className="add-vehicle-card">
          <form className="add-vehicle-form" onSubmit={handleAddVehicle}>
            <div className="add-vehicle-field-group">
              <label htmlFor="license-plate" className="add-vehicle-label">
                <span className="add-vehicle-label-icon">🚗</span>
                License Plate Number
              </label>
              <input
                id="license-plate"
                type="text"
                required
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                className="add-vehicle-input"
                placeholder="e.g., ABC 1234"
              />
              {fieldErrors.licensePlate && (
                <p className="add-vehicle-error">{fieldErrors.licensePlate}</p>
              )}
            </div>

            <div className="add-vehicle-field-group">
              <label htmlFor="vehicle-type" className="add-vehicle-label">
                <span className="add-vehicle-label-icon">🚙</span>
                Vehicle Type
              </label>
              <div className="add-vehicle-select-wrapper">
                <select
                  id="vehicle-type"
                  required
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="add-vehicle-select"
                >
                  <option value="">Select vehicle type</option>
                  <option value="private-car">Private Car</option>
                  <option value="minibus">Minibus</option>
                  <option value="bus">Bus</option>
                  <option value="truck">Truck</option>
                </select>
              </div>
              {fieldErrors.vehicleType && (
                <p className="add-vehicle-error">{fieldErrors.vehicleType}</p>
              )}
            </div>

            <div className="add-vehicle-field-group">
              <label htmlFor="vehicle-model" className="add-vehicle-label">
                <span className="add-vehicle-label-icon">📋</span>
                Vehicle Model &amp; Year
              </label>
              <input
                id="vehicle-model"
                type="text"
                required
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className="add-vehicle-input"
                placeholder="e.g., Toyota Camry 2022"
              />
              {fieldErrors.vehicleModel && (
                <p className="add-vehicle-error">{fieldErrors.vehicleModel}</p>
              )}
            </div>

            <div className="add-vehicle-field-group">
              <label htmlFor="vehicle-color" className="add-vehicle-label">
                <span className="add-vehicle-label-icon">🎨</span>
                Vehicle Color
              </label>
              <input
                id="vehicle-color"
                type="text"
                required
                value={vehicleColor}
                onChange={(e) => setVehicleColor(e.target.value)}
                className="add-vehicle-input"
                placeholder="Enter vehicle color"
              />
              {fieldErrors.vehicleColor && (
                <p className="add-vehicle-error">{fieldErrors.vehicleColor}</p>
              )}
            </div>

            <div className="add-vehicle-actions">
              <button
                type="button"
                className="add-vehicle-cancel-btn"
                onClick={handleCancel}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="add-vehicle-submit-btn"
                disabled={submitting}
              >
                {submitting ? "Adding…" : "+ Add Vehicle"}
              </button>
            </div>
          </form>
        </section>

        <section className="add-vehicle-info-box">
          <div className="add-vehicle-info-icon">ℹ️</div>
          <div className="add-vehicle-info-text">
            <h3>Vehicle Information</h3>
            <p>
              Make sure all vehicle details are accurate. Duplicate plates are not
              allowed.
            </p>
          </div>
        </section>

        {toast && (
          <div
            className="add-vehicle-toast"
            role="alert"
            style={
              toast.type === "error"
                ? { background: "#fef2f2", color: "#b91c1c" }
                : undefined
            }
          >
            {toast.message}
          </div>
        )}
      </main>
    </div>
  );
}

export default AddVehicle;
