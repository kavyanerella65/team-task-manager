import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.projects);
    } catch (err) {
      console.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Project name is required");
    setCreating(true);
    setError("");

    try {
      const res = await api.post("/projects", form);
      setProjects((prev) => [res.data.project, ...prev]);
      setForm({ name: "", description: "" });
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm("Delete this project and all its tasks?")) return;
    try {
      await api.delete(`/projects/${projectId}`);
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete project");
    }
  };

  if (loading) return <div className="spinner">Loading projects...</div>;

  return (
    <div className="page-container">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Projects</h1>
          <p style={{ color: "#6b7280", marginTop: 4 }}>
            {user.role === "admin"
              ? "Manage your projects and teams."
              : "Projects you're a member of."}
          </p>
        </div>
        {user.role === "admin" && (
          <button
            className="btn-primary"
            onClick={() => setShowModal(true)}
          >
            + New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48 }}>📁</div>
          <p>No projects yet.</p>
          {user.role === "admin" && (
            <button
              className="btn-primary"
              style={{ marginTop: 16 }}
              onClick={() => setShowModal(true)}
            >
              Create your first project
            </button>
          )}
        </div>
      ) : (
        <div style={styles.grid}>
          {projects.map((project) => (
            <div key={project._id} className="card" style={styles.projectCard}>
              <div style={styles.cardHeader}>
                <div style={styles.projectAvatar}>
                  {project.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                {user.role === "admin" &&
                  project.owner?._id === user.id && (
                    <button
                      className="btn-danger"
                      style={{ fontSize: 12, padding: "4px 10px" }}
                      onClick={() => handleDelete(project._id)}
                    >
                      Delete
                    </button>
                  )}
              </div>

              <h3 style={styles.projectName}>{project.name}</h3>
              {project.description && (
                <p style={styles.description}>{project.description}</p>
              )}

              <div style={styles.memberRow}>
                <div style={styles.memberAvatars}>
                  {project.members?.slice(0, 4)?.map((m, i) => (
                    <div
                      key={m._id}
                      style={{
                        ...styles.memberAvatar,
                        left: i * 18,
                        zIndex: 10 - i,
                      }}
                      title={m.name}
                    >
                      {m.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  ))}
                </div>
                <span style={styles.memberCount}>
                  {project.members.length} member
                  {project.members.length !== 1 ? "s" : ""}
                </span>
              </div>

              <Link
                to={`/projects/${project._id}`}
                className="btn-primary"
                style={{ display: "block", textAlign: "center", marginTop: 16 }}
              >
                Open Project →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Project</h2>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Website Redesign"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Optional project description"
                  value={form.description}
                  rows={3}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
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
                  {creating ? "Creating..." : "Create Project"}
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
    alignItems: "flex-start",
    marginBottom: 28,
    flexWrap: "wrap",
    gap: 12,
  },
  title: { fontSize: 24, fontWeight: 700, color: "#1f2937" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 20,
  },
  projectCard: { display: "flex", flexDirection: "column" },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  projectAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "#eef2ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 20,
  },
  projectName: { fontSize: 17, fontWeight: 700, color: "#1f2937", marginBottom: 6 },
  description: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 14,
    lineHeight: 1.5,
    flex: 1,
  },
  memberRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: "auto",
  },
  memberAvatars: {
    position: "relative",
    height: 28,
    width: 70,
  },
  memberAvatar: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#4f46e5",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    border: "2px solid #fff",
  },
  memberCount: { fontSize: 13, color: "#9ca3af" },
};

export default Projects;
