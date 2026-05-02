import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const StatCard = ({ label, value, icon, color }) => (
  <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
    <div style={styles.statIcon}>{icon}</div>
    <div style={{ ...styles.statValue, color }}>{value}</div>
    <div style={styles.statLabel}>{label}</div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [overdueList, setOverdueList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, projRes] = await Promise.all([
          api.get("/dashboard"),
          api.get("/projects"),
        ]);
        setStats(dashRes.data.stats);
        setOverdueList(dashRes.data.overdueTasksList);
        setProjects(projRes.data.projects.slice(0, 4));
      } catch (err) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="spinner">Loading dashboard...</div>;
  if (error) return <div className="spinner" style={{ color: "#ef4444" }}>{error}</div>;

  return (
    <div className="page-container">
      {/* Welcome */}
      <div style={styles.welcome}>
        <div>
          <h1 style={styles.title}>
            Welcome back, {user.name.split(" ")[0]}! 👋
          </h1>
          <p style={{ color: "#6b7280", marginTop: 4 }}>
            Here's an overview of your tasks and projects.
          </p>
        </div>
        {user.role === "admin" && (
          <Link to="/projects" className="btn-primary" style={{ padding: "10px 20px" }}>
            + New Project
          </Link>
        )}
      </div>

      {/* Stat Cards */}
      <div style={styles.statsGrid}>
        <StatCard
          label="Total Projects"
          value={stats.totalProjects}
          icon="📁"
          color="#4f46e5"
        />
        <StatCard
          label="Total Tasks"
          value={stats.totalTasks}
          icon="📋"
          color="#0891b2"
        />
        <StatCard
          label="Completed"
          value={stats.completedTasks}
          icon="✅"
          color="#16a34a"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgressTasks}
          icon="⚡"
          color="#d97706"
        />
        <StatCard
          label="Todo"
          value={stats.todoTasks}
          icon="📌"
          color="#6b7280"
        />
        <StatCard
          label="Overdue"
          value={stats.overdueTasks}
          icon="🔴"
          color="#ef4444"
        />
      </div>

      <div style={styles.bottomGrid}>
        {/* Overdue Tasks */}
        <div className="card">
          <h2 style={styles.sectionTitle}>
            🔴 Overdue Tasks
            {overdueList.length > 0 && (
              <span style={styles.badge}>{overdueList.length}</span>
            )}
          </h2>

          {overdueList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "#9ca3af" }}>
              <div style={{ fontSize: 32 }}>🎉</div>
              <p style={{ marginTop: 8 }}>No overdue tasks!</p>
            </div>
          ) : (
            overdueList.map((task) => (
              <div key={task._id} style={styles.overdueItem}>
                <div>
                  <div style={styles.overdueTitle}>{task.title}</div>
                  <div style={styles.overdueMeta}>
                    {task.project?.name} •{" "}
                    {task.assignedTo ? task.assignedTo.name : "Unassigned"} •{" "}
                    <span style={{ color: "#ef4444" }}>
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span className={`badge badge-${task.status}`}>
                  {task.status}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Recent Projects */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={styles.sectionTitle}>📁 Recent Projects</h2>
            <Link to="/projects" style={{ color: "#4f46e5", fontSize: 13, fontWeight: 600 }}>
              View all →
            </Link>
          </div>

          {projects.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "#9ca3af" }}>
              <div style={{ fontSize: 32 }}>📂</div>
              <p style={{ marginTop: 8 }}>No projects yet.</p>
              {user.role === "admin" && (
                <Link
                  to="/projects"
                  style={{ color: "#4f46e5", fontSize: 13, marginTop: 8, display: "block" }}
                >
                  Create your first project →
                </Link>
              )}
            </div>
          ) : (
            projects.map((project) => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                style={styles.projectItem}
              >
                <div style={styles.projectAvatar}>
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={styles.projectName}>{project.name}</div>
                  <div style={styles.projectMeta}>
                    {project.members.length} member
                    {project.members.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <span style={{ color: "#9ca3af", fontSize: 16 }}>→</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  welcome: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    flexWrap: "wrap",
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1f2937",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 16,
    marginBottom: 28,
  },
  statCard: {
    background: "#fff",
    borderRadius: 12,
    padding: "20px 16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 32, fontWeight: 700, marginBottom: 4 },
  statLabel: { fontSize: 13, color: "#6b7280", fontWeight: 500 },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 999,
    padding: "2px 8px",
    fontSize: 12,
    fontWeight: 700,
  },
  overdueItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #f3f4f6",
    gap: 12,
  },
  overdueTitle: { fontWeight: 600, color: "#1f2937", fontSize: 14 },
  overdueMeta: { fontSize: 12, color: "#9ca3af", marginTop: 3 },
  projectItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px",
    borderRadius: 10,
    marginBottom: 8,
    border: "1.5px solid #f3f4f6",
    transition: "border-color 0.15s",
    cursor: "pointer",
  },
  projectAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "#eef2ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 16,
  },
  projectName: { fontWeight: 600, color: "#1f2937", fontSize: 14 },
  projectMeta: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
};

export default Dashboard;
