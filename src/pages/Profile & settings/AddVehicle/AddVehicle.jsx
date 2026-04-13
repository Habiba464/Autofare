// src/pages/Profile & settings/AddVehicle/AddVehicle.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./AddVehicle.css";

function AddVehicle() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [licensePlate, setLicensePlate] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [toast, setToast] = useState(null); // { type: 'success', message: string }

  const handleCancel = () => {
    navigate(-1);
  };

  const handleAddVehicle = (event) => {
    event.preventDefault();
    setToast({ type: "success", message: t("addVehicle.success") });

    // Simulate redirect after short delay so user sees the toast
    setTimeout(() => {
      navigate(-1);
    }, 1200);
  };

  return (
    <main className="wallet-main-content add-vehicle-main">
      <div className="add-vehicle-centered">
        <header className="add-vehicle-header">
          <h1>{t("addVehicle.title")}</h1>
          <p>{t("addVehicle.subtitle")}</p>
        </header>

        <section className="add-vehicle-card">
          <form className="add-vehicle-form" onSubmit={handleAddVehicle}>
            {/* License Plate Number */}
            <div className="add-vehicle-field-group">
              <label htmlFor="license-plate" className="add-vehicle-label">
                <span className="add-vehicle-label-icon">🚗</span>
                {t("addVehicle.plate")}
              </label>
              <input
                id="license-plate"
                type="text"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                className="add-vehicle-input"
                placeholder={t("signup.phPlateEn")}
              />
            </div>

            {/* Vehicle Type */}
            <div className="add-vehicle-field-group">
              <label htmlFor="vehicle-type" className="add-vehicle-label">
                <span className="add-vehicle-label-icon">🚙</span>
                {t("addVehicle.type")}
              </label>
              <div className="add-vehicle-select-wrapper">
                <select
                  id="vehicle-type"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="add-vehicle-select"
                >
                  <option value="">{t("addVehicle.selectType")}</option>
                  <option value="private-car">{t("addVehicle.types.privateCar")}</option>
                  <option value="minibus">{t("addVehicle.types.minibus")}</option>
                  <option value="bus">{t("addVehicle.types.bus")}</option>
                  <option value="truck">{t("addVehicle.types.truck")}</option>
                </select>
              </div>
            </div>

            {/* Vehicle Model & Year */}
            <div className="add-vehicle-field-group">
              <label htmlFor="vehicle-model" className="add-vehicle-label">
                <span className="add-vehicle-label-icon">📋</span>
                {t("addVehicle.model")}
              </label>
              <input
                id="vehicle-model"
                type="text"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className="add-vehicle-input"
                placeholder={t("signup.phModel")}
              />
            </div>

            {/* Vehicle Color */}
            <div className="add-vehicle-field-group">
              <label htmlFor="vehicle-color" className="add-vehicle-label">
                <span className="add-vehicle-label-icon">🎨</span>
                {t("addVehicle.color")}
              </label>
              <input
                id="vehicle-color"
                type="text"
                value={vehicleColor}
                onChange={(e) => setVehicleColor(e.target.value)}
                className="add-vehicle-input"
                placeholder={t("signup.phColor")}
              />
            </div>

            <div className="add-vehicle-actions">
              <button
                type="button"
                className="add-vehicle-cancel-btn"
                onClick={handleCancel}
              >
                {t("common.cancel")}
              </button>
              <button type="submit" className="add-vehicle-submit-btn">
                {t("addVehicle.submit")}
              </button>
            </div>
          </form>
        </section>

        <section className="add-vehicle-info-box">
          <div className="add-vehicle-info-icon">ℹ️</div>
          <div className="add-vehicle-info-text">
            <h3>{t("addVehicle.infoTitle")}</h3>
            <p>{t("addVehicle.infoBody")}</p>
          </div>
        </section>
      </div>

      {toast && (
        <div className="add-vehicle-toast" role="alert">
          {toast.message}
        </div>
      )}
    </main>
  );
}

export default AddVehicle;

