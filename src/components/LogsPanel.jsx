import React, { useState } from "react";
import { ClipboardList, CalendarDays, CalendarRange } from "lucide-react";
import DailyLogsModal from "./DailyLogsModal";
import MonthlyLogsModal from "./MonthlyLogsModal";
import "../styles/LogsPanel.css";

const LogsPanel = () => {
  const [showDaily, setShowDaily] = useState(false);
  const [showMonthly, setShowMonthly] = useState(false);

  return (
    <div className="logs-panel container-card full-width">
      {/* === Header === */}
      <h3 className="logs-title">
        <ClipboardList className="icon-title" /> Logs
      </h3>

      {/* === Body Buttons === */}
      <div className="logs-buttons">
        <button
          className="btn orange-btn"
          onClick={() => setShowDaily(true)}
          aria-label="Open Daily Logs"
        >
          <CalendarDays size={18} />
          <span>Daily Logs</span>
        </button>

        <button
          className="btn orange-btn"
          onClick={() => setShowMonthly(true)}
          aria-label="Open Monthly Logs"
        >
          <CalendarRange size={18} />
          <span>Monthly Logs</span>
        </button>
      </div>

      {/* === Modals === */}
      {showDaily && <DailyLogsModal onClose={() => setShowDaily(false)} />}
      {showMonthly && <MonthlyLogsModal onClose={() => setShowMonthly(false)} />}
    </div>
  );
};

export default LogsPanel;
