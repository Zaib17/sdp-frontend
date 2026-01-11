import React, { useEffect, useState } from "react";
import {
  BellRing,
  Zap,
  ArrowRightCircle,
  Home,
  AlertTriangle,
  Send,
  XCircle,
  CheckCircle,
  Lightbulb,
  Power,
  Cog,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/AlertCard.css";

const AlertCard = () => {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [powerLoss, setPowerLoss] = useState(0);
  const [theftAlert, setTheftAlert] = useState({ icon: null, text: "", color: "" });
  const [systemAlert, setSystemAlert] = useState({ icon: null, text: "", color: "" });
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmType, setConfirmType] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // ✅ Fetch live system data every 5 seconds
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/system/status`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json && typeof json === "object") setData(json);
      } catch (err) {
        console.error("❌ Failed to fetch system status:", err);
        setData(null);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Power Loss & Theft Detection Logic
  useEffect(() => {
    if (!data) return;

    /* =====================================================
       ⚡ POWER LOSS CARD (Instant Difference)
       Formula: Street Input - To Next Street - House Total
    ====================================================== */
    const directLoss =
      (data.streetInputPower || 0) -
      (data.toNextPower || 0) -
      (data.houseTotalPower || 0);
    setPowerLoss(directLoss);

    /* =====================================================
       🚨 THEFT DETECTION (Based on Daily/Monthly Usage)
       Uses 5% tolerance of Street Input.
    ====================================================== */
    const streetTotal = data.streetInputTotalDay || data.streetInputPower || 0;
    const nextTotal = data.toNextTotalDay || data.toNextPower || 0;
    const houseTotal = data.houseTotalTotalDay || data.houseTotalPower || 0;

    const totalDiff = Math.abs(streetTotal - nextTotal - houseTotal);
    const threshold = streetTotal * 0.05; // 5% tolerance
    const theftDetected = totalDiff > threshold;

    setTheftAlert(
      theftDetected
        ? {
            icon: <AlertTriangle color="#ff5252" size={22} />,
            text: "Theft Detected",
            color: "#ff5252",
          }
        : {
            icon: <CheckCircle color="#43a047" size={22} />,
            text: "No Theft Detected",
            color: "#43a047",
          }
    );

    /* =====================================================
       💡 SYSTEM HEALTH ALERT
    ====================================================== */
    const meters = data.meterStatus || [];
    const online = meters.filter((m) => m.status === "Online").length;
    const total = meters.length;

    if (total === 0) {
      setSystemAlert({
        icon: <Power color="#607d8b" size={22} />,
        text: "No Meters Found",
        color: "#607d8b",
      });
    } else if (online === total) {
      setSystemAlert({
        icon: <Lightbulb color="#43a047" size={22} />,
        text: "System Normal",
        color: "#43a047",
      });
    } else if (online === 0) {
      setSystemAlert({
        icon: <Power color="#607d8b" size={22} />,
        text: "Power Off",
        color: "#607d8b",
      });
    } else {
      setSystemAlert({
        icon: <Cog color="#ff9800" size={22} />,
        text: "System Fault (Some Meters Offline)",
        color: "#ff9800",
      });
    }
  }, [data]);

  // ✅ Send Email
  const sendEmail = async (type) => {
    try {
      setSending(true);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, area: data?.area || "Unknown Area" }),
      });
      const json = await res.json();
      if (json.success) setShowSuccess(true);
      else alert("⚠️ Failed to send email: " + json.message);
    } catch (err) {
      console.error("Email sending failed:", err);
      alert("❌ Failed to send email.");
    } finally {
      setSending(false);
      setShowConfirm(false);
    }
  };

  const handleConfirm = (type) => {
    setConfirmType(type);
    setShowConfirm(true);
  };

  const confirmAction = () => confirmType && sendEmail(confirmType);
  const closeSuccess = () => {
    setShowSuccess(false);
    navigate("/dashboard");
  };

  if (!data)
    return (
      <div className="container-card full-width alert-card">
        <p>Loading live data...</p>
      </div>
    );

  return (
    <div className="container-card full-width alert-card">
      <h3 className="alert-title">
        <BellRing className="icon-title" /> Alerts
      </h3>

      {/* Theft + System Alerts */}
      <div className="alert-box-group">
        <div className="alert-box" style={{ borderLeft: `6px solid ${theftAlert.color}` }}>
          {theftAlert.icon} <span style={{ color: theftAlert.color }}>{theftAlert.text}</span>
        </div>
        <div className="alert-box" style={{ borderLeft: `6px solid ${systemAlert.color}` }}>
          {systemAlert.icon} <span style={{ color: systemAlert.color }}>{systemAlert.text}</span>
        </div>
      </div>

      {/* Power Summary */}
      <div className="summary-row">
        <div className="summary-item">
          <Zap className="icon" />
          <span className="label">Street Input</span>
          <strong className="value">{data.streetInputPower?.toFixed(2)} W</strong>
        </div>
        <div className="summary-item">
          <ArrowRightCircle className="icon" />
          <span className="label">To Next Street</span>
          <strong className="value">{data.toNextPower?.toFixed(2)} W</strong>
        </div>
        <div className="summary-item">
          <Home className="icon" />
          <span className="label">House Total</span>
          <strong className="value">{data.houseTotalPower?.toFixed(2)} W</strong>
        </div>
        <div className="summary-item">
          <AlertTriangle className="icon" />
          <span className="label">Power Loss</span>
          <strong className="value">{powerLoss.toFixed(2)} W</strong>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="alert-actions">
        <button
          className="btn orange-btn"
          onClick={() => handleConfirm("investigate")}
          disabled={sending}
        >
          <Send size={16} /> Investigate
        </button>
        <button
          className="btn gray-btn"
          onClick={() => handleConfirm("fault")}
          disabled={sending}
        >
          <XCircle size={16} /> Fault
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <h4>Are you sure you want to send this email?</h4>
            <div className="confirm-buttons">
              <button className="btn gray-btn" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button className="btn orange-btn" onClick={confirmAction} disabled={sending}>
                {sending ? "Sending..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <h4>Email Sent Successfully ✅</h4>
            <button className="btn orange-btn" onClick={closeSuccess}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertCard;
