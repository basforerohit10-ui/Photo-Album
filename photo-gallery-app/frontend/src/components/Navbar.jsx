import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={styles.nav} className="glass-panel site-nav">
      <div style={styles.brand} onClick={() => navigate("/gallery")} role="button" tabIndex={0}>
        <span style={styles.logoMark}>RP</span>
        <span style={styles.brandCopy}>
          <span style={styles.brandName}>Rohit Photography</span>
          <span style={styles.brandTagline}>Visual Stories & Gallery</span>
        </span>
      </div>

      <div style={styles.links} className="site-nav-links">
        <Link to="/gallery" style={styles.link} className="nav-link">Explore</Link>

        {user?.role === "admin" && (
          <Link to="/admin" style={styles.adminLink} className="nav-action">⚡ Admin Dashboard</Link>
        )}

        {user && (
          <Link to="/profile" style={styles.profileLink} className="nav-action">My Profile</Link>
        )}

        {user && (
          <Link to="/submit" style={styles.submitLink} className="nav-action">+ Submit photo</Link>
        )}

        {user ? (
          <div style={styles.userBox} className="nav-user-box">
            <div style={styles.avatar}>{user.username.charAt(0).toUpperCase()}</div>
            <div style={styles.meta}>
              <span style={styles.username}>{user.fullName || user.username}</span>
              <span style={styles.roleTag}>{user.role === "admin" ? "Administrator" : "Contributor"}</span>
            </div>
            <button onClick={() => { logout(); navigate("/register"); }} style={styles.logoutBtn}>Logout</button>
          </div>
        ) : (
          <div style={styles.authGroup}>
            <Link to="/login" style={styles.loginBtn}>Login</Link>
            <Link to="/login?role=admin" style={styles.adminLoginBtn}>🛡️ Admin Login</Link>
            <Link to="/register" style={styles.registerBtn}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1.5rem",
    padding: "0.85rem clamp(1rem, 4vw, 3.5rem)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(9, 14, 27, 0.72)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  },
  brand: { display: "flex", alignItems: "center", gap: "0.7rem", cursor: "pointer", flexShrink: 0 },
  logoMark: { width: "2.25rem", height: "2.25rem", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "10px", background: "linear-gradient(135deg, #f59e0b, #ef4444)", color: "#fff", fontSize: "1.25rem", fontWeight: "800", boxShadow: "0 8px 20px rgba(239, 68, 68, 0.25)" },
  brandCopy: { display: "flex", flexDirection: "column", gap: "0.12rem" },
  brandName: { fontSize: "1.15rem", fontWeight: "800", letterSpacing: "1px", color: "#fff", lineHeight: 1 },
  brandTagline: { color: "#94a3b8", fontSize: "0.62rem", letterSpacing: "0.04em" },
  links: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.65rem", flexWrap: "wrap" },
  link: { color: "#cbd5e1", textDecoration: "none", fontWeight: "600", fontSize: "0.85rem", padding: "0.55rem 0.8rem" },
  adminLink: {
    background: "rgba(245, 158, 11, 0.12)",
    border: "1px solid rgba(245, 158, 11, 0.35)",
    color: "#fbbf24",
    textDecoration: "none",
    padding: "0.55rem 0.85rem",
    borderRadius: "9px",
    fontSize: "0.78rem",
    fontWeight: "700",
  },
  submitLink: {
    background: "#f8fafc",
    color: "#111827",
    textDecoration: "none",
    padding: "0.55rem 0.85rem",
    borderRadius: "9px",
    fontSize: "0.78rem",
    fontWeight: "700",
  },
  profileLink: {
    color: "#fbbf24",
    textDecoration: "none",
    padding: "0.55rem 0.8rem",
    borderRadius: "9px",
    fontSize: "0.78rem",
    fontWeight: "700",
    border: "1px solid rgba(245, 158, 11, 0.3)",
    background: "rgba(245, 158, 11, 0.1)",
  },
  userBox: { display: "flex", alignItems: "center", gap: "0.65rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.35rem 0.45rem 0.35rem 0.55rem", borderRadius: "12px" },
  avatar: { width: "30px", height: "30px", borderRadius: "9px", background: "linear-gradient(135deg, #f59e0b, #ef4444)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: "800" },
  meta: { display: "flex", flexDirection: "column", lineHeight: "1.15", minWidth: 0 },
  username: { fontSize: "0.78rem", fontWeight: "700", color: "#f8fafc", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  roleTag: { fontSize: "0.6rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" },
  logoutBtn: { background: "transparent", border: "1px solid rgba(248,113,113,0.3)", color: "#fca5a5", cursor: "pointer", fontSize: "0.7rem", fontWeight: "700", padding: "0.4rem 0.55rem", borderRadius: "7px" },
  authGroup: { display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap" },
  loginBtn: { color: "#cbd5e1", padding: "0.55rem 0.8rem", borderRadius: "9px", textDecoration: "none", fontSize: "0.8rem", fontWeight: "600" },
  adminLoginBtn: {
    background: "rgba(245, 158, 11, 0.15)",
    border: "1px solid rgba(245, 158, 11, 0.4)",
    color: "#fbbf24",
    padding: "0.5rem 0.8rem",
    borderRadius: "9px",
    textDecoration: "none",
    fontSize: "0.78rem",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
    boxShadow: "0 2px 10px rgba(245, 158, 11, 0.15)",
  },
  registerBtn: { background: "#f8fafc", color: "#111827", padding: "0.55rem 0.85rem", borderRadius: "9px", textDecoration: "none", fontSize: "0.8rem", fontWeight: "700" },
};

export default Navbar;