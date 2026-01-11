import React, { useEffect, useState } from "react";
import { CalendarDays, Trash2, XCircle, AlertTriangle, CheckCircle } from "lucide-react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import "../styles/LogsPanel.css";

const DailyLogsModal = ({ onClose }) => {
  const [logs, setLogs] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null); // { type: "single" | "all", id?: string }

  // 🟢 Fetch daily logs
  const fetchLogs = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/logs/daily`);
      if (!res.ok) throw new Error("Failed to fetch daily logs");
      const data = await res.json();

      // Sort latest first
      setLogs(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
      console.error("❌ Failed to fetch daily logs:", err);
    }
  };

  // 🕒 Auto refresh every 1 minute
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 60000);
    return () => clearInterval(interval);
  }, []);

  // 🗑️ Delete single log
  const handleDelete = async (id) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/logs/daily/${id}`, { method: "DELETE" });
      fetchLogs();
    } catch (err) {
      console.error("❌ Failed to delete log:", err);
    }
  };

  // 🗑️ Delete all logs
  const handleDeleteAll = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/logs/daily`, { method: "DELETE" });
      fetchLogs();
    } catch (err) {
      console.error("❌ Failed to delete all logs:", err);
    }
  };

  // 🧠 Helper for theft alert color/icon
  const renderTheftAlert = (alert) => {
    switch (alert) {
      case "Theft Detected":
        return (
          <span className="theft-alert theft">
            <AlertTriangle color="#ff5252" size={16} /> Theft Detected
          </span>
        );
      case "System Fault":
        return (
          <span className="theft-alert fault">
            <AlertTriangle color="#ff9800" size={16} /> System Fault
          </span>
        );
      case "Light Cut Off":
        return (
          <span className="theft-alert cut">
            <XCircle color="#607d8b" size={16} /> Light Cut Off
          </span>
        );
      default:
        return (
          <span className="theft-alert normal">
            <CheckCircle color="#43a047" size={16} /> No Theft
          </span>
        );
    }
  };

  return (
    <div className="logs-overlay">
      <div className="logs-modal container-card">
        <h3 className="logs-title">
          <CalendarDays className="icon-title" /> Daily Logs
        </h3>

        {logs.length === 0 ? (
          <p className="no-logs">No daily logs found.</p>
        ) : (
          <table className="logs-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Power Loss (W)</th>
                <th>Theft Alert</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>{new Date(log.date).toLocaleString()}</td>
                  <td>{log.powerLoss?.toFixed(2) || 0}</td>
                  <td>{renderTheftAlert(log.theftAlert)}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => setConfirmDelete({ type: "single", id: log._id })}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Footer Buttons */}
        <div className="logs-footer">
          <button className="btn gray-btn" onClick={onClose}>
            <XCircle size={16} /> Close
          </button>
          <button className="btn orange-btn" onClick={() => setConfirmDelete({ type: "all" })}>
            <Trash2 size={16} /> Delete All
          </button>
        </div>

        {/* Confirmation Modal */}
        {confirmDelete && (
          <ConfirmDeleteModal
            onCancel={() => setConfirmDelete(null)}
            onConfirm={async () => {
              if (confirmDelete.type === "single") await handleDelete(confirmDelete.id);
              else await handleDeleteAll();
              setConfirmDelete(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DailyLogsModal;
