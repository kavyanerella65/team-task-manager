import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import TaskList from "../components/TaskList";

const ProjectPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [activeTab, setActiveTab] = useState("tasks");

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`),
      ]);
      setProject(projRes.data.project);
      setTasks(tasksRes.data.tasks);
    } catch (err) {
      console.error("Failed to fetch project:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    setAddingMember(true);
    setMemberError("");

    try {
      const res = await api.post(`/projects/${id}/members`, {
        email: memberEmail,
      });
      setProject(res.data.project);
      setMemberEmail("");
      setShowAddMember(false);
    } catch (err) {
      setMemberError(err.response?.data?.message || "Failed to add member");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member from the project?")) return;
    try {
      const res = await api.delete(`/projects/${id}/members/${memberId}`);
      setProject(res.data.project);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member");
    }
  };

  if (loading) return <div className="spinner">Loading project...</div>;
  if (!project)
    return (
      <div className="spinner" style={{ color: "#ef4444" }}>
        Project not found.{" "}
        <Link to="/projects" style={{ color: "#4f46e5" }}>
          Go back
        </Link>
      </div>
    );

  const isOwner = project.owner._id === user.id;
  const completedCount = tasks.filter((t) => t.status === "done").length;
  const progress =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <Link to="/projects" style={styles.breadLink}>
          Projects
        </Link>
        <span style={{ color: "#9ca3af" }}> / </span>
        <span style={{ color: "#1f2937", fontWeight: 600 }}>{project.name}</span>
      </div>

      {/* Project Header */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={styles.projHeader}>
          <div style={styles.projAvatar}>
            {project.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={styles.projName}>{project.name}</h1>
            {project.description && (
              <p style={styles.projDesc}>{project.description}</p>
            )}
            <div style={styles.projMeta}>
              <span>
                Owner: <strong>{project.owner.name}</strong>
              </span>
              <span>·</span>
              <span>{project.members.length} members</span>
              <span>·</span>
              <span>{tasks.length} tasks</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {tasks.length > 0 && (
          <div style={styles.progressSection}>
            <div style={styles.progressHeader}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>Progress</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#4f46e5" }}>
                {completedCount}/{tasks.length} completed ({progress}%)
              </span>
            </div>
            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "tasks" ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab("tasks")}
        >
          📋 Tasks ({tasks.length})
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "members" ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab("members")}
        >
          👥 Members ({project.members.length})
        </button>
      </div>

      {/* Tasks Tab */}
      {activeTab === "tasks" && (
        <div className="card">
          <TaskList
            tasks={tasks}
            setTasks={setTasks}
            userRole={user.role}
            projectId={id}
            projectMembers={project.members}
          />
        </div>
      )}

      {/* Members Tab */}
      {activeTab === "members" && (
        <div className="card">
          <div style={styles.membersHeader}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1f2937" }}>
              Team Members
            </h2>
            {user.role === "admin" && isOwner && (
              <button
                className="btn-primary"
                onClick={() => setShowAddMember(true)}
              >
                + Add Member
              </button>
            )}
          </div>

          <div>
            {project.members.map((member) => (
              <div key={member._id} style={styles.memberItem}>
                <div style={styles.memberAvatar}>
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={styles.memberName}>
                    {member.name}
                    {member._id === project.owner._id && (
                      <span style={styles.ownerBadge}>Owner</span>
                    )}
                  </div>
                  <div style={styles.memberEmail}>{member.email}</div>
                </div>
                <span
                  className={`badge ${
                    member.role === "admin" ? "badge-in-progress" : "badge-todo"
                  }`}
                >
                  {member.role}
                </span>
                {user.role === "admin" &&
                  isOwner &&
                  member._id !== project.owner._id && (
                    <button
                      className="btn-danger"
                      style={{ fontSize: 12, padding: "4px 10px", marginLeft: 8 }}
                      onClick={() => handleRemoveMember(member._id)}
                    >
                      Remove
                    </button>
                  )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddMember(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Member</h2>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
              Enter the email address of the user you want to add to this
              project.
            </p>

            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>Email address</label>
                <input
                  type="email"
                  placeholder="member@example.com"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  autoFocus
                />
              </div>

              {memberError && <p className="error-msg">{memberError}</p>}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowAddMember(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={addingMember}
                >
                  {addingMember ? "Adding..." : "Add Member"}
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
  breadcrumb: {
    fontSize: 14,
    marginBottom: 20,
    color: "#9ca3af",
  },
  breadLink: {
    color: "#4f46e5",
    fontWeight: 500,
  },
  projHeader: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
    marginBottom: 16,
  },
  projAvatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    background: "#eef2ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    fontWeight: 700,
    flexShrink: 0,
  },
  projName: { fontSize: 22, fontWeight: 700, color: "#1f2937", marginBottom: 4 },
  projDesc: { fontSize: 14, color: "#6b7280", marginBottom: 8 },
  projMeta: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    fontSize: 13,
    color: "#9ca3af",
  },
  progressSection: { marginTop: 4 },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressTrack: {
    height: 8,
    background: "#f3f4f6",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
    borderRadius: 999,
    transition: "width 0.3s ease",
  },
  tabs: {
    display: "flex",
    gap: 4,
    marginBottom: 16,
    background: "#f3f4f6",
    padding: 4,
    borderRadius: 10,
    width: "fit-content",
  },
  tab: {
    padding: "8px 20px",
    borderRadius: 8,
    background: "transparent",
    color: "#6b7280",
    fontWeight: 500,
    fontSize: 14,
    cursor: "pointer",
    border: "none",
  },
  tabActive: {
    background: "#fff",
    color: "#1f2937",
    fontWeight: 700,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  membersHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  memberItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#4f46e5",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 15,
  },
  memberName: {
    fontWeight: 600,
    fontSize: 14,
    color: "#1f2937",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  memberEmail: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  ownerBadge: {
    background: "#eef2ff",
    color: "#4f46e5",
    borderRadius: 999,
    padding: "2px 8px",
    fontSize: 11,
    fontWeight: 700,
  },
};

export default ProjectPage;
