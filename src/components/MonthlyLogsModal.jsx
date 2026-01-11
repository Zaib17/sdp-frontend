import React, { useEffect, useState } from "react";
import { BarChart3, Trash2, XCircle } from "lucide-react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import "../styles/LogsPanel.css";

const MonthlyLogsModal = ({ onClose }) => {
  const [logs, setLogs] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // 🟧 Fetch monthly logs
  const fetchLogs = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/logs/monthly`);
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("❌ Failed to fetch monthly logs:", err);
    }
  };

  // 🕔 Auto refresh every 5 minutes
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 🗑️ Delete single log
  const handleDelete = async (id) => {
    await fetch(`${process.env.REACT_APP_API_URL}/api/logs/monthly/${id}`, {
      method: "DELETE",
    });
    fetchLogs();
  };

  // 🗑️ Delete all logs
  const handleDeleteAll = async () => {
    await fetch(`${process.env.REACT_APP_API_URL}/api/logs/monthly`, { method: "DELETE" });
    fetchLogs();
  };

  return (
    <div className="logs-overlay">
      <div className="logs-modal container-card">
        <h3 className="logs-title">
          <BarChart3 className="icon-title" /> Monthly Logs
        </h3>

        {logs.length === 0 ? (
          <p className="no-logs">No monthly logs found.</p>
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
                  <td>{new Date(log.date).toLocaleDateString()}</td>
                  <td>{log.powerLoss?.toFixed(2) || 0}</td>
                  <td>{log.theftAlert || "No Theft"}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() =>
                        setConfirmDelete({ type: "single", id: log._id })
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Bottom Buttons */}
        <div className="logs-footer">
          <button className="btn gray-btn" onClick={onClose}>
            <XCircle size={16} /> Close
          </button>
          <button
            className="btn orange-btn"
            onClick={() => setConfirmDelete({ type: "all" })}
          >
            <Trash2 size={16} /> Delete All
          </button>
        </div>

        {/* Confirmation Modal */}
        {confirmDelete && (
          <ConfirmDeleteModal
            onCancel={() => setConfirmDelete(null)}
            onConfirm={async () => {
              if (confirmDelete.type === "single")
                await handleDelete(confirmDelete.id);
              else await handleDeleteAll();
              setConfirmDelete(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MonthlyLogsModal;
