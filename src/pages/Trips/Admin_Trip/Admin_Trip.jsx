// src/pages/Trips/Admin_Trip/Admin_Trip.jsx

import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  DollarSign,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { EGYPT_GOVERNORATES } from "../../../data/egyptGovernorates";
import "./Admin_Trip.css";

/**
 * Theme-aligned trip-volume scale (Misr-Gate accent blues + slate neutrals).
 * Index 0 = highest trips in the current sample … index n−1 = lowest.
 * Used for both pie and bar so the same governorate keeps the same color.
 */
const TRIP_VOLUME_THEME_PALETTE = [
  { color: "#0f172a", tier: "tier1" },
  { color: "#0c4a6e", tier: "tier2" },
  { color: "#0066cc", tier: "tier3" },
  { color: "#007fff", tier: "tier4" },
  { color: "#3b82f6", tier: "tier5" },
  { color: "#60a5fa", tier: "tier6" },
  { color: "#64748b", tier: "tier7" },
  { color: "#94a3b8", tier: "tier8" },
];

function buildRandomGovernorateSeries() {
  const pool = EGYPT_GOVERNORATES.filter((g) => g !== "Cairo");
  const count = 7;
  const picked = ["Cairo"];
  for (let i = 0; i < count && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked.map((name) => ({
    name,
    trips: Math.floor(Math.random() * 520) + 42,
  }));
}

/** Assign fill by trip-count rank within this dataset (ties: stable order from sort). */
function assignTripVolumeThemeColors(rows) {
  const byTrips = [...rows].sort((a, b) => b.trips - a.trips || a.name.localeCompare(b.name));
  const rankIndexByName = new Map(byTrips.map((d, i) => [d.name, i]));
  const maxIdx = TRIP_VOLUME_THEME_PALETTE.length - 1;
  return rows.map((d) => {
    const rankIndex = rankIndexByName.get(d.name) ?? 0;
    const paletteIdx = Math.min(rankIndex, maxIdx);
    const { color, tier } = TRIP_VOLUME_THEME_PALETTE[paletteIdx];
    return { ...d, fill: color, tier, volumeRank: rankIndex + 1 };
  });
}

const SEED_TRIPS = [
  {
    id: "SYS-TRIP-001",
    dateTime: "Oct 25, 2024 09:45 AM",
    governorate: "Cairo",
    vehiclePlate: "ABC-123",
    gateName: "Gate A - North Entrance",
    fareAmount: 25.5,
    violationAmount: 0,
    status: "Paid",
  },
  {
    id: "SYS-TRIP-002",
    dateTime: "Oct 25, 2024 10:05 AM",
    governorate: "Giza",
    vehiclePlate: "XYZ-789",
    gateName: "Gate B - South Exit",
    fareAmount: 32.0,
    violationAmount: 50,
    status: "Violation",
  },
  {
    id: "SYS-TRIP-003",
    dateTime: "Oct 25, 2024 11:20 AM",
    governorate: "Alexandria",
    vehiclePlate: "DEF-456",
    gateName: "Gate C - East Entrance",
    fareAmount: 18.75,
    violationAmount: 0,
    status: "Paid",
  },
  {
    id: "SYS-TRIP-004",
    dateTime: "Oct 24, 2024 02:15 PM",
    governorate: "Sharqia",
    vehiclePlate: "JKL-012",
    gateName: "Gate D - West Exit",
    fareAmount: 28.5,
    violationAmount: 75,
    status: "Violation",
  },
  {
    id: "SYS-TRIP-005",
    dateTime: "Oct 24, 2024 04:30 PM",
    governorate: "Cairo",
    vehiclePlate: "MNO-345",
    gateName: "Gate A - North Entrance",
    fareAmount: 15.25,
    violationAmount: 0,
    status: "Paid",
  },
  {
    id: "SYS-TRIP-006",
    dateTime: "Oct 23, 2024 08:00 AM",
    governorate: "Qalyubia",
    vehiclePlate: "PQR-111",
    gateName: "Gate B - South Exit",
    fareAmount: 40.0,
    violationAmount: 0,
    status: "Paid",
  },
];

function Admin_Trip() {
  const { t } = useTranslation();
  const [governorateSeriesRaw] = useState(() => buildRandomGovernorateSeries());
  const governorateSeries = useMemo(
    () => assignTripVolumeThemeColors(governorateSeriesRaw),
    [governorateSeriesRaw],
  );

  const pieChartData = useMemo(() => {
    const rows = governorateSeries.map((d) => ({
      name: d.name,
      value: d.trips,
      fill: d.fill,
      tier: d.tier,
      volumeRank: d.volumeRank,
    }));
    const cairo = rows.find((d) => d.name === "Cairo");
    const rest = rows.filter((d) => d.name !== "Cairo");
    return cairo ? [cairo, ...rest] : rows;
  }, [governorateSeries]);

  const barChartData = useMemo(() => {
    const sorted = [...governorateSeries].sort((a, b) => b.trips - a.trips);
    const cairo = sorted.find((d) => d.name === "Cairo");
    const rest = sorted.filter((d) => d.name !== "Cairo");
    return cairo ? [cairo, ...rest] : sorted;
  }, [governorateSeries]);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [transactionType, setTransactionType] = useState("all");
  const [governorate, setGovernorate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const stats = {
    totalSystemRevenue: 1250000,
    totalSystemViolations: 1240,
  };

  const filteredTrips = useMemo(() => {
    return SEED_TRIPS.filter((trip) => {
      if (governorate && trip.governorate !== governorate) return false;
      if (transactionType === "violation" && trip.status !== "Violation") return false;
      if (transactionType === "fare" && trip.status !== "Paid") return false;
      return true;
    });
  }, [governorate, transactionType]);

  const handleApplyFilters = () => {
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setTransactionType("all");
    setGovernorate("");
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filteredTrips.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTrips = filteredTrips.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <main className="wallet-main-content admin-trip-main">
      <header className="admin-trip-header">
        <div className="admin-page-title-card">
          <h1>{t("adminTrip.systemLogsTitle")}</h1>
          <p>{t("adminTrip.systemLogsSubtitle")}</p>
        </div>
      </header>

      <section className="admin-trip-filter-section">
        <div className="admin-trip-filter-row">
          <div className="admin-trip-filter-group">
            <label htmlFor="admin-date-from" className="admin-trip-filter-label">
              {t("trips.from")}
            </label>
            <div className="admin-trip-date-input-wrapper">
              <Calendar className="admin-trip-date-icon" size={18} />
              <input
                id="admin-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="admin-trip-date-input"
              />
            </div>
          </div>

          <div className="admin-trip-filter-group">
            <label htmlFor="admin-date-to" className="admin-trip-filter-label">
              {t("trips.to")}
            </label>
            <div className="admin-trip-date-input-wrapper">
              <Calendar className="admin-trip-date-icon" size={18} />
              <input
                id="admin-date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="admin-trip-date-input"
              />
            </div>
          </div>

          <div className="admin-trip-filter-group admin-trip-filter-group--grow">
            <label htmlFor="admin-trip-governorate" className="admin-trip-filter-label">
              {t("trips.governorate")}
            </label>
            <div className="admin-trip-governorate-wrapper">
              <MapPin className="admin-trip-governorate-icon" size={18} />
              <select
                id="admin-trip-governorate"
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                className="admin-trip-governorate-select"
              >
                <option value="">{t("trips.allGov")}</option>
                {EGYPT_GOVERNORATES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-trip-filter-group">
            <label htmlFor="admin-transaction-type" className="admin-trip-filter-label">
              {t("adminTrip.transactionType")}
            </label>
            <select
              id="admin-transaction-type"
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="admin-trip-select"
            >
              <option value="all">{t("common.allTypes")}</option>
              <option value="fare">{t("common.fare")}</option>
              <option value="recharge">{t("common.recharge")}</option>
              <option value="violation">{t("common.violation")}</option>
            </select>
          </div>

          <div className="admin-trip-filter-actions">
            <button type="button" className="admin-trip-apply-btn" onClick={handleApplyFilters}>
              {t("common.apply")}
            </button>
            <button type="button" className="admin-trip-reset-btn" onClick={handleResetFilters}>
              {t("common.reset")}
            </button>
          </div>
        </div>
      </section>

      <section className="admin-trip-stats-section">
        <div className="admin-trip-stat-card admin-trip-stat-revenue">
          <div className="admin-trip-stat-icon-wrapper admin-trip-stat-icon-green">
            <DollarSign className="admin-trip-stat-icon" size={24} />
          </div>
          <div className="admin-trip-stat-content">
            <p className="admin-trip-stat-label">{t("adminTrip.statTotalRevenue")}</p>
            <h2 className="admin-trip-stat-value">
              {stats.totalSystemRevenue.toLocaleString()} {t("common.egp")}
            </h2>
          </div>
        </div>

        <div className="admin-trip-stat-card admin-trip-stat-violations">
          <div className="admin-trip-stat-icon-wrapper admin-trip-stat-icon-red">
            <AlertTriangle className="admin-trip-stat-icon" size={24} />
          </div>
          <div className="admin-trip-stat-content">
            <p className="admin-trip-stat-label">{t("adminTrip.statTotalViolations")}</p>
            <h2 className="admin-trip-stat-value">{stats.totalSystemViolations.toLocaleString()}</h2>
          </div>
        </div>
      </section>

      <section className="admin-trip-charts-section" aria-label={t("adminTrip.chartsAria")}>
        <div
          className="admin-trip-chart-legend-panel"
          role="region"
          aria-labelledby="admin-trip-chart-legend-title"
        >
          <h3 id="admin-trip-chart-legend-title" className="admin-trip-chart-legend-panel__title">
            {t("adminTrip.chartColorLegend.title")}
          </h3>
          <p className="admin-trip-chart-legend-panel__intro">{t("adminTrip.chartColorLegend.intro")}</p>
          <ul className="admin-trip-chart-legend-grid">
            {TRIP_VOLUME_THEME_PALETTE.map(({ color, tier }) => (
              <li key={tier} className="admin-trip-chart-legend-item">
                <span
                  className="admin-trip-chart-legend-swatch"
                  style={{ backgroundColor: color }}
                  aria-hidden
                />
                <div className="admin-trip-chart-legend-text">
                  <span className="admin-trip-chart-legend-item__title">
                    {t(`adminTrip.chartColorLegend.${tier}.title`)}
                  </span>
                  <span className="admin-trip-chart-legend-item__desc">
                    {t(`adminTrip.chartColorLegend.${tier}.desc`)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-trip-charts-row">
        <div className="admin-trip-chart-card">
          <div className="admin-trip-chart-card__head">
            <h3 className="admin-trip-chart-card__title">{t("adminTrip.pieTitle")}</h3>
            <p className="admin-trip-chart-card__subtitle">{t("adminTrip.pieSubtitle")}</p>
          </div>
          <div className="admin-trip-chart-card__plot admin-trip-chart-card__plot--pie">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="48%"
                  innerRadius="42%"
                  outerRadius="72%"
                  paddingAngle={2}
                >
                  {pieChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} stroke="rgba(255,255,255,0.85)" strokeWidth={1} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toLocaleString()} ${t("common.trips").toLowerCase()}`,
                    t("adminTrip.tooltipCount"),
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid rgba(148, 163, 184, 0.35)",
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  layout="horizontal"
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-trip-chart-card">
          <div className="admin-trip-chart-card__head">
            <h3 className="admin-trip-chart-card__title">{t("adminTrip.barTitle")}</h3>
            <p className="admin-trip-chart-card__subtitle">{t("adminTrip.barSubtitle")}</p>
          </div>
          <div className="admin-trip-chart-card__plot admin-trip-chart-card__plot--bar">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={barChartData}
                margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.35)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={{ stroke: "rgba(148, 163, 184, 0.5)" }}
                  tickFormatter={(v) => v.toLocaleString()}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={108}
                  tick={{ fontSize: 11, fill: "#475569" }}
                  axisLine={{ stroke: "rgba(148, 163, 184, 0.5)" }}
                />
                <Tooltip
                  formatter={(value) => [`${Number(value).toLocaleString()}`, t("common.trips")]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid rgba(148, 163, 184, 0.35)",
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                  }}
                />
                <Bar dataKey="trips" name={t("common.trips")} radius={[0, 8, 8, 0]} maxBarSize={28}>
                  {barChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        </div>
      </section>

      <section className="admin-trip-table-section">
        <div className="admin-trip-table-wrapper">
          <table className="admin-trip-table">
            <thead>
              <tr>
                <th>{t("adminTrip.thTripId")}</th>
                <th>{t("adminTrip.thDateTime")}</th>
                <th>{t("adminTrip.thGov")}</th>
                <th>{t("adminTrip.thPlate")}</th>
                <th>{t("adminTrip.thGate")}</th>
                <th>{t("adminTrip.thFare")}</th>
                <th>{t("adminTrip.thViolation")}</th>
                <th>{t("adminTrip.thStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {currentTrips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-trip-table-empty">
                    {t("adminTrip.empty")}
                  </td>
                </tr>
              ) : (
                currentTrips.map((trip) => (
                  <tr key={trip.id}>
                    <td className="admin-trip-id-cell">{trip.id}</td>
                    <td>{trip.dateTime}</td>
                    <td>{trip.governorate}</td>
                    <td className="admin-trip-vehicle-cell">{trip.vehiclePlate}</td>
                    <td>{trip.gateName}</td>
                    <td className="admin-trip-fare-cell">
                      {trip.fareAmount.toFixed(2)} {t("common.egp")}
                    </td>
                    <td className="admin-trip-violation-cell">
                      {trip.violationAmount > 0
                        ? `${trip.violationAmount.toFixed(2)} ${t("common.egp")}`
                        : "-"}
                    </td>
                    <td>
                      <span
                        className={`admin-trip-status-badge ${
                          trip.status === "Paid"
                            ? "admin-trip-status-paid"
                            : "admin-trip-status-violation"
                        }`}
                      >
                        {trip.status === "Paid" ? t("common.paid") : t("common.violation")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="admin-trip-pagination">
        <button
          type="button"
          className="admin-trip-pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={18} />
          {t("common.previous")}
        </button>
        <div className="admin-trip-pagination-numbers">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              className={`admin-trip-pagination-number ${
                page === currentPage ? "admin-trip-pagination-active" : ""
              }`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="admin-trip-pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          {t("common.next")}
          <ChevronRight size={18} />
        </button>
      </div>
    </main>
  );
}

export default Admin_Trip;
