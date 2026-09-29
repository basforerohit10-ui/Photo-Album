import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = ({ adminMode = false }) => {
  const [isAdminRegister, setIsAdminRegister] = useState(adminMode);
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    password: "",
    adminSecurityKey: "",
  });
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user, register, registerAdmin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const payload = {
      fullName: form.fullName,
      username: form.username,
      password: form.password,
      ...(isAdminRegister || adminMode ? { adminSecurityKey: form.adminSecurityKey } : {}),
    };

    const result = adminMode && user?.token
      ? await registerAdmin(user.token, payload)
      : await register(payload);
    setLoading(false);
    setMessage(result.message);
    setIsSuccess(result.ok);

    if (result.ok) {
      setTimeout(() => {
        navigate(adminMode || isAdminRegister ? "/login" : "/login");
      }, 1200);
    }
  };

  const handleBack = () => {
    if (adminMode) {
      navigate("/admin");
    } else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/gallery");
    }
  };

  return (
    <div style={styles.page} className="studio-auth-page">
      <div className="studio-auth-shell">
        <div className="studio-back-nav-bar">
          <button
            type="button"
            onClick={handleBack}
            className="studio-back-btn"
            title={adminMode || isAdminRegister ? "Return to admin panel" : "Return to gallery"}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>{adminMode ? "Back to Admin Panel" : "Back to Gallery"}</span>
          </button>
        </div>

        <div style={styles.container} className="studio-auth-layout">
          <aside className="studio-auth-aside">
            <span className="studio-aside-kicker">ROHIT PHOTOSTUDIO</span>
            <div>
              <h1>Make room<br />for your vision.</h1>
              <p>{isAdminRegister ? "Create an administrator account with studio management privileges." : "Join the collection and share photographs that see the world your way."}</p>
            </div>
            <span className="studio-aside-caption">THE PHOTOGRAPHY COLLECTION</span>
          </aside>
          <div style={styles.box} className="studio-auth-card">
            {/* Mobile / Card-level Back Button */}
            <button
              type="button"
              onClick={handleBack}
              className="studio-card-back-btn"
              title={adminMode ? "Return to admin panel" : "Return to gallery"}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>{adminMode ? "Back to Admin" : "Back"}</span>
            </button>

            {/* Mode Switch Tabs: Contributor vs Admin */}
            <div style={styles.tabBar}>
              <button
                type="button"
                onClick={() => { setIsAdminRegister(false); setMessage(""); }}
                style={{
                  ...styles.tabBtn,
                  ...(!isAdminRegister ? styles.tabBtnActive : {}),
                }}
              >
                Contributor Account
              </button>
              <button
                type="button"
                onClick={() => { setIsAdminRegister(true); setMessage(""); }}
                style={{
                  ...styles.tabBtn,
                  ...(isAdminRegister ? styles.adminTabBtnActive : {}),
                }}
              >
                🛡️ Admin Account
              </button>
            </div>

            <div style={styles.headerBox}>
              {isAdminRegister && (
                <span style={styles.adminBadge}>ADMIN PRIVILEGES</span>
              )}
              <h2 style={styles.title}>{isAdminRegister ? "Register as Administrator" : "Create account"}</h2>
              <p style={styles.sub}>{isAdminRegister ? "Set up your admin name, username, password and enter your secret passkey." : "Join the gallery community and submit your photography as a contributor."}</p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="e.g. Rohit Basfore"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  style={isAdminRegister ? { ...styles.input, ...styles.adminInput } : styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder={isAdminRegister ? "Choose admin username (e.g. rohit45)" : "Choose a username"}
                  value={form.username}
                  onChange={handleChange}
                  required
                  style={isAdminRegister ? { ...styles.input, ...styles.adminInput } : styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Password (min. 6 chars)</label>
                <div style={styles.passwordWrap}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a secure password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    style={{
                      ...styles.passwordInput,
                      ...(isAdminRegister ? styles.adminInput : {}),
                    }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {isAdminRegister && (
                <div style={styles.field}>
                  <label style={styles.adminKeyLabel}>Admin Security Passkey *</label>
                  <input
                    type="password"
                    name="adminSecurityKey"
                    placeholder="Enter admin passkey (e.g. 2005)"
                    value={form.adminSecurityKey}
                    onChange={handleChange}
                    required
                    style={{ ...styles.input, ...styles.adminInput }}
                  />
                  <span style={styles.hint}>
                    Enter your studio passkey (default is 2005). Existing accounts will be upgraded to Administrator!
                  </span>
                </div>
              )}

              {message && (
                <p style={isSuccess ? styles.successMsg : styles.errorMsg}>
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.btn,
                  ...(isAdminRegister ? styles.adminBtn : {}),
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading
                  ? "Processing..."
                  : isAdminRegister
                  ? "⚡ Register / Upgrade as Admin"
                  : "Create Contributor Account"}
              </button>
            </form>

            <p style={styles.helper}>
              Already have an account?{" "}
              <Link to="/login" style={isAdminRegister ? styles.adminLoginLink : styles.link}>
                {isAdminRegister ? "Sign in to Admin Portal" : "Login here"}
              </Link>
            </p>
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
    maxWidth: "460px",
    width: "100%",
    padding: "2.2rem 2.2rem",
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
    marginBottom: "1.5rem",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  tabBtn: {
    flex: 1,
    textAlign: "center",
    textDecoration: "none",
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
    marginBottom: "1.3rem",
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
    marginBottom: "0.5rem",
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
    fontSize: "0.85rem",
    margin: 0,
    lineHeight: "1.4",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
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
  hint: {
    color: "#94a3b8",
    fontSize: "0.72rem",
    lineHeight: "1.3",
  },
  input: {
    background: "rgba(255, 255, 255, 0.07)",
    border: "1px solid rgba(255, 255, 255, 0.14)",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    color: "#fff",
    outline: "none",
    fontSize: "0.9rem",
  },
  passwordWrap: { position: "relative", display: "flex", alignItems: "center" },
  passwordInput: {
    width: "100%",
    paddingRight: "4.2rem",
    background: "rgba(255, 255, 255, 0.07)",
    border: "1px solid rgba(255, 255, 255, 0.14)",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    color: "#fff",
    outline: "none",
    fontSize: "0.9rem",
  },
  passwordToggle: { position: "absolute", right: "0.6rem", background: "transparent", border: "none", color: "#a5b4fc", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700" },
  adminInput: {
    borderColor: "rgba(245, 158, 11, 0.4)",
    background: "rgba(15, 23, 42, 0.5)",
  },
  successMsg: {
    color: "#86efac",
    fontSize: "0.82rem",
    margin: "-0.2rem 0",
    lineHeight: "1.3",
    fontWeight: "600",
  },
  errorMsg: {
    color: "#fca5a5",
    fontSize: "0.82rem",
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
    marginTop: "0.3rem",
    boxShadow: "0 8px 20px rgba(99, 102, 241, 0.3)",
  },
  adminBtn: {
    background: "linear-gradient(135deg, #f59e0b, #ef4444)",
    boxShadow: "0 8px 20px rgba(245, 158, 11, 0.3)",
  },
  helper: {
    marginTop: "1.3rem",
    color: "#cbd5e1",
    fontSize: "0.82rem",
    textAlign: "center",
  },
  link: {
    color: "#a5b4fc",
    textDecoration: "none",
    fontWeight: "600",
  },
  adminLoginLink: {
    color: "#fbbf24",
    textDecoration: "none",
    fontWeight: "700",
  },
};

export default Register;
