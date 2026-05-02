import { useState } from "react";
import api from "../api/axios";
import TaskCard from "./TaskCard";

const TaskList = ({ tasks, setTasks, userRole, projectId, projectMembers }) => {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const filteredTasks =
    filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required");
    setCreating(true);
    setError("");

    try {
      const payload = {
        title: form.title,
        description: form.description,
        projectId,
        assignedTo: form.assignedTo || undefined,
        dueDate: form.dueDate || undefined,
      };

      const res = await api.post("/tasks", payload);
      setTasks((prev) => [res.data.task, ...prev]);
      setForm({ title: "", description: "", assignedTo: "", dueDate: "" });
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const handleStatusUpdate = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
    );
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete task");
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.filters}>
          {["all", "todo", "in-progress", "done"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...styles.filterBtn,
                ...(filter === f ? styles.filterBtnActive : {}),
              }}
            >
              {f === "in-progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
              <span style={styles.count}>
                {f === "all"
                  ? tasks.length
                  : tasks.filter((t) => t.status === f).length}
              </span>
            </button>
          ))}
        </div>

        {userRole === "admin" && (
          <button
            className="btn-primary"
            onClick={() => setShowModal(true)}
          >
            + Add Task
          </button>
        )}
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 40 }}>📋</div>
          <p>No tasks {filter !== "all" ? `with status "${filter}"` : "yet"}.</p>
          {userRole === "admin" && filter === "all" && (
            <p style={{ marginTop: 8, fontSize: 13, color: "#9ca3af" }}>
              Click "+ Add Task" to create one.
            </p>
          )}
        </div>
      ) : (
        filteredTasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            userRole={userRole}
            onStatusUpdate={handleStatusUpdate}
            onDelete={handleDelete}
          />
        ))
      )}

      {/* Create Task Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Task</h2>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  placeholder="Task title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Optional description"
                  value={form.description}
                  rows={3}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>

              <div className="form-group">
                <label>Assign To</label>
                <select
                  value={form.assignedTo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, assignedTo: e.target.value }))
                  }
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, dueDate: e.target.value }))
                  }
                />
              </div>

              {error && <p className="error-msg">{error}</p>}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={creating}
                >
                  {creating ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 12,
  },
  filters: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  filterBtn: {
    background: "transparent",
    color: "#6b7280",
    padding: "7px 14px",
    borderRadius: 999,
    border: "1.5px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  filterBtnActive: {
    background: "#eef2ff",
    color: "#4f46e5",
    borderColor: "#4f46e5",
  },
  count: {
    background: "#f3f4f6",
    borderRadius: 999,
    padding: "1px 7px",
    fontSize: 11,
    fontWeight: 700,
  },
};

export default TaskList;
