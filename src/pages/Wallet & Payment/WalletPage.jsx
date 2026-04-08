// src/pages/Wallet & Payment/WalletPage.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "../../components/Sidebar.css";
import API from "../../APi/axiosConfig";
import { ENDPOINTS } from "../../APi/endpoints";
import { useMe } from "../../hooks/useMe";
import "./WalletPage.css";

function formatTxDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function WalletPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { me, loading: meLoading } = useMe();
  const [dateRange, setDateRange] = useState("");
  const [transactionType, setTransactionType] = useState("All Types");
  const [walletData, setWalletData] = useState(null);
  const [loadError, setLoadError] = useState("");

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!localStorage.getItem("token")) return;
      try {
        const { data } = await API.get(ENDPOINTS.WALLET);
        if (!cancelled) {
          setWalletData(data);
          setLoadError("");
        }
      } catch {
        if (!cancelled) {
          setLoadError("Could not load wallet. Try again.");
          setWalletData(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.pathname, me?.wallet_balance]);

  const walletBalance = walletData
    ? parseFloat(walletData.balance)
    : me
      ? parseFloat(me.wallet_balance)
      : 0;

  const summary = walletData?.summary || {
    total_recharged: "0",
    total_fares: "0",
    total_fines: "0",
  };

  const filteredTransactions = useMemo(() => {
    const txs = walletData?.transactions ?? [];
    return txs.filter((tx) => {
      if (transactionType !== "All Types" && tx.type !== transactionType) {
        return false;
      }
      if (dateRange) {
        const day = tx.date.slice(0, 10);
        if (day !== dateRange) return false;
      }
      return true;
    });
  }, [walletData, transactionType, dateRange]);

  const handleRecharge = () => {
    navigate("/dashboard/wallet/recharge");
  };

  return (
    <div className="wallet-page-container">
      <Sidebar userData={userData} />

      <main className="wallet-main-content">
        <header className="wallet-page-header">
          <div>
            <h1>Wallet & Payments</h1>
            <p>Manage your wallet and payment transactions</p>
          </div>
        </header>

        {loadError && (
          <p style={{ color: "#b91c1c", marginBottom: "1rem" }}>{loadError}</p>
        )}

        <section className="wallet-balance-card">
          <div className="wallet-balance-content">
            <h3 className="wallet-balance-title">Wallet Balance</h3>
            <p className="wallet-balance-value">
              {walletBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              EGP
            </p>
            <p className="wallet-balance-subtitle">Available balance</p>
          </div>
          <button
            type="button"
            className="wallet-recharge-btn"
            onClick={handleRecharge}
          >
            + Recharge Wallet
          </button>
        </section>

        <div className="wallet-filters-summary-row">
          <section className="wallet-filters-card">
            <h3 className="wallet-card-title">Transaction Filters</h3>
            <div className="wallet-filters-row">
              <div className="wallet-filter-group">
                <label htmlFor="date-range">Date (day)</label>
                <input
                  id="date-range"
                  type="date"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="wallet-input wallet-input-date"
                />
              </div>
              <div className="wallet-filter-group">
                <label htmlFor="transaction-type">Transaction Type</label>
                <select
                  id="transaction-type"
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="wallet-select"
                >
                  <option value="All Types">All Types</option>
                  <option value="Fare">Fare</option>
                  <option value="Recharge">Recharge</option>
                  <option value="Fine">Fine</option>
                </select>
              </div>
            </div>
          </section>

          <section className="wallet-summary-card">
            <h3 className="wallet-card-title">Summary</h3>
            <div className="wallet-summary-row">
              <span className="wallet-summary-label">Total Recharged</span>
              <span className="wallet-summary-value wallet-summary-paid">
                EGP{" "}
                {parseFloat(summary.total_recharged || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="wallet-summary-row">
              <span className="wallet-summary-label">Total Fares</span>
              <span className="wallet-summary-value">
                EGP{" "}
                {parseFloat(summary.total_fares || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="wallet-summary-row">
              <span className="wallet-summary-label">Total Fines</span>
              <span className="wallet-summary-value wallet-summary-fines">
                EGP{" "}
                {parseFloat(summary.total_fines || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </section>
        </div>

        <section className="wallet-transactions-card">
          <h3 className="wallet-card-title">Recent Transactions</h3>
          <div className="wallet-transactions-table-wrap">
            <table className="wallet-transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Transaction Type</th>
                  <th>Amount</th>
                  <th>Source</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "1.5rem" }}>
                      No transactions match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const amt = parseFloat(tx.amount);
                    return (
                      <tr key={tx.id}>
                        <td>{formatTxDate(tx.date)}</td>
                        <td>{tx.type}</td>
                        <td
                          className={
                            amt >= 0
                              ? "wallet-amount-positive"
                              : "wallet-amount-negative"
                          }
                        >
                          {amt >= 0 ? "+" : ""}
                          EGP {Math.abs(amt).toFixed(2)}
                        </td>
                        <td>{tx.source}</td>
                        <td>
                          <span className="wallet-status-badge wallet-status-completed">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default WalletPage;
