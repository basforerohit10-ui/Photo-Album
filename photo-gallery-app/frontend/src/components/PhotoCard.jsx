import React from "react";

const PhotoCard = ({ photo, onToggleFavorite, onDelete, isAdmin, onOpenModal }) => (
  <article className="photo-card">
    <button className="photo-image-button" onClick={() => onOpenModal(photo)} aria-label={`View ${photo.title}`}>
      <img src={photo.url} alt={photo.title} loading="lazy" />
      <span className="photo-category">{photo.category}</span>
    </button>
    <div className="photo-info">
      <div>
        <h3 className="photo-title">{photo.title}</h3>
        <p className="photo-author">Photograph by {photo.author || "Creator"}</p>
      </div>
      <div className="photo-actions">
        <button
          className={`photo-icon-button${photo.isFavorite ? " is-favorite" : ""}`}
          onClick={() => onToggleFavorite(photo.id)}
          aria-label={photo.isFavorite ? `Remove ${photo.title} from favorites` : `Add ${photo.title} to favorites`}
          aria-pressed={photo.isFavorite}
        >
          {photo.isFavorite ? "♥" : "♡"}
        </button>
        {isAdmin && <button className="photo-icon-button delete-button" onClick={onDelete} aria-label={`Delete ${photo.title}`}>×</button>}
      </div>
    </div>
  </article>
);

export default PhotoCard;