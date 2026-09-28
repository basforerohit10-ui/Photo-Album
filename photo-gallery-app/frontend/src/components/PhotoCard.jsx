import React from "react";

const PhotoCard = ({ photo, onToggleFavorite, onDelete, isAdmin, onOpenModal }) => {
  const locationShort = photo.location ? photo.location.split(",")[0].trim() : null;
  const cameraShort = photo.camera ? photo.camera.split(" ")[0].trim() : null;

  return (
    <article className="photo-card" id={`photo-card-${photo.id}`}>
      <button
        type="button"
        className="photo-image-button"
        onClick={() => onOpenModal(photo)}
        aria-label={`View details and story for ${photo.title}`}
      >
        <img src={photo.url} alt={photo.title} loading="lazy" />
        <div className="photo-card-overlay">
          <span className="photo-category">{photo.category}</span>
          {locationShort && (
            <span className="photo-card-location">📍 {locationShort}</span>
          )}
          <span className="photo-hover-hint">
            <span>🔍</span> View Details &amp; Story
          </span>
        </div>
      </button>

      <div className="photo-info">
        <div
          className="photo-info-copy"
          onClick={() => onOpenModal(photo)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpenModal(photo);
            }
          }}
          title="Click to view details"
        >
          <h3 className="photo-title">{photo.title}</h3>
          <p className="photo-author">
            <span className="author-dot" />
            <span>by <strong>{photo.author || "Creator"}</strong></span>
            {cameraShort && <span className="author-gear">• {cameraShort}</span>}
          </p>
        </div>

        <div className="photo-actions">
          <button
            type="button"
            className={`photo-icon-button${photo.isFavorite ? " is-favorite" : ""}`}
            onClick={() => onToggleFavorite(photo.id)}
            aria-label={photo.isFavorite ? `Remove ${photo.title} from favorites` : `Add ${photo.title} to favorites`}
            aria-pressed={photo.isFavorite}
            title={photo.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {photo.isFavorite ? "♥" : "♡"}
          </button>
          {isAdmin && (
            <button
              type="button"
              className="photo-icon-button delete-button"
              onClick={onDelete}
              aria-label={`Delete ${photo.title}`}
              title="Delete photo"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default PhotoCard;