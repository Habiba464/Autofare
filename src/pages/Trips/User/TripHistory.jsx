// src/pages/Trips/User/TripHistory.jsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Car,
  DollarSign,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Sidebar from "../../../components/Sidebar";
import "../../../components/Sidebar.css";
import API from "../../../APi/axiosConfig";
import { ENDPOINTS } from "../../../APi/endpoints";
import { useMe } from "../../../hooks/useMe";
import "./TripHistory.css";

function TripHistory() {
  const navigate = useNavigate();
  const { me, loading: meLoading } = useMe();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [allTrips, setAllTrips] = useState([]);
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalFarePaid: 0,
    totalViolations: 0,
  });
  const [loadError, setLoadError] = useState("");
  const [loadingTrips, setLoadingTrips] = useState(true);

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

  const fetchTripData = useCallback(async (from, to) => {
    if (!localStorage.getItem("token")) return;
    setLoadingTrips(true);
    setLoadError("");
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const { data } = await API.get(ENDPOINTS.TRIPS_HISTORY, { params });
      setStats(
        data.stats || {
          totalTrips: 0,
          totalFarePaid: 0,
          totalViolations: 0,
        }
      );
      setAllTrips(data.trips || []);
    } catch {
      setLoadError("Could not load trips.");
      setAllTrips([]);
    } finally {
      setLoadingTrips(false);
    }
  }, []);

  useEffect(() => {
    fetchTripData("", "");
  }, [fetchTripData]);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchTripData(dateFrom, dateTo);
  };

  const handleResetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
    fetchTripData("", "");
  };

  const totalPages = Math.max(1, Math.ceil(allTrips.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTrips = allTrips.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="wallet-page-container">
      <Sidebar userData={userData} />

      <main className="wallet-main-content">
        <header className="wallet-page-header">
          <div>
            <h1>Trip History</h1>
            <p>View and manage your trip records and payments</p>
          </div>
        </header>

        {loadError && (
          <p style={{ color: "#b91c1c", marginBottom: "1rem" }}>{loadError}</p>
        )}

        <section className="trip-filter-section">
          <div className="trip-filter-row">
            <div className="trip-filter-group">
              <label htmlFor="date-from" className="trip-filter-label">
                From
              </label>
              <div className="trip-date-input-wrapper">
                <Calendar className="trip-date-icon" size={18} />
                <input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="trip-date-input"
                />
              </div>
            </div>
            <div className="trip-filter-group">
              <label htmlFor="date-to" className="trip-filter-label">
                To
              </label>
              <div className="trip-date-input-wrapper">
                <Calendar className="trip-date-icon" size={18} />
                <input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="trip-date-input"
                />
              </div>
            </div>
            <div className="trip-filter-actions">
              <button
                type="button"
                className="trip-apply-btn"
                onClick={handleApplyFilters}
              >
                Apply
              </button>
              <button
                type="button"
                className="trip-reset-btn"
                onClick={handleResetFilters}
              >
                Reset
              </button>
            </div>
          </div>
        </section>

        <section className="trip-stats-section">
          <div className="trip-stat-card trip-stat-blue">
            <div className="trip-stat-icon-wrapper trip-stat-icon-blue">
              <Car className="trip-stat-icon" size={24} />
            </div>
            <div className="trip-stat-content">
              <p className="trip-stat-label">Total Trips</p>
              <h2 className="trip-stat-value">{stats.totalTrips}</h2>
            </div>
          </div>

          <div className="trip-stat-card trip-stat-green">
            <div className="trip-stat-icon-wrapper trip-stat-icon-green">
              <DollarSign className="trip-stat-icon" size={24} />
            </div>
            <div className="trip-stat-content">
              <p className="trip-stat-label">Total Fare Paid</p>
              <h2 className="trip-stat-value">
                {Number(stats.totalFarePaid).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                EGP
              </h2>
            </div>
          </div>

          <div className="trip-stat-card trip-stat-red">
            <div className="trip-stat-icon-wrapper trip-stat-icon-red">
              <AlertTriangle className="trip-stat-icon" size={24} />
            </div>
            <div className="trip-stat-content">
              <p className="trip-stat-label">Unpaid Violations (est.)</p>
              <h2 className="trip-stat-value">
                {Number(stats.totalViolations).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                EGP
              </h2>
            </div>
          </div>
        </section>

        <section className="trip-table-section">
          <div className="trip-table-wrapper">
            {loadingTrips ? (
              <p style={{ padding: "2rem" }}>Loading trips…</p>
            ) : (
              <table className="trip-table">
                <thead>
                  <tr>
                    <th>Trip ID</th>
                    <th>Date & Time</th>
                    <th>Vehicle Plate</th>
                    <th>Route Name</th>
                    <th>Fare Amount</th>
                    <th>Status</th>
                    <th>Violation Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTrips.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>
                        No trips found for this account or filters.
                      </td>
                    </tr>
                  ) : (
                    currentTrips.map((trip) => (
                      <tr key={trip.id}>
                        <td className="trip-id-cell">{trip.id}</td>
                        <td>{trip.dateTime}</td>
                        <td className="trip-vehicle-cell">{trip.vehiclePlate}</td>
                        <td>{trip.gateName}</td>
                        <td className="trip-fare-cell">
                          {Number(trip.fareAmount).toFixed(2)} EGP
                        </td>
                        <td>
                          <span
                            className={`trip-status-badge ${
                              trip.status === "Paid"
                                ? "trip-status-paid"
                                : "trip-status-not-paid"
                            }`}
                          >
                            {trip.status}
                          </span>
                        </td>
                        <td className="trip-violation-cell">
                          {trip.violationAmount > 0
                            ? `${Number(trip.violationAmount).toFixed(2)} EGP`
                            : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <div className="trip-pagination">
          <button
            type="button"
            className="trip-pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          <div className="trip-pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                className={`trip-pagination-number ${
                  currentPage === page ? "trip-pagination-active" : ""
                }`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="trip-pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      </main>
    </div>
  );
}

export default TripHistory;
