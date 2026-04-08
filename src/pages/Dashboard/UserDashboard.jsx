import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useMe } from "../../hooks/useMe";
import "./UserDashboard.css";

function UserDashboard() {
  const navigate = useNavigate();
  const { me, loading, refetch } = useMe();

  useEffect(() => {
    if (!loading && !localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [loading, navigate]);

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

  const balance = me ? parseFloat(me.wallet_balance) : 0;
  const stats = me?.stats;
  const recentTrips = me?.recent_trips ?? [];

  const alerts = useMemo(() => {
    const list = [];
    if (me && balance < 100 && balance >= 0) {
      list.push({
        id: 1,
        type: "warning",
        icon: "⚠️",
        title: "Low Balance",
        message: `Your wallet is below 100 EGP (${balance.toFixed(2)} EGP).`,
        time: "Now",
      });
    }
    if (stats?.unpaid_violations > 0) {
      list.push({
        id: 2,
        type: "error",
        icon: "🚨",
        title: "Unpaid violations",
        message: `You have ${stats.unpaid_violations} unpaid violation(s).`,
        time: "Review trips",
      });
    }
    return list;
  }, [me, balance, stats]);

  if (loading && !me) {
    return (
      <div className="dashboard-container">
        <Sidebar userData={userData} />
        <main className="main-content">
          <p style={{ padding: "2rem" }}>Loading your dashboard…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar userData={userData} />

      <main className="main-content">
        <header className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p>
              Welcome back, {me?.name?.split(" ")[0] || "driver"}. Here&apos;s your
              overview.
            </p>
          </div>
          <button
            type="button"
            className="link-btn"
            onClick={() => refetch()}
            style={{ alignSelf: "flex-start" }}
          >
            Refresh
          </button>
        </header>

        <section className="stats-section">
          <div className="stat-card green">
            <div className="stat-header">
              <div>
                <p className="stat-label">Wallet Balance</p>
                <h2 className="stat-value">
                  {balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  EGP
                </h2>
              </div>
              <div className="stat-icon green-bg">💰</div>
            </div>
            <div className="stat-footer">
              <span className="badge-success">Live</span>
              <span className="stat-note">Synced from your account</span>
            </div>
          </div>

          <div className="stat-card blue">
            <div className="stat-header">
              <div>
                <p className="stat-label">Total Trips</p>
                <h2 className="stat-value">{stats?.total_trips ?? 0}</h2>
              </div>
              <div className="stat-icon blue-bg">🚙</div>
            </div>
            <div className="stat-footer">
              <span className="stat-trend positive">All recorded trips</span>
            </div>
          </div>

          <div className="stat-card red">
            <div className="stat-header">
              <div>
                <p className="stat-label">Unpaid Violations</p>
                <h2 className="stat-value">{stats?.unpaid_violations ?? 0}</h2>
              </div>
              <div className="stat-icon red-bg">⚠️</div>
            </div>
            <div className="stat-footer">
              {stats?.unpaid_violations > 0 ? (
                <span className="badge-danger">Action may be required</span>
              ) : (
                <span className="badge-success">None</span>
              )}
            </div>
          </div>

          <div className="stat-card yellow">
            <div className="stat-header">
              <div>
                <p className="stat-label">Total Fare (recorded)</p>
                <h2 className="stat-value">
                  {parseFloat(stats?.total_fare_paid || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  EGP
                </h2>
              </div>
              <div className="stat-icon yellow-bg">📈</div>
            </div>
            <div className="stat-footer">
              <span className="stat-note">From toll trips in the system</span>
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="card">
            <div className="card-header">
              <h3>Recent Trips</h3>
              <button
                className="link-btn"
                onClick={() => navigate("/dashboard/trips")}
              >
                View All
              </button>
            </div>
            <div className="trips-table">
              <table>
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Time</th>
                    <th>Fare</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrips.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "1rem" }}>
                        No trips recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recentTrips.map((trip) => (
                      <tr key={trip.id}>
                        <td>
                          <div className="vehicle-info">
                            <div className="vehicle-icon">🚗</div>
                            <span>{trip.vehicle}</span>
                          </div>
                        </td>
                        <td>{trip.time}</td>
                        <td className="fare">EGP {Number(trip.fare).toFixed(2)}</td>
                        <td>
                          <span
                            className={`status-badge ${String(trip.status)
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {trip.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="sidebar-cards">
            <div className="card">
              <h3 className="card-title">Active Alerts</h3>
              <div className="alerts-list">
                {alerts.length === 0 ? (
                  <p style={{ padding: "0.5rem", color: "#64748b" }}>
                    No alerts right now.
                  </p>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`alert-item alert-${alert.type}`}
                    >
                      <div className="alert-icon">{alert.icon}</div>
                      <div className="alert-content">
                        <h4>{alert.title}</h4>
                        <p>{alert.message}</p>
                        <span className="alert-time">{alert.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default UserDashboard;
