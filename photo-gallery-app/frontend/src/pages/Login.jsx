import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = ({ initialMode }) => {
  const [searchParams] = useSearchParams();
  const isAdminParam = searchParams.get("role") === "admin" || initialMode === "admin";

  const [modeOverride, setModeOverride] = useState(null);
  const isAdminMode = modeOverride !== null ? modeOverride : isAdminParam;
  const [form, setForm] = useState({ username: "", password: "", adminSecurityKey: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(form.username, form.password, form.adminSecurityKey);
    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    if (result.user?.role === "admin") {
      navigate("/admin");
    } else {
      if (isAdminMode) {
        setError("Note: You logged in, but this account does not have admin privileges. Redirecting to gallery...");
        setTimeout(() => navigate("/gallery"), 1500);
      } else {
        navigate("/gallery");
      }
    }
  };

  return (
    <div style={styles.page} className="studio-auth-page">
      <div style={styles.container} className="studio-auth-layout">
        <aside className="studio-auth-aside">
          <span className="studio-aside-kicker">ROHIT PHOTOSTUDIO</span>
          <div>
            <h1>Good photographs<br />stay with you.</h1>
            <p>Sign in to explore the collection and share your own point of view.</p>
          </div>
          <span className="studio-aside-caption">THE PHOTOGRAPHY COLLECTION</span>
        </aside>
        <div style={styles.box} className="studio-auth-card">
          {/* Mode Tabs */}
          <div style={styles.tabBar}>
            <button
              type="button"
              onClick={() => { setModeOverride(false); setError(""); }}
              style={{
                ...styles.tabBtn,
                ...(isAdminMode ? {} : styles.tabBtnActive),
              }}
            >
              Contributor Login
            </button>
            <button
              type="button"
              onClick={() => { setModeOverride(true); setError(""); }}
              style={{
                ...styles.tabBtn,
                ...(isAdminMode ? styles.adminTabBtnActive : {}),
              }}
            >
              🛡️ Admin Login
            </button>
          </div>

          <div style={styles.headerBox}>
            {isAdminMode && (
              <span style={styles.adminBadge}>ADMINISTRATOR PORTAL</span>
            )}
            <h2 style={styles.title}>
              {isAdminMode ? "Admin Sign In" : "Welcome Back"}
            </h2>
            <p style={styles.sub}>
              {isAdminMode
                ? "Enter your administrator username and password."
                : "Sign in to browse the gallery and submit your photos."}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>
                {isAdminMode ? "Admin Username" : "Username"}
              </label>
              <input
                type="text"
                name="username"
                placeholder={isAdminMode ? "Enter admin username" : "Enter your username"}
                value={form.username}
                onChange={handleChange}
                required
                style={isAdminMode ? { ...styles.input, ...styles.adminInput } : styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordWrap}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={{ ...(isAdminMode ? { ...styles.input, ...styles.adminInput } : styles.input), paddingRight: "4.2rem", width: "100%" }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {isAdminMode && (
              <div style={styles.field}>
                <label style={styles.adminKeyLabel}>Admin Security Key</label>
                <input
                  type="password"
                  name="adminSecurityKey"
                  placeholder="Enter admin security key"
                  value={form.adminSecurityKey}
                  onChange={handleChange}
                  required
                  style={{ ...styles.input, ...styles.adminInput }}
                />
              </div>
            )}

            {error && <p style={styles.error}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.btn,
                ...(isAdminMode ? styles.adminSubmitBtn : {}),
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Signing in..."
                : isAdminMode
                ? "⚡ Sign in to Admin Dashboard"
                : "Login"}
            </button>
          </form>

          <div style={styles.footerLinks}>
            <p style={styles.helper}>
              Don&apos;t have an account?{" "}
              {isAdminMode ? (
                <span style={styles.adminRegisterLink}>Administrator accounts are provisioned by the site owner.</span>
              ) : (
                <Link to="/register" style={styles.link}>
                  Register as Contributor
                </Link>
              )}
            </p>
            {isAdminMode && (
              <p style={styles.subHelper}>
                Need to submit photos instead?{" "}
                <button
                  type="button"
                  onClick={() => { setModeOverride(false); setError(""); }}
                  style={styles.textBtn}
                >
                  Switch to Contributor Login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    position: "relative",
    minHeight: "calc(100vh - 72px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem 1rem",
    background: "transparent",
  },
  container: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: "1rem 0",
  },
  box: {
    maxWidth: "440px",
    width: "100%",
    padding: "2rem 2.2rem",
    borderRadius: "20px",
    background: "rgba(15, 23, 42, 0.75)",
    border: "1px solid rgba(255,255,255,0.18)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  },
  tabBar: {
    display: "flex",
    gap: "0.4rem",
    background: "rgba(255, 255, 255, 0.05)",
    padding: "0.3rem",
    borderRadius: "12px",
    marginBottom: "1.6rem",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  tabBtn: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    padding: "0.6rem 0.5rem",
    borderRadius: "9px",
    fontSize: "0.82rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  tabBtnActive: {
    background: "rgba(255, 255, 255, 0.12)",
    color: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },
  adminTabBtnActive: {
    background: "linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(239, 68, 68, 0.25))",
    color: "#fbbf24",
    border: "1px solid rgba(245, 158, 11, 0.4)",
    boxShadow: "0 2px 10px rgba(245, 158, 11, 0.2)",
  },
  headerBox: {
    textAlign: "left",
    marginBottom: "1.4rem",
  },
  adminBadge: {
    display: "inline-block",
    background: "rgba(245, 158, 11, 0.2)",
    border: "1px solid rgba(245, 158, 11, 0.45)",
    color: "#fbbf24",
    fontSize: "0.65rem",
    fontWeight: "800",
    letterSpacing: "0.08em",
    padding: "0.2rem 0.6rem",
    borderRadius: "20px",
    marginBottom: "0.6rem",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: "800",
    color: "#fff",
    margin: "0 0 0.3rem 0",
    letterSpacing: "-0.5px",
  },
  sub: {
    color: "#cbd5e1",
    fontSize: "0.86rem",
    margin: 0,
    lineHeight: "1.4",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.1rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  label: {
    fontSize: "0.82rem",
    color: "#e2e8f0",
    fontWeight: "600",
  },
  adminKeyLabel: {
    fontSize: "0.82rem",
    color: "#fbbf24",
    fontWeight: "700",
  },
  input: {
    background: "rgba(255, 255, 255, 0.07)",
    border: "1px solid rgba(255, 255, 255, 0.14)",
    padding: "0.8rem 1rem",
    borderRadius: "10px",
    color: "#fff",
    outline: "none",
    fontSize: "0.9rem",
    transition: "border-color 0.2s ease",
  },
  passwordWrap: { position: "relative", display: "flex", alignItems: "center" },
  passwordToggle: { position: "absolute", right: "0.6rem", background: "transparent", border: "none", color: "#a5b4fc", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700" },
  adminInput: {
    borderColor: "rgba(245, 158, 11, 0.35)",
    background: "rgba(15, 23, 42, 0.5)",
  },
  error: {
    color: "#fca5a5",
    fontSize: "0.8rem",
    margin: "-0.2rem 0",
    lineHeight: "1.3",
  },
  btn: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    border: "none",
    padding: "0.85rem",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "0.9rem",
    cursor: "pointer",
    marginTop: "0.4rem",
    boxShadow: "0 8px 20px rgba(99, 102, 241, 0.3)",
    transition: "transform 0.1s ease, box-shadow 0.2s ease",
  },
  adminSubmitBtn: {
    background: "linear-gradient(135deg, #f59e0b, #ef4444)",
    boxShadow: "0 8px 20px rgba(245, 158, 11, 0.3)",
  },
  footerLinks: {
    marginTop: "1.2rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    textAlign: "center",
  },
  helper: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "0.82rem",
  },
  subHelper: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "0.78rem",
  },
  link: {
    color: "#a5b4fc",
    textDecoration: "none",
    fontWeight: "600",
  },
  adminRegisterLink: {
    color: "#fbbf24",
    textDecoration: "none",
    fontWeight: "700",
  },
  textBtn: {
    background: "none",
    border: "none",
    color: "#38bdf8",
    cursor: "pointer",
    padding: 0,
    fontSize: "0.78rem",
    fontWeight: "600",
    textDecoration: "underline",
  },
};

export default Login;