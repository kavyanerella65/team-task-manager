import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/dashboard" style={styles.logo}>
          <span style={styles.logoIcon}>✓</span>
          TaskManager
        </Link>

        <div style={styles.right}>
          {user && (
            <>
              <Link to="/dashboard" style={styles.navLink}>Dashboard</Link>
              <Link to="/projects" style={styles.navLink}>Projects</Link>

              <div style={styles.userInfo}>
                <div style={styles.avatar}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={styles.userName}>{user.name}</div>
                  <div style={styles.userRole}>{user.role}</div>
                </div>
              </div>

              <button onClick={handleLogout} className="btn-ghost" style={{ padding: "8px 14px" }}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  inner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 24px",
    height: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 18,
    fontWeight: 700,
    color: "#4f46e5",
  },
  logoIcon: {
    background: "#4f46e5",
    color: "#fff",
    borderRadius: 8,
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  navLink: {
    color: "#4b5563",
    fontWeight: 500,
    fontSize: 14,
    padding: "6px 12px",
    borderRadius: 6,
    transition: "background 0.15s",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "6px 12px",
    background: "#f9fafb",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#4f46e5",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 14,
  },
  userName: {
    fontWeight: 600,
    fontSize: 13,
    color: "#1f2937",
  },
  userRole: {
    fontSize: 11,
    color: "#6b7280",
    textTransform: "capitalize",
    fontWeight: 500,
  },
};

export default Navbar;
