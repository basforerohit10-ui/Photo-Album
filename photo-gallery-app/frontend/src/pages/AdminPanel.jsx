import React, { useState } from "react";
import { Link } from "react-router-dom";
import PhotoDetailModal from "../components/PhotoDetailModal";

const AdminPanel = ({ photos, pendingPhotos, onApprovePhoto, onDeletePhoto }) => {
  const [activeModalPhoto, setActiveModalPhoto] = useState(null);
  const approvedPhotos = photos;
  const contributorCount = new Set(
    approvedPhotos.filter((photo) => photo.submittedBy).map((photo) => photo.submittedBy)
  ).size;

  return (
    <main style={styles.page} className="studio-admin-page">
      <div style={styles.container} className="studio-admin-container">
        <div style={styles.header} className="studio-admin-header">
          <h2 style={styles.title}>Rohit Photostudio — Admin Dashboard</h2>
          <p style={styles.subtitle}>Review submitted photos, approve them, and manage gallery content.</p>
          <p style={styles.guide}>Pending photo ko gallery mein dikhane ke liye <strong>Approve &amp; Publish</strong> choose karein. Galat photo ke liye <strong>Reject</strong> use karein.</p>
          <Link to="/admin/register" style={styles.createAdminLink}>Register another admin</Link>
        </div>

        <div style={styles.statsRow} className="studio-admin-stats">
          <div style={styles.statCard} className="studio-admin-stat">
            <span style={styles.label}>Pending</span>
            <strong style={styles.value}>{pendingPhotos.length}</strong>
          </div>
          <div style={styles.statCard} className="studio-admin-stat">
            <span style={styles.label}>Approved</span>
            <strong style={styles.value}>{approvedPhotos.length}</strong>
          </div>
          <div style={styles.statCard} className="studio-admin-stat">
            <span style={styles.label}>Contributors</span>
            <strong style={styles.value}>{contributorCount}</strong>
          </div>
        </div>

        <div style={styles.sectionGrid} className="studio-admin-panels">
          <section style={styles.panel} className="studio-admin-panel">
            <h3 style={styles.sectionTitle}>Pending Photos <span style={styles.sectionHint}>Needs review</span></h3>

            {pendingPhotos.length === 0 ? (
              <p style={styles.emptyState}>No images waiting for approval.</p>
            ) : (
              pendingPhotos.map((photo) => (
                <div key={photo.id} style={styles.photoRow}>
                  <img
                    src={photo.url}
                    alt={photo.title}
                    style={{ ...styles.thumb, cursor: "pointer" }}
                    onClick={() => setActiveModalPhoto(photo)}
                    title="Click to inspect photo details"
                  />
                  <div
                    style={{ ...styles.photoMeta, cursor: "pointer" }}
                    onClick={() => setActiveModalPhoto(photo)}
                    title="Click to inspect photo details"
                  >
                    <strong>{photo.title} ↗</strong>
                    <span>{photo.category}</span>
                    <small>Submitted by {photo.submittedBy}</small>
                  </div>
                  <div style={styles.actions}>
                    <button onClick={() => onApprovePhoto(photo)} style={styles.approveBtn}>Approve &amp; Publish</button>
                    <button onClick={() => onDeletePhoto(photo)} style={styles.rejectBtn}>Reject</button>
                  </div>
                </div>
              ))
            )}
          </section>

          <section style={styles.panel} className="studio-admin-panel">
            <h3 style={styles.sectionTitle}>Approved Gallery <span style={styles.sectionHint}>Live photos</span></h3>

            {approvedPhotos.map((photo) => (
              <div key={photo.id} style={styles.photoRow}>
                <img
                  src={photo.url}
                  alt={photo.title}
                  style={{ ...styles.thumb, cursor: "pointer" }}
                  onClick={() => setActiveModalPhoto(photo)}
                  title="Click to inspect photo details"
                />
                <div
                  style={{ ...styles.photoMeta, cursor: "pointer" }}
                  onClick={() => setActiveModalPhoto(photo)}
                  title="Click to inspect photo details"
                >
                  <strong>{photo.title} ↗</strong>
                  <span>{photo.category}</span>
                  <small>Contributor: {photo.submittedBy}</small>
                </div>
                <button onClick={() => onDeletePhoto(photo)} style={styles.rejectBtn}>Delete</button>
              </div>
            ))}
          </section>
        </div>
      </div>

      {activeModalPhoto && (
        <PhotoDetailModal
          photo={activeModalPhoto}
          photos={[...pendingPhotos, ...approvedPhotos]}
          onClose={() => setActiveModalPhoto(null)}
          onSelectPhoto={setActiveModalPhoto}
        />
      )}
    </main>
  );
};

const styles = {
  page: {
    minHeight: "calc(100vh - 72px)",
    background: "transparent",
  },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 1.5rem" },
  header: { marginBottom: "1.5rem" },
  title: { fontSize: "2rem", color: "#fff", marginBottom: "0.3rem", textShadow: "0 4px 20px rgba(15,23,42,0.7)" },
  subtitle: { color: "#e2e8f0", textShadow: "0 4px 20px rgba(15,23,42,0.7)" },
  guide: { display: "inline-block", marginTop: "0.8rem", padding: "0.65rem 0.85rem", borderRadius: "10px", color: "#fef3c7", background: "rgba(120, 53, 15, 0.35)", border: "1px solid rgba(251, 191, 36, 0.25)", fontSize: "0.82rem" },
  createAdminLink: { display: "inline-block", margin: "0.8rem 0 0 0.65rem", padding: "0.65rem 0.85rem", borderRadius: "8px", color: "#111310", background: "#c77a62", textDecoration: "none", fontSize: "0.82rem", fontWeight: "700" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" },
  statCard: { borderRadius: "16px", padding: "1rem 1.2rem", display: "flex", flexDirection: "column", gap: "0.3rem", background: "rgba(15, 23, 42, 0.55)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: "0 10px 25px rgba(15, 23, 42, 0.18)" },
  label: { color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" },
  value: { color: "#fff", fontSize: "2rem" },
  sectionGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" },
  panel: { borderRadius: "18px", padding: "1.2rem", minHeight: "300px", background: "rgba(15, 23, 42, 0.55)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: "0 12px 28px rgba(15, 23, 42, 0.16)" },
  sectionTitle: { display: "flex", alignItems: "center", gap: "0.55rem", fontSize: "1.2rem", color: "#fff", marginBottom: "1rem" },
  sectionHint: { color: "#94a3b8", fontSize: "0.65rem", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.08em" },
  photoRow: { display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.8rem 0", borderBottom: "1px solid rgba(255,255,255,0.08)" },
  thumb: { width: "64px", height: "64px", borderRadius: "12px", objectFit: "cover" },
  photoMeta: { flex: 1, display: "flex", flexDirection: "column", gap: "0.15rem", color: "#e2e8f0" },
  actions: { display: "flex", gap: "0.5rem", flexDirection: "column" },
  approveBtn: { background: "linear-gradient(135deg, #10b981, #34d399)", color: "#04110d", border: "none", borderRadius: "8px", padding: "0.45rem 0.7rem", fontWeight: "700", cursor: "pointer", boxShadow: "0 8px 18px rgba(16, 185, 129, 0.22)" },
  rejectBtn: { background: "rgba(239,68,68,0.14)", border: "1px solid rgba(239,68,68,0.35)", color: "#fca5a5", borderRadius: "8px", padding: "0.45rem 0.7rem", cursor: "pointer" },
  emptyState: { color: "#cbd5e1" },
};

export default AdminPanel;