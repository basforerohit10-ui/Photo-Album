import React, { useState } from "react";

const PhotoCard = ({ photo, onToggleFavorite, onDelete, isAdmin, onOpenModal }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.card,
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered ? "0 20px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(99,102,241,0.2)" : "0 4px 6px -1px rgba(0,0,0,0.3)"
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="glass-panel"
    >
      <div style={styles.imageWrapper} onClick={() => onOpenModal(photo)}>
        <img
          src={photo.url}
          alt={photo.title}
          style={{
            ...styles.image,
            transform: hovered ? "scale(1.08)" : "scale(1)"
          }}
        />
        <div style={styles.categoryBadge}>{photo.category}</div>
      </div>

      <div style={styles.info}>
        <div>
          <h4 style={styles.title}>{photo.title}</h4>
          <p style={styles.author}>By {photo.author || "Creator"}</p>
        </div>

        <div style={styles.actions}>
          <button
            onClick={() => onToggleFavorite(photo.id)}
            style={{
              ...styles.heartBtn,
              color: photo.isFavorite ? "#ef4444" : "#64748b",
              transform: photo.isFavorite ? "scale(1.15)" : "scale(1)"
            }}
          >
            {photo.isFavorite ? "♥" : "♡"}
          </button>

          {isAdmin && (
            <button
              onClick={() => onDelete(photo.id)}
              style={styles.deleteBtn}
              title="Delete Photo"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    borderRadius: "16px",
    overflow: "hidden",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
  },
  imageWrapper: { position: "relative", height: "240px", overflow: "hidden", cursor: "pointer" },
  image: { width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)" },
  categoryBadge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    background: "rgba(15, 23, 42, 0.75)",
    backdropFilter: "blur(6px)",
    color: "#e2e8f0",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "600",
    letterSpacing: "0.5px"
  },
  info: { padding: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: "1rem", fontWeight: "600", color: "#f8fafc", margin: "0 0 4px 0" },
  author: { fontSize: "0.75rem", color: "#64748b", margin: 0 },
  actions: { display: "flex", alignItems: "center", gap: "0.5rem" },
  heartBtn: { background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", transition: "transform 0.2s ease" },
  deleteBtn: {
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#f87171",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem"
  }
};

export default PhotoCard;