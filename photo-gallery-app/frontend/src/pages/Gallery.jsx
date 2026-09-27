import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhotoCard from "../components/PhotoCard";
import { useAuth } from "../context/AuthContext";

const Gallery = ({ photos, setPhotos }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [activeModalPhoto, setActiveModalPhoto] = useState(null);

  const categories = ["All", ...new Set(photos.map((p) => p.category))];
  const contributorCount = new Set(photos.filter((photo) => photo.submittedBy).map((photo) => photo.submittedBy)).size;
  const myContributionCount = user ? photos.filter((photo) => photo.submittedBy === user.username).length : 0;

  const handleToggleFavorite = (id) => {
    setPhotos((prev) =>
      prev.map((photo) =>
        photo.id === id ? { ...photo, isFavorite: !photo.isFavorite } : photo
      )
    );
  };

  const handleDelete = (id) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
  };

  const filteredPhotos = photos
    .filter((photo) =>
      selectedCategory === "All" ? true : photo.category === selectedCategory
    )
    .filter((photo) => (onlyFavorites ? photo.isFavorite : true))
    .filter((photo) =>
      photo.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>Rohit Photography</h1>
          <p style={styles.heroSubtitle}>Explore curated high-resolution photography, creative visual stories, and fine art.</p>

        <div style={styles.searchBox} className="glass-panel">
          <span style={{ opacity: 0.5 }}>🔍</span>
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

        <div style={styles.statsRow}>
          <div style={styles.statCard} className="glass-panel">
            <span style={styles.statLabel}>Approved Photos</span>
            <strong style={styles.statValue}>{photos.length}</strong>
          </div>
          <div style={styles.statCard} className="glass-panel">
            <span style={styles.statLabel}>Contributors</span>
            <strong style={styles.statValue}>{contributorCount}</strong>
          </div>
          {user && (
            <div style={styles.statCard} className="glass-panel">
              <span style={styles.statLabel}>My Contribution</span>
              <strong style={styles.statValue}>{myContributionCount}</strong>
            </div>
          )}
        </div>

        {user && (
          <div style={styles.submitWrap}>
            <button onClick={() => navigate("/submit")} style={styles.submitBtn}>
              + Submit Your Photo
            </button>
          </div>
        )}

        <div style={styles.filterSection}>
          <div style={styles.pillContainer}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  ...styles.pill,
                  backgroundColor: selectedCategory === cat ? "#6366f1" : "rgba(255,255,255,0.05)",
                  color: selectedCategory === cat ? "#fff" : "#94a3b8",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            style={{
              ...styles.favToggle,
              backgroundColor: onlyFavorites ? "rgba(239, 68, 68, 0.2)" : "rgba(255,255,255,0.05)",
              borderColor: onlyFavorites ? "#ef4444" : "rgba(255,255,255,0.1)",
              color: onlyFavorites ? "#f87171" : "#94a3b8",
            }}
          >
            ♥ Liked Only
          </button>
        </div>

        <div style={styles.grid}>
          {filteredPhotos.length > 0 ? (
            filteredPhotos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
                isAdmin={user?.role === "admin"}
                onOpenModal={setActiveModalPhoto}
              />
            ))
          ) : (
            <div style={styles.empty}>
              <p>No photos match your current filters.</p>
            </div>
          )}
        </div>

        {activeModalPhoto && (
          <div style={styles.modalOverlay} onClick={() => setActiveModalPhoto(null)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <img src={activeModalPhoto.url} alt={activeModalPhoto.title} style={styles.modalImg} />
              <div style={styles.modalMeta}>
                <h3>{activeModalPhoto.title}</h3>
                <span style={styles.modalTag}>{activeModalPhoto.category}</span>
              </div>
              <button style={styles.closeBtn} onClick={() => setActiveModalPhoto(null)}>✕</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "calc(100vh - 72px)",
    background: "transparent",
  },
  container: { maxWidth: "1280px", margin: "0 auto", padding: "2.5rem 2rem" },
  hero: { textAlign: "center", marginBottom: "2rem", padding: "1rem 0" },
  heroTitle: { fontSize: "2.5rem", fontWeight: "800", color: "#fff", marginBottom: "0.5rem", letterSpacing: "-0.5px", textShadow: "0 4px 20px rgba(15,23,42,0.7)" },
  heroSubtitle: { color: "#e2e8f0", fontSize: "1rem", marginBottom: "1.5rem", textShadow: "0 4px 20px rgba(15,23,42,0.7)" },
  searchBox: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.8rem 1.2rem",
    borderRadius: "30px",
    width: "100%",
    maxWidth: "420px",
    background: "rgba(15, 23, 42, 0.52)",
    border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.2)",
  },
  searchInput: { background: "none", border: "none", outline: "none", color: "#fff", width: "100%", fontSize: "0.95rem" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" },
  statCard: { borderRadius: "16px", padding: "1rem 1.2rem", display: "flex", flexDirection: "column", gap: "0.25rem", background: "rgba(15, 23, 42, 0.55)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: "0 10px 25px rgba(15, 23, 42, 0.18)" },
  statLabel: { fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" },
  statValue: { fontSize: "1.6rem", color: "#fff" },
  submitWrap: { display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" },
  submitBtn: { background: "linear-gradient(135deg, #10b981, #34d399)", color: "#04110d", border: "none", borderRadius: "999px", padding: "0.7rem 1.2rem", fontWeight: "700", cursor: "pointer", boxShadow: "0 12px 24px rgba(16, 185, 129, 0.25)" },
  filterSection: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "2.5rem", padding: "0.9rem 1rem", borderRadius: "18px", background: "rgba(15, 23, 42, 0.46)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", boxShadow: "0 10px 28px rgba(15, 23, 42, 0.14)" },
  pillContainer: { display: "flex", gap: "0.6rem", flexWrap: "wrap" },
  pill: { border: "1px solid rgba(255,255,255,0.08)", padding: "0.5rem 1.2rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", transition: "all 0.2s", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" },
  favToggle: { border: "1px solid", padding: "0.5rem 1.2rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", transition: "all 0.2s" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem" },
  empty: { gridColumn: "1 / -1", textAlign: "center", padding: "4rem 0", color: "#64748b" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100, padding: "2rem" },
  modalContent: { position: "relative", maxWidth: "800px", width: "100%", background: "#111827", borderRadius: "16px", overflow: "hidden" },
  modalImg: { width: "100%", maxHeight: "65vh", objectFit: "contain", background: "#000" },
  modalMeta: { padding: "1.2rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" },
  modalTag: { background: "#6366f1", color: "#fff", padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem" },
  closeBtn: { position: "absolute", top: "15px", right: "15px", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer" },
};

export default Gallery;