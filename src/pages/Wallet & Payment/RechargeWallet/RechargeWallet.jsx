// src/pages/Wallet & Payment/RechargeWallet/RechargeWallet.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import "../../../components/Sidebar.css";
import API from "../../../APi/axiosConfig";
import { ENDPOINTS } from "../../../APi/endpoints";
import { useMe } from "../../../hooks/useMe";
import { validateRechargeForm } from "../../../utils/paymentValidation";
import "./RechargeWallet.css";

function RechargeWallet() {
  const navigate = useNavigate();
  const { me, loading: meLoading } = useMe();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [saveCard, setSaveCard] = useState(false);

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
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const getEffectiveAmount = () => {
    if (selectedAmount != null) return selectedAmount;
    const parsed = parseFloat(customAmount);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  };

  const handleProceed = async () => {
    const amount = getEffectiveAmount();
    const msg = validateRechargeForm({
      amount,
      cardholderName,
      cardNumber,
      expiryDate,
      cvv,
      billingAddress,
    });
    if (msg) {
      setToast({ type: "error", message: msg });
      return;
    }
    setIsProcessing(true);
    setToast(null);
    try {
      const { data } = await API.post(ENDPOINTS.WALLET_RECHARGE, {
        amount: amount.toFixed(2),
        cardholder_name: cardholderName.trim(),
        card_number: cardNumber.replace(/\s/g, ""),
        expiry_date: expiryDate.trim(),
        cvv,
        billing_address: billingAddress.trim(),
      });
      setToast({
        type: "success",
        message: `Successfully recharged ${amount.toFixed(2)} EGP. New balance: ${data.balance} EGP`,
      });
      setSelectedAmount(null);
      setCustomAmount("");
      setCardholderName("");
      setCardNumber("");
      setExpiryDate("");
      setCvv("");
      setBillingAddress("");
      setSaveCard(false);
      setTimeout(() => navigate("/dashboard/wallet"), 1200);
    } catch (err) {
      const d = err.response?.data;
      let first =
        (Array.isArray(d?.non_field_errors) && d.non_field_errors[0]) ||
        d?.detail ||
        null;
      if (!first && d && typeof d === "object") {
        const arr = Object.values(d).find((v) => Array.isArray(v) && v.length);
        first = arr ? arr[0] : null;
      }
      first = first || "Payment could not be processed.";
      setToast({ type: "error", message: first });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard/wallet");
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const match = v.match(/\d{0,19}/);
    const raw = match ? match[0] : "";
    const parts = [];
    for (let i = 0, len = raw.length; i < len; i += 4) {
      parts.push(raw.substring(i, i + 4));
    }
    return parts.join(" ");
  };

  const handleCardNumberChange = (e) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  return (
    <div className="wallet-page-container">
      <Sidebar userData={userData} />

      <main className="wallet-main-content">
        <header className="wallet-page-header recharge-header-row">
          <button
            type="button"
            className="recharge-back-btn"
            onClick={() => navigate("/dashboard/wallet")}
            aria-label="Back to Wallet"
          >
            ←
          </button>
          <div>
            <h1>Recharge Wallet</h1>
            <p>Enter your card details to add funds to your wallet.</p>
          </div>
        </header>

        <div className="recharge-two-columns">
          <div className="recharge-left-column">
            <section className="recharge-amount-card">
              <div className="recharge-card-header-blue">
                <h3 className="recharge-card-header-title">Recharge Amount</h3>
              </div>
              <div className="recharge-card-body">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  {[10, 20, 50, 100].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(n);
                        setCustomAmount("");
                      }}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        border:
                          selectedAmount === n
                            ? "2px solid #2563eb"
                            : "1px solid #cbd5e1",
                        background: selectedAmount === n ? "#eff6ff" : "#fff",
                        cursor: "pointer",
                      }}
                    >
                      {n} EGP
                    </button>
                  ))}
                </div>
                <div className="recharge-amount-input-wrapper">
                  <input
                    id="recharge-amount-input"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="Enter amount (EGP)"
                    value={selectedAmount != null ? String(selectedAmount) : customAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedAmount(null);
                      setCustomAmount(val);
                    }}
                    className="recharge-amount-input"
                  />
                  <span className="recharge-amount-icon">💰</span>
                </div>
              </div>
            </section>

            <section className="recharge-card-preview-card">
              <h3 className="recharge-section-title">Card Preview</h3>
              <div className="recharge-card-preview">
                <div className="recharge-card-preview-chip">💳</div>
                <div className="recharge-card-preview-visa">VISA</div>
                <div className="recharge-card-preview-number">
                  {cardNumber || "**** **** **** ****"}
                </div>
              </div>
            </section>
          </div>

          <div className="recharge-right-column">
            <section className="recharge-payment-form-section">
              <h3 className="recharge-section-title">
                Payment Method - Credit/Debit Card
              </h3>

              <div className="recharge-form-group">
                <label htmlFor="cardholder-name" className="recharge-form-label">
                  Cardholder Name
                </label>
                <input
                  id="cardholder-name"
                  type="text"
                  autoComplete="cc-name"
                  placeholder="Enter cardholder name"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="recharge-form-input"
                />
              </div>

              <div className="recharge-form-group">
                <label htmlFor="card-number" className="recharge-form-label">
                  Card Number
                </label>
                <div className="recharge-card-input-wrapper">
                  <input
                    id="card-number"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    className="recharge-form-input recharge-card-number-input"
                  />
                  <span className="recharge-visa-logo-small">VISA</span>
                </div>
              </div>

              <div className="recharge-form-row">
                <div className="recharge-form-group">
                  <label htmlFor="expiry-date" className="recharge-form-label">
                    Expiry Date
                  </label>
                  <input
                    id="expiry-date"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (val.length >= 2) {
                        val = val.substring(0, 2) + "/" + val.substring(2, 4);
                      }
                      setExpiryDate(val);
                    }}
                    maxLength={5}
                    className="recharge-form-input"
                  />
                </div>
                <div className="recharge-form-group">
                  <label htmlFor="cvv" className="recharge-form-label">
                    CVV
                  </label>
                  <input
                    id="cvv"
                    type="password"
                    autoComplete="cc-csc"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) =>
                      setCvv(e.target.value.replace(/\D/g, "").substring(0, 4))
                    }
                    maxLength={4}
                    className="recharge-form-input"
                  />
                </div>
              </div>

              <div className="recharge-form-group">
                <label htmlFor="billing-address" className="recharge-form-label">
                  Billing Address
                </label>
                <textarea
                  id="billing-address"
                  placeholder="Enter your billing address"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  rows={3}
                  className="recharge-form-textarea"
                />
              </div>

              <div className="recharge-save-card-toggle">
                <label className="recharge-toggle-label">
                  <input
                    type="checkbox"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="recharge-toggle-input"
                  />
                  <span className="recharge-toggle-slider"></span>
                  <span className="recharge-toggle-text">
                    Save card for future payments (not stored in this demo)
                  </span>
                </label>
              </div>
            </section>
          </div>
        </div>

        <div className="recharge-footer">
          <div className="recharge-footer-buttons">
            <button
              type="button"
              className="recharge-cancel-btn"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="button"
              className="recharge-proceed-btn"
              onClick={handleProceed}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing…" : "Proceed to Payment"}
            </button>
          </div>
          <div className="recharge-security-note">
            <span className="recharge-security-icon">🛡️</span>
            <span>Your payment is validated on the server before crediting your wallet.</span>
          </div>
        </div>

        {toast && (
          <div
            className={`recharge-toast recharge-toast-${toast.type}`}
            role="alert"
          >
            {toast.type === "success" ? "✓ " : ""}
            {toast.message}
          </div>
        )}
      </main>
    </div>
  );
}

export default RechargeWallet;
