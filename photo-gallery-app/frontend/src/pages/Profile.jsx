import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    api.getMyPhotos(user.token)
      .then(setPhotos)
      .catch((error) => setPhotoError(error.message))
      .finally(() => setLoadingPhotos(false));
  }, [user.token]);

  const handleLogout = () => {
    logout();
    navigate("/register");
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/gallery");
    }
  };

  return (
    <main style={styles.page}>
      <section style={styles.card} className="glass-panel">
        <button type="button" onClick={handleBack} style={styles.backButton}>← Back</button>
        <div style={styles.avatar}>{(user.fullName || user.username).charAt(0).toUpperCase()}</div>
        <span style={styles.eyebrow}>MY PROFILE</span>
        <h1 style={styles.title}>{user.fullName || user.username}</h1>
        <p style={styles.username}>@{user.username}</p>

        <div style={styles.details}>
          <div style={styles.detailRow}>
            <span style={styles.label}>Account type</span>
            <strong style={styles.value}>{user.role === "admin" ? "Administrator" : "Contributor"}</strong>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.label}>Username</span>
            <strong style={styles.value}>{user.username}</strong>
          </div>
        </div>

        <div style={styles.actions}>
          <Link to="/gallery" style={styles.secondaryButton}>Explore Gallery</Link>
          <button type="button" onClick={handleLogout} style={styles.logoutButton}>Log out</button>
        </div>

        <div style={styles.uploadsSection}>
          <div style={styles.uploadsHeader}>
            <div>
              <span style={styles.eyebrow}>MY UPLOADS</span>
              <h2 style={styles.uploadsTitle}>Photos you submitted</h2>
            </div>
            <strong style={styles.count}>{photos.length}</strong>
          </div>

          {loadingPhotos && <p style={styles.message}>Loading your photos...</p>}
          {photoError && <p style={styles.error}>{photoError}</p>}
          {!loadingPhotos && !photoError && photos.length === 0 && (
            <p style={styles.message}>You have not uploaded any photos yet.</p>
          )}
          <div style={styles.photoGrid}>
            {photos.map((photo) => (
              <article key={photo.id} style={styles.photoItem}>
                <img src={photo.url} alt={photo.title} style={styles.photoImage} />
                <div style={styles.photoMeta}>
                  <strong style={styles.photoTitle}>{photo.title}</strong>
                  <span style={photo.status === "approved" ? styles.approved : styles.pending}>
                    {photo.status === "approved" ? "Approved" : "Pending approval"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

const styles = {
  page: {
    minHeight: "calc(100vh - 72px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
  },
  card: {
    width: "100%",
    maxWidth: "920px",
    padding: "2.5rem clamp(1.5rem, 5vw, 3.5rem)",
    borderRadius: "20px",
    textAlign: "center",
    background: "rgba(15, 23, 42, 0.78)",
    border: "1px solid rgba(255,255,255,0.16)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    position: "relative",
  },
  backButton: {
    display: "block",
    marginBottom: "1.2rem",
    padding: "0.55rem 0.75rem",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#cbd5e1",
    cursor: "pointer",
    fontSize: "0.78rem",
    fontWeight: "700",
  },
  avatar: {
    width: "76px",
    height: "76px",
    margin: "0 auto 1.2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "22px",
    background: "linear-gradient(135deg, #f59e0b, #ef4444)",
    color: "#fff",
    fontSize: "2rem",
    fontWeight: "800",
    boxShadow: "0 12px 26px rgba(239, 68, 68, 0.25)",
  },
  eyebrow: {
    color: "#fbbf24",
    fontSize: "0.68rem",
    fontWeight: "800",
    letterSpacing: "0.16em",
  },
  title: {
    margin: "0.5rem 0 0.25rem",
    color: "#fff",
    fontSize: "2rem",
    fontWeight: "800",
  },
  username: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "0.9rem",
  },
  details: {
    margin: "2rem 0",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    padding: "1rem 0",
    textAlign: "left",
  },
  label: { color: "#94a3b8", fontSize: "0.82rem" },
  value: { color: "#f8fafc", fontSize: "0.86rem" },
  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "0.7rem",
    flexWrap: "wrap",
  },
  uploadsSection: {
    marginTop: "2.2rem",
    paddingTop: "1.8rem",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    textAlign: "left",
  },
  uploadsHeader: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" },
  uploadsTitle: { margin: "0.35rem 0 0", color: "#f8fafc", fontSize: "1.25rem" },
  count: { color: "#fbbf24", fontSize: "1.5rem" },
  message: { color: "#94a3b8", fontSize: "0.82rem", textAlign: "center", padding: "1rem 0" },
  error: { color: "#fca5a5", fontSize: "0.82rem", textAlign: "center", padding: "1rem 0" },
  photoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.85rem" },
  photoItem: { overflow: "hidden", borderRadius: "12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" },
  photoImage: { display: "block", width: "100%", aspectRatio: "1.25", objectFit: "cover" },
  photoMeta: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", padding: "0.65rem" },
  photoTitle: { color: "#f8fafc", fontSize: "0.78rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  approved: { color: "#86efac", fontSize: "0.65rem", whiteSpace: "nowrap" },
  pending: { color: "#fcd34d", fontSize: "0.65rem", whiteSpace: "nowrap" },
  secondaryButton: {
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    color: "#e2e8f0",
    border: "1px solid rgba(255,255,255,0.16)",
    textDecoration: "none",
    fontSize: "0.82rem",
    fontWeight: "700",
  },
  logoutButton: {
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    color: "#fff",
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    border: "none",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontWeight: "700",
  },
};

export default Profile;
