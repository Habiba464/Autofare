// src/pages/Dashboard/AdminDashboard.jsx

import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Wallet,
  Car,
  AlertTriangle,
  TrendingUp,
  Info,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./AdminDashboard.css";

const MONTH_META = [
  { index: 1, short: "Jan" },
  { index: 2, short: "Feb" },
  { index: 3, short: "Mar" },
  { index: 4, short: "Apr" },
  { index: 5, short: "May" },
  { index: 6, short: "Jun" },
  { index: 7, short: "Jul" },
  { index: 8, short: "Aug" },
  { index: 9, short: "Sep" },
  { index: 10, short: "Oct" },
  { index: 11, short: "Nov" },
  { index: 12, short: "Dec" },
];

const ALL_MONTH_INDICES = MONTH_META.map((m) => m.index);

const MONTH_PRESETS = [
  { id: "all", months: ALL_MONTH_INDICES },
  { id: "h1", months: [1, 2, 3, 4, 5, 6] },
  { id: "h2", months: [7, 8, 9, 10, 11, 12] },
  { id: "q1", months: [1, 2, 3] },
  { id: "q2", months: [4, 5, 6] },
  { id: "q3", months: [7, 8, 9] },
  { id: "q4", months: [10, 11, 12] },
];

/** Mock monthly trips count + wallet activity (EGP) — same months, shared filter */
const MOCK_TRIPS_WALLET_BY_MONTH = [
  { monthIndex: 1, month: "Jan", trips: 118, wallet: 98200 },
  { monthIndex: 2, month: "Feb", trips: 105, wallet: 87600 },
  { monthIndex: 3, month: "Mar", trips: 132, wallet: 104500 },
  { monthIndex: 4, month: "Apr", trips: 128, wallet: 101200 },
  { monthIndex: 5, month: "May", trips: 141, wallet: 112800 },
  { monthIndex: 6, month: "Jun", trips: 156, wallet: 118400 },
  { monthIndex: 7, month: "Jul", trips: 162, wallet: 121900 },
  { monthIndex: 8, month: "Aug", trips: 149, wallet: 115600 },
  { monthIndex: 9, month: "Sep", trips: 138, wallet: 108300 },
  { monthIndex: 10, month: "Oct", trips: 151, wallet: 119700 },
  { monthIndex: 11, month: "Nov", trips: 144, wallet: 114200 },
  { monthIndex: 12, month: "Dec", trips: 168, wallet: 128500 },
];

function selectionRecordFromMonths(activeMonths) {
  const set = new Set(activeMonths);
  return Object.fromEntries(ALL_MONTH_INDICES.map((i) => [i, set.has(i)]));
}

function countSelected(record) {
  return ALL_MONTH_INDICES.filter((i) => record[i]).length;
}

function AdminDashboard() {
  const { t } = useTranslation();
  const [monthSelection, setMonthSelection] = useState(() =>
    selectionRecordFromMonths(ALL_MONTH_INDICES),
  );
  const [activePresetId, setActivePresetId] = useState("all");

  const filteredTrendData = useMemo(() => {
    return MOCK_TRIPS_WALLET_BY_MONTH.filter((d) => monthSelection[d.monthIndex]).sort(
      (a, b) => a.monthIndex - b.monthIndex,
    );
  }, [monthSelection]);

  const toggleMonth = useCallback((monthIndex) => {
    setActivePresetId(null);
    setMonthSelection((prev) => {
      if (prev[monthIndex] && countSelected(prev) <= 1) {
        return prev;
      }
      return { ...prev, [monthIndex]: !prev[monthIndex] };
    });
  }, []);

  const applyPreset = useCallback((preset) => {
    setActivePresetId(preset.id);
    setMonthSelection(selectionRecordFromMonths(preset.months));
  }, []);
  // Mock admin data
  const adminData = {
    name: "John Driver",
    role: "Fleet Manager",
  };

  // Mock dashboard stats
  const stats = {
    walletBalance: 1247.5,
    totalTrips: 142,
    tripsChange: "+12% from last month",
    activeViolations: 3,
    violationsFines: 450,
    monthlyRevenue: 2847,
  };

  // Mock recent trips
  const recentTrips = [
    {
      id: "rt-1",
      vehicle: "NYC-4521",
      time: "Today, 2:30 PM",
      fare: 24.5,
      status: "Completed",
    },
    {
      id: "rt-2",
      vehicle: "NYC-4521",
      time: "Today, 11:15 AM",
      fare: 18.75,
      status: "Violation",
    },
    {
      id: "rt-3",
      vehicle: "NYC-7834",
      time: "Yesterday, 4:45 PM",
      fare: 31.2,
      status: "Completed",
    },
    {
      id: "rt-4",
      vehicle: "NYC-2201",
      time: "Yesterday, 9:10 AM",
      fare: 19.0,
      status: "Completed",
    },
  ];

  const alerts = [
    {
      id: "al-1",
      type: "error",
      title: "New Violation",
      message: "Fine payment failed due to insufficient balance.",
      time: "2 hours ago",
    },
    {
      id: "al-2",
      type: "error",
      title: "Low fleet liquidity",
      message: "Three wallets are below the minimum threshold.",
      time: "5 hours ago",
    },
    {
      id: "al-3",
      type: "warning",
      title: "Settlement pending",
      message: "Batch reconciliation scheduled for midnight UTC.",
      time: "1 day ago",
    },
  ];

  return (
      <main className="admin-main-content">
        <header className="admin-page-header">
          <div className="admin-page-title-card">
            <h1>{t("adminDashboard.title")}</h1>
            <p>{t("adminDashboard.welcome", { name: adminData.name })}</p>
          </div>
        </header>

        {/* Stats Cards */}
        <section className="admin-stats-section">
          <div className="admin-stat-card green">
            <div className="stat-header">
              <div>
                <p className="stat-label">{t("adminDashboard.walletBalance")}</p>
                <h2 className="stat-value">
                  ${stats.walletBalance.toLocaleString()}
                </h2>
              </div>
              <div className="stat-icon stat-icon--lucide green-bg" aria-hidden>
                <Wallet size={22} strokeWidth={1.75} />
              </div>
            </div>
          </div>

          <div className="admin-stat-card blue">
            <div className="stat-header">
              <div>
                <p className="stat-label">{t("adminDashboard.totalTrips")}</p>
                <h2 className="stat-value">{stats.totalTrips}</h2>
              </div>
              <div className="stat-icon stat-icon--lucide blue-bg" aria-hidden>
                <Car size={22} strokeWidth={1.75} />
              </div>
            </div>
            <div className="stat-footer">
              <span className="stat-trend positive">{stats.tripsChange}</span>
            </div>
          </div>

          <div className="admin-stat-card red">
            <div className="stat-header">
              <div>
                <p className="stat-label">{t("adminDashboard.activeViolations")}</p>
                <h2 className="stat-value">{stats.activeViolations}</h2>
              </div>
              <div className="stat-icon stat-icon--lucide red-bg" aria-hidden>
                <AlertTriangle size={22} strokeWidth={1.75} />
              </div>
            </div>
            <div className="stat-footer">
              <span className="violations-fine">
                {t("adminDashboard.payFines", { amount: stats.violationsFines })}
              </span>
            </div>
          </div>

          <div className="admin-stat-card yellow">
            <div className="stat-header">
              <div>
                <p className="stat-label">{t("adminDashboard.thisMonth")}</p>
                <h2 className="stat-value">
                  ${stats.monthlyRevenue.toLocaleString()}
                </h2>
              </div>
              <div className="stat-icon stat-icon--lucide yellow-bg" aria-hidden>
                <TrendingUp size={22} strokeWidth={1.75} />
              </div>
            </div>
            <div className="stat-footer">
              <span className="stat-note">{t("adminDashboard.revenueNote")}</span>
            </div>
          </div>
        </section>

        {/* Trips & wallet — shared month filter, two line charts */}
        <section className="admin-trends-section" aria-labelledby="admin-trends-heading">
          <div className="admin-trends-filter-card admin-card">
            <div className="admin-trends-filter-head">
              <div>
                <h2 id="admin-trends-heading" className="admin-trends-title">
                  {t("adminDashboard.trendsTitle")}
                </h2>
                <p className="admin-trends-subtitle">{t("adminDashboard.trendsSubtitle")}</p>
              </div>
            </div>
            <div
              className="admin-trends-presets"
              role="toolbar"
              aria-label={t("adminWallet.monthPresetsToolbar")}
            >
              {MONTH_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`admin-trends-preset ${activePresetId === preset.id ? "admin-trends-preset--active" : ""}`}
                  onClick={() => applyPreset(preset)}
                >
                  {t(`adminDashboard.monthPreset.${preset.id}`)}
                </button>
              ))}
            </div>
            <div className="admin-trends-month-block">
              <span className="admin-trends-month-label">{t("common.months")}</span>
              <div className="admin-trends-month-chips" role="group" aria-label={t("adminWallet.toggleMonths")}>
                {MONTH_META.map(({ index, short }) => {
                  const on = monthSelection[index];
                  return (
                    <button
                      key={index}
                      type="button"
                      className={`admin-trends-chip ${on ? "admin-trends-chip--on" : ""}`}
                      onClick={() => toggleMonth(index)}
                      aria-pressed={on}
                    >
                      {short}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="admin-trends-charts-grid">
            <div className="admin-card admin-trend-chart-card">
              <h3 className="admin-trend-chart-title">{t("adminDashboard.chartTripsTitle")}</h3>
              <p className="admin-trend-chart-desc">{t("adminDashboard.chartTripsDesc")}</p>
              <div className="admin-trend-chart-plot">
                {filteredTrendData.length === 0 ? (
                  <p className="admin-trend-chart-empty">{t("common.selectMonth")}</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredTrendData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.35)" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={{ stroke: "rgba(148, 163, 184, 0.5)" }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={{ stroke: "rgba(148, 163, 184, 0.5)" }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        formatter={(v) => [Number(v).toLocaleString(), t("common.trips")]}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid rgba(148, 163, 184, 0.35)",
                          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="trips"
                        stroke="#007fff"
                        strokeWidth={2.5}
                        dot={{ fill: "#007fff", strokeWidth: 2, r: 4, stroke: "#fff" }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="admin-card admin-trend-chart-card">
              <h3 className="admin-trend-chart-title">{t("adminDashboard.chartWalletTitle")}</h3>
              <p className="admin-trend-chart-desc">{t("adminDashboard.chartWalletDesc")}</p>
              <div className="admin-trend-chart-plot">
                {filteredTrendData.length === 0 ? (
                  <p className="admin-trend-chart-empty">{t("common.selectMonth")}</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredTrendData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.35)" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={{ stroke: "rgba(148, 163, 184, 0.5)" }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={{ stroke: "rgba(148, 163, 184, 0.5)" }}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(v) => [
                          `${Number(v).toLocaleString()} ${t("common.egp")}`,
                          t("common.wallet"),
                        ]}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid rgba(148, 163, 184, 0.35)",
                          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="wallet"
                        stroke="#059669"
                        strokeWidth={2.5}
                        dot={{ fill: "#059669", strokeWidth: 2, r: 4, stroke: "#fff" }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <section className="admin-content-section">
          {/* Recent Trips */}
          <div className="admin-card">
            <h3 className="card-title">{t("adminDashboard.recentTrips")}</h3>
            <div className="admin-trips-list">
              {recentTrips.map((trip) => (
                <div key={trip.id} className="admin-trip-item">
                  <div className="trip-icon trip-icon--lucide" aria-hidden>
                    <Car size={20} strokeWidth={1.75} />
                  </div>
                  <div className="trip-details">
                    <h4>{trip.vehicle}</h4>
                    <p>{trip.time}</p>
                  </div>
                  <div className="trip-fare">${trip.fare}</div>
                  <span className={`trip-status ${trip.status.toLowerCase()}`}>
                    {trip.status === "Completed"
                      ? t("common.completed")
                      : trip.status === "Violation"
                        ? t("common.violation")
                        : trip.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Alerts */}
          <div className="admin-card">
            <h3 className="card-title">{t("adminDashboard.activeAlerts")}</h3>
            <div className="admin-alerts-list">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`admin-alert-item alert-${alert.type}`}
                >
                  <div className="alert-icon alert-icon--lucide" aria-hidden>
                    {alert.type === "warning" ? (
                      <Info size={20} strokeWidth={1.75} />
                    ) : (
                      <AlertTriangle size={20} strokeWidth={1.75} />
                    )}
                  </div>
                  <div className="alert-content">
                    <h4>{alert.title}</h4>
                    <p>{alert.message}</p>
                    <span className="alert-time">{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
  );
}

export default AdminDashboard;
