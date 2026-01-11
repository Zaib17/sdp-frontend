import React, { useEffect, useState } from "react";
import {
  ActivitySquare,
  Wifi,
  CheckCircle2,
  Gauge,
  Clock4,
} from "lucide-react";
import "../styles/SystemHealth.css";

const SystemHealth = () => {
  const [health, setHealth] = useState({
    network: "Checking...",
    accuracy: 0,
    activeMeters: 0,
    lastSync: "—",
  });

  // ✅ Fetch live system health
  const fetchHealthData = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/system/health`)
;
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      console.error("❌ Failed to fetch system health:", err);
      setHealth((prev) => ({ ...prev, network: "Offline" }));
    }
  };

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="system-health-card">
      <h3>
        <ActivitySquare size={20} className="health-icon" /> System Health
      </h3>

      <div className="health-grid">
        <div className="health-item">
          <Wifi className="health-icon" />
          <div className="label">Network Status</div>
          <div
            className={`value ${
              health.network === "Online" ? "online" : "offline"
            }`}
          >
            {health.network}
          </div>
        </div>

        <div className="health-item">
          <CheckCircle2 className="health-icon" />
          <div className="label">Data Accuracy</div>
          <div className="value good">{health.accuracy}%</div>
        </div>

        <div className="health-item">
          <Gauge className="health-icon" />
          <div className="label">Active Meters</div>
          <div className="value">
            {health.activeMeters} / 5
          </div>
        </div>

        <div className="health-item">
          <Clock4 className="health-icon" />
          <div className="label">Last Sync</div>
          <div className="value">{health.lastSync}</div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
