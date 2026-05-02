import { useState } from "react";
import api from "../api/axios";

const STATUS_OPTIONS = ["todo", "in-progress", "done"];

const TaskCard = ({ task, userRole, onStatusUpdate, onDelete }) => {
  const [updating, setUpdating] = useState(false);

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "done";

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === task.status) return;
    setUpdating(true);
    try {
      const res = await api.patch(`/tasks/${task._id}/status`, {
        status: newStatus,
      });
      onStatusUpdate(res.data.task);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{ ...styles.card, ...(isOverdue ? styles.cardOverdue : {}) }}>
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <h4 style={styles.title}>{task.title}</h4>
          {isOverdue && <span className="badge badge-overdue">Overdue</span>}
        </div>

        <select
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={updating}
          style={styles.statusSelect}
          className={`badge badge-${task.status}`}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "in-progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {task.description && (
        <p style={styles.description}>{task.description}</p>
      )}

      <div style={styles.meta}>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Assigned to:</span>
          <span style={styles.metaValue}>
            {task.assignedTo ? task.assignedTo.name : "Unassigned"}
          </span>
        </div>

        {task.dueDate && (
          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>Due:</span>
            <span
              style={{
                ...styles.metaValue,
                color: isOverdue ? "#ef4444" : "#6b7280",
                fontWeight: isOverdue ? 600 : 400,
              }}
            >
              {formatDate(task.dueDate)}
            </span>
          </div>
        )}
      </div>

      {userRole === "admin" && (
        <div style={styles.actions}>
          <button
            className="btn-danger"
            onClick={() => onDelete(task._id)}
            style={{ fontSize: 12, padding: "5px 10px" }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: {
    background: "#fff",
    border: "1.5px solid #e5e7eb",
    borderRadius: 10,
    padding: "16px",
    marginBottom: 12,
    transition: "box-shadow 0.15s",
  },
  cardOverdue: {
    borderColor: "#fca5a5",
    background: "#fff8f8",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flex: 1,
    flexWrap: "wrap",
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
    color: "#1f2937",
  },
  statusSelect: {
    border: "none",
    borderRadius: 999,
    padding: "3px 10px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    outline: "none",
    appearance: "auto",
    minWidth: 110,
  },
  description: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 12,
    lineHeight: 1.5,
  },
  meta: {
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  metaLabel: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: 500,
  },
  metaValue: {
    fontSize: 13,
    color: "#374151",
    fontWeight: 500,
  },
  actions: {
    marginTop: 12,
    display: "flex",
    justifyContent: "flex-end",
  },
};

export default TaskCard;
