import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Wallet,
  Car,
  Truck,
  AlertTriangle,
  TrendingUp,
  AlertCircle,
  Eye,
  Trash2,
  CreditCard,
} from "lucide-react";
import UserPageHeader from "../../components/UserPageHeader";
import API from "../../APi/axiosConfig";
import { ENDPOINTS } from "../../APi/endpoints";
import {
  formatCount,
  formatMoney,
  formatSignedMoney,
  resolveLocale,
} from "../../utils/formatNumbers";
import "./UserDashboard.css";

function UserDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoadError("");
    try {
      const [meRes, walletRes] = await Promise.all([
        API.get(ENDPOINTS.ME),
        API.get(ENDPOINTS.WALLET),
      ]);
      setMe(meRes.data);
      setWallet(walletRes.data);
    } catch (e) {
      setLoadError(e.response?.data?.detail || e.message || i18n.t("dashboard.loadError"));
    } finally {
      setLoading(false);
    }
  }, [i18n]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const userData = useMemo(() => {
    if (!me) return { name: "", fleetId: "" };
    return { name: me.name || "", fleetId: me.fleet_id || "" };
  }, [me]);

  const stats = useMemo(() => {
    const s = me?.stats || {};
    const bal = parseFloat(wallet?.balance ?? me?.wallet_balance ?? 0, 10) || 0;
    const today = Number(s.today_trips ?? 0);
    const yest = Number(s.yesterday_trips ?? 0);
    let tripsChange = "—";
    if (today > 0 || yest > 0) {
      if (yest === 0) tripsChange = `${today} ${t("dashboard.vsYesterday", "vs yesterday")}`;
      else {
        const pct = Math.round(((today - yest) / yest) * 100);
        tripsChange = `${pct >= 0 ? "+" : ""}${pct}% ${t("dashboard.vsYesterday", "vs yesterday")}`;
      }
    }
    const curr = parseFloat(s.monthly_paid_fare ?? 0, 10) || 0;
    const prev = parseFloat(s.last_month_paid_fare ?? 0, 10) || 0;
    let revenueChange = "—";
    if (curr > 0 && prev === 0) revenueChange = t("dashboard.newThisMonth", "New this month");
    else if (prev > 0) {
      const pct = Math.round(((curr - prev) / prev) * 100);
      revenueChange = `${pct >= 0 ? "+" : ""}${pct}% ${t("dashboard.vsLastMonth", "vs last month")}`;
    }
    return {
      walletBalance: bal,
      todaysTrips: today,
      tripsChange,
      activeViolations: Number(s.unpaid_violations ?? 0),
      requiresAction: Number(s.unpaid_violations ?? 0) > 0,
      monthlyRevenue: curr,
      revenueChange,
    };
  }, [me, wallet, t]);

  const recentTrips = useMemo(() => {
    const rows = me?.recent_trips || [];
    return rows.map((trip) => ({
      id: trip.id,
      vehicle_id: trip.vehicle,
      vehicleType: trip.vehicle_type === "truck" ? "truck" : "car",
      timestamp: trip.time,
      fare_amount: Number(trip.fare ?? 0),
      payment_status: trip.status === "Completed" ? "paid" : "not_paid",
      violation_amount: Number(trip.violation_amount ?? 0),
    }));
  }, [me]);

  const alerts = useMemo(() => me?.alerts || [], [me]);

  const recentTransactions = useMemo(() => {
    const txs = wallet?.transactions || [];
    const loc = resolveLocale(i18n.language);
    return txs.slice(0, 8).map((tx) => {
      const d = new Date(tx.date);
      const dateStr = Number.isNaN(d.getTime())
        ? tx.date
        : d.toLocaleDateString(loc, { year: "numeric", month: "short", day: "numeric" });
      return {
        id: tx.id,
        date: dateStr,
        transactionType: tx.type,
        amount: parseFloat(tx.amount, 10) || 0,
        paymentMethod: tx.source || "Wallet",
        status: tx.status || "Completed",
      };
    });
  }, [wallet, i18n.language]);

  const linkedVehicles = useMemo(() => {
    const v = me?.vehicles || [];
    return v.map((x) => ({
      id: x.id,
      licensePlate: x.plate,
      model: x.model,
      status: x.status || "Active",
    }));
  }, [me]);

  const handleRemoveVehicle = async (id, plate) => {
    if (!window.confirm(t("common.removeVehicleConfirm", { plate }))) return;
    try {
      await API.delete(ENDPOINTS.VEHICLE(id));
      await loadData();
    } catch (e) {
      window.alert(e.response?.data?.detail || e.message || t("common.error", "Something went wrong."));
    }
  };

  const loc = resolveLocale(i18n.language);
  const egp = t("common.egp");
  const fmtMoney = (n) => formatMoney(n, loc, egp);
  const fmtSigned = (n) => formatSignedMoney(n, loc, egp);

  const subtitleName =
    (userData.name || "").trim().split(/\s+/)[0] || t("dashboard.guestName", "there");

  if (loading) {
    return (
      <div className="user-dashboard">
        <main className="user-dashboard__main">
          <p className="user-page-header glass-panel" style={{ padding: "24px" }}>
            {t("common.processing")}
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <main className="user-dashboard__main">
        {loadError ? (
          <p className="signup-form-error" style={{ marginBottom: 16 }} role="alert">
            {loadError}
          </p>
        ) : null}
        <UserPageHeader
          title={t("dashboard.title")}
          subtitle={t("dashboard.subtitle", { name: subtitleName })}
          user={userData}
        />

        <div className="user-dashboard__bento">
          <section className="user-dashboard__stats" aria-label="Summary statistics">
            <article className="stat-capsule glass-panel">
              <div className="stat-capsule__icon stat-capsule__icon--wallet" aria-hidden>
                <Wallet size={22} strokeWidth={1.75} />
              </div>
              <div className="stat-capsule__body">
                <p className="stat-capsule__label">{t("dashboard.walletBalance")}</p>
                <p className="stat-capsule__value numeric-display">{fmtMoney(stats.walletBalance)}</p>
                <div className="stat-capsule__meta">
                  <span className="badge-neon badge-neon--success">{t("common.active")}</span>
                  <span className="stat-capsule__note">{t("common.autoRechargeEnabled")}</span>
                </div>
              </div>
            </article>

            <article className="stat-capsule glass-panel">
              <div className="stat-capsule__icon stat-capsule__icon--trips" aria-hidden>
                <Car size={22} strokeWidth={1.75} />
              </div>
              <div className="stat-capsule__body">
                <p className="stat-capsule__label">{t("dashboard.todaysTrips")}</p>
                <p className="stat-capsule__value numeric-display">{formatCount(stats.todaysTrips, loc)}</p>
                <p className="stat-capsule__trend stat-capsule__trend--up">↑ {stats.tripsChange}</p>
              </div>
            </article>

            <article className="stat-capsule glass-panel">
              <div className="stat-capsule__icon stat-capsule__icon--violations" aria-hidden>
                <AlertTriangle size={22} strokeWidth={1.75} />
              </div>
              <div className="stat-capsule__body">
                <p className="stat-capsule__label">{t("dashboard.activeViolations")}</p>
                <p className="stat-capsule__value numeric-display">{formatCount(stats.activeViolations, loc)}</p>
                {stats.requiresAction && (
                  <span className="badge-neon badge-neon--danger">{t("common.requiresAction")}</span>
                )}
              </div>
            </article>

            <article className="stat-capsule glass-panel">
              <div className="stat-capsule__icon stat-capsule__icon--revenue" aria-hidden>
                <TrendingUp size={22} strokeWidth={1.75} />
              </div>
              <div className="stat-capsule__body">
                <p className="stat-capsule__label">{t("dashboard.monthlyRevenue")}</p>
                <p className="stat-capsule__value numeric-display">{fmtMoney(stats.monthlyRevenue)}</p>
                <p className="stat-capsule__trend stat-capsule__trend--up">↑ {stats.revenueChange}</p>
              </div>
            </article>
          </section>

          <section className="user-dashboard__trips glass-panel" aria-labelledby="recent-trips-heading">
            <div className="panel-head">
              <h2 id="recent-trips-heading" className="panel-head__title">
                {t("dashboard.recentTrips")}
              </h2>
              <button type="button" className="link-neon" onClick={() => navigate("/dashboard/trips")}>
                {t("dashboard.viewAll")}
              </button>
            </div>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t("dashboard.thVehicle")}</th>
                    <th>{t("dashboard.thTime")}</th>
                    <th>{t("dashboard.thFare")}</th>
                    <th>{t("dashboard.thStatus")}</th>
                    <th>{t("dashboard.thViolations")}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrips.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "20px", opacity: 0.8 }}>
                        {t("dashboard.noRecentTrips")}
                      </td>
                    </tr>
                  ) : (
                    recentTrips.map((trip) => (
                      <tr key={trip.id}>
                        <td>
                          <div className="vehicle-cell">
                            <span className="vehicle-cell__icon" aria-hidden>
                              {trip.vehicleType === "truck" ? (
                                <Truck size={18} strokeWidth={1.75} />
                              ) : (
                                <Car size={18} strokeWidth={1.75} />
                              )}
                            </span>
                            <span className="vehicle-cell__plate">{trip.vehicle_id}</span>
                          </div>
                        </td>
                        <td>{trip.timestamp}</td>
                        <td className="data-table__strong numeric-display">{fmtMoney(trip.fare_amount)}</td>
                        <td>
                          <span
                            className={
                              trip.payment_status === "paid" ? "pill pill--paid" : "pill pill--unpaid"
                            }
                          >
                            {trip.payment_status === "paid" ? t("common.paid") : t("common.notPaid")}
                          </span>
                        </td>
                        <td
                          className={
                            trip.violation_amount > 0
                              ? "data-table__violations data-table__violations--due"
                              : "data-table__violations"
                          }
                        >
                          {trip.violation_amount > 0 ? (
                            <span className="numeric-display">{fmtMoney(trip.violation_amount)}</span>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="user-dashboard__rail" aria-label="Alerts and vehicles">
            <section className="glass-panel glass-panel--glow-alert" aria-labelledby="alerts-heading">
              <h2 id="alerts-heading" className="panel-head__title panel-head__title--solo">
                {t("dashboard.activeAlerts")}
              </h2>
              {alerts.length === 0 ? (
                <p style={{ padding: "12px 4px", opacity: 0.75, fontSize: "0.9rem" }}>
                  {t("dashboard.noAlerts")}
                </p>
              ) : (
                <ul className="alert-stack">
                  {alerts.map((alert) => (
                    <li
                      key={alert.id}
                      className={
                        alert.severity === "critical"
                          ? "alert-tile alert-tile--critical"
                          : "alert-tile alert-tile--warning"
                      }
                    >
                      <div className="alert-tile__icon" aria-hidden>
                        {alert.severity === "critical" ? (
                          <AlertCircle size={22} strokeWidth={1.75} />
                        ) : (
                          <AlertTriangle size={22} strokeWidth={1.75} />
                        )}
                      </div>
                      <div className="alert-tile__body">
                        <p className="alert-tile__title">{alert.alert_type}</p>
                        {alert.alert_description && (
                          <p className="alert-tile__desc">{alert.alert_description}</p>
                        )}
                        <p className="alert-tile__time">{alert.time_elapsed}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="glass-panel" aria-labelledby="vehicles-heading">
              <h2 id="vehicles-heading" className="panel-head__title panel-head__title--solo">
                {t("dashboard.linkedVehicles")}
              </h2>
              <ul className="vehicle-list">
                {linkedVehicles.length === 0 ? (
                  <li className="vehicle-row glass-panel glass-panel--inset" style={{ justifyContent: "center" }}>
                    <p style={{ opacity: 0.8 }}>{t("profile.noVehicles")}</p>
                  </li>
                ) : (
                  linkedVehicles.map((v) => (
                    <li key={v.id} className="vehicle-row glass-panel glass-panel--inset">
                      <div className="vehicle-row__text">
                        <p className="vehicle-row__plate">{v.licensePlate}</p>
                        <p className="vehicle-row__model">{v.model}</p>
                      </div>
                      <span
                        className={v.status === "Active" ? "pill pill--paid" : "pill pill--inactive"}
                      >
                        {v.status === "Active" ? t("common.active") : t("common.inactive")}
                      </span>
                      <div className="vehicle-row__actions">
                        <button
                          type="button"
                          className="icon-action icon-action--view"
                          title={t("common.viewDetails")}
                          aria-label={`View ${v.licensePlate}`}
                          onClick={() => navigate("/dashboard/profile")}
                        >
                          <Eye size={18} strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          className="icon-action icon-action--danger"
                          title={t("common.removeVehicle")}
                          aria-label={`Remove ${v.licensePlate}`}
                          onClick={() => handleRemoveVehicle(v.id, v.licensePlate)}
                        >
                          <Trash2 size={18} strokeWidth={1.75} />
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </section>
          </aside>

          <div className="user-dashboard__payments-stack">
            <section className="glass-panel" aria-labelledby="recent-tx-heading">
              <h2 id="recent-tx-heading" className="panel-head__title panel-head__title--solo">
                {t("dashboard.recentTx")}
              </h2>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t("dashboard.thDate")}</th>
                      <th>{t("dashboard.thType")}</th>
                      <th>{t("dashboard.thAmount")}</th>
                      <th>{t("dashboard.thMethod")}</th>
                      <th>{t("dashboard.thStatus")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", padding: "20px", opacity: 0.8 }}>
                          {t("wallet.noTx")}
                        </td>
                      </tr>
                    ) : (
                      recentTransactions.map((tx) => (
                        <tr key={tx.id}>
                          <td>{tx.date}</td>
                          <td>
                            {tx.transactionType === "Fare"
                              ? t("common.fare")
                              : tx.transactionType === "Recharge"
                                ? t("common.recharge")
                                : tx.transactionType === "Fine"
                                  ? t("common.fine")
                                  : tx.transactionType}
                          </td>
                          <td
                            className={
                              tx.amount < 0
                                ? "data-table__amount data-table__amount--neg"
                                : "data-table__amount data-table__amount--pos"
                            }
                          >
                            <span className="numeric-display">{fmtSigned(tx.amount)}</span>
                          </td>
                          <td>
                            <span className="method-cell">
                              <CreditCard size={16} strokeWidth={1.5} aria-hidden />
                              {tx.paymentMethod}
                            </span>
                          </td>
                          <td>
                            <span className="pill pill--completed">{t("common.completed")}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UserDashboard;
