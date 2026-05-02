import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signup(form.name, form.email, form.password, form.role);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.msg ||
          "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}>✓</div>
          <h1 style={styles.appName}>TaskManager</h1>
          <p style={styles.subtitle}>Create your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
              Admins can create projects and assign tasks.
            </p>
          </div>

          {error && (
            <p className="error-msg" style={{ marginBottom: 12 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%", padding: "12px", fontSize: 15 }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #eef2ff 0%, #f9fafb 100%)",
    padding: 16,
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
  },
  logoArea: {
    textAlign: "center",
    marginBottom: 32,
  },
  logoIcon: {
    width: 52,
    height: 52,
    background: "#4f46e5",
    color: "#fff",
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    fontWeight: 700,
    margin: "0 auto 12px",
  },
  appName: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: 4,
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 14,
  },
  footer: {
    textAlign: "center",
    marginTop: 24,
    color: "#6b7280",
    fontSize: 14,
  },
  link: {
    color: "#4f46e5",
    fontWeight: 600,
  },
};

export default Signup;
