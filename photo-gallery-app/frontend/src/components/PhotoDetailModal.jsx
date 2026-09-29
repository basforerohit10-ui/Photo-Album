import React, { useEffect, useState, useMemo, useCallback } from "react";
import { enrichPhotoWithDetails, CATEGORY_ICONS } from "../data/photoDetails";
import { useToast } from "../context/ToastContext";
import "./PhotoDetailModal.css";

const PhotoDetailModal = ({
  photo,
  photos = [],
  onClose,
  onSelectPhoto,
  onToggleFavorite,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const { showToast } = useToast();

  const enriched = useMemo(() => {
    return enrichPhotoWithDetails(photo);
  }, [photo]);

  // Compute navigation indices
  const currentIndex = useMemo(() => {
    if (!photo || !photos.length) return -1;
    return photos.findIndex((p) => p.id === photo.id);
  }, [photo, photos]);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < photos.length - 1;

  const handlePrev = useCallback((event) => {
    event?.stopPropagation();
    if (hasPrev && onSelectPhoto) {
      setIsZoomed(false);
      setIsDownloadOpen(false);
      onSelectPhoto(photos[currentIndex - 1]);
    }
  }, [hasPrev, onSelectPhoto, photos, currentIndex]);

  const handleNext = useCallback((event) => {
    event?.stopPropagation();
    if (hasNext && onSelectPhoto) {
      setIsZoomed(false);
      setIsDownloadOpen(false);
      onSelectPhoto(photos[currentIndex + 1]);
    }
  }, [hasNext, onSelectPhoto, photos, currentIndex]);

  // Keyboard navigation & body scroll locking
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft") {
        handlePrev();
      } else if (event.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [handlePrev, handleNext, onClose]);

  // Related photos from same category (excluding current)
  const relatedPhotos = useMemo(() => {
    if (!enriched) return [];
    return photos
      .filter((p) => p.id !== enriched.id && p.category === enriched.category)
      .slice(0, 8);
  }, [enriched, photos]);

  // Total shots by same author
  const authorShotCount = useMemo(() => {
    if (!enriched?.author) return 1;
    return photos.filter((p) => p.author === enriched.author).length || 1;
  }, [enriched, photos]);

  if (!enriched) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(enriched.url);
      showToast("🔗 Photograph link copied to clipboard!", "success");
    } catch {
      showToast("🔗 Photo URL: " + enriched.url.slice(0, 30) + "...", "info");
    }
  };

  const triggerDownload = (url, suffix) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${enriched.title.toLowerCase().replace(/\s+/g, "-")}-${suffix}.jpg`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsDownloadOpen(false);
  };

  const handleDownloadMaster = () => {
    const masterUrl = enriched.url.includes("images.unsplash.com")
      ? enriched.url.replace(/w=\d+/, "w=2560").replace(/q=\d+/, "q=95")
      : enriched.url;
    triggerDownload(masterUrl, "master-print");
    showToast("📥 Downloading Master High-Resolution Print (2560px)...", "success");
  };

  const handleDownloadWeb = () => {
    const webUrl = enriched.url.includes("images.unsplash.com")
      ? enriched.url.replace(/w=\d+/, "w=1200").replace(/q=\d+/, "q=75")
      : enriched.url;
    triggerDownload(webUrl, "web-display");
    showToast("📥 Downloading Web-Optimized Image (1200px)...", "info");
  };

  const handleFavoriteToggle = () => {
    if (onToggleFavorite) {
      onToggleFavorite(enriched.id);
      showToast(
        enriched.isFavorite
          ? `Removed "${enriched.title}" from favorites`
          : `♥ Added "${enriched.title}" to favorites!`,
        enriched.isFavorite ? "info" : "success"
      );
    }
  };

  return (
    <div
      className="photo-detail-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo details for ${enriched.title}`}
    >
      <div
        className="photo-detail-modal"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <header className="pdm-topbar">
          <div className="pdm-topbar-left">
            <span className="pdm-category-badge">
              {CATEGORY_ICONS[enriched.category] ? `${CATEGORY_ICONS[enriched.category]} ` : ""}
              {enriched.category}
            </span>
            {currentIndex >= 0 && (
              <span className="pdm-counter">
                Photo <strong>{currentIndex + 1}</strong> of{" "}
                <strong>{photos.length}</strong>
              </span>
            )}
          </div>

          <div className="pdm-topbar-actions">
            {onToggleFavorite && (
              <button
                type="button"
                className={`pdm-icon-btn${enriched.isFavorite ? " is-favorite" : ""}`}
                onClick={handleFavoriteToggle}
                aria-label={
                  enriched.isFavorite
                    ? `Remove ${enriched.title} from favorites`
                    : `Add ${enriched.title} to favorites`
                }
                title={enriched.isFavorite ? "Favorited" : "Add to favorites"}
              >
                <span aria-hidden="true">{enriched.isFavorite ? "♥" : "♡"}</span>
                <span>{enriched.isFavorite ? "Liked" : "Like"}</span>
              </button>
            )}

            <button
              type="button"
              className="pdm-icon-btn"
              onClick={handleCopyLink}
              title="Copy photo link"
              aria-label="Copy photo link"
            >
              <span aria-hidden="true">🔗</span>
              <span>Share</span>
            </button>

            {/* Split Download Quality Dropdown */}
            <div className="pdm-download-dropdown-wrap">
              <button
                type="button"
                className="pdm-icon-btn pdm-download-trigger"
                onClick={() => setIsDownloadOpen((prev) => !prev)}
                title="Download image options"
                aria-expanded={isDownloadOpen}
              >
                <span aria-hidden="true">⬇</span>
                <span>Download</span>
                <span className="pdm-dropdown-chevron" aria-hidden="true">▾</span>
              </button>

              {isDownloadOpen && (
                <div className="pdm-download-menu" role="menu">
                  <button
                    type="button"
                    className="pdm-download-opt"
                    onClick={handleDownloadMaster}
                    role="menuitem"
                  >
                    <div className="pdm-opt-info">
                      <span className="pdm-opt-label">Master High-Res</span>
                      <span className="pdm-opt-meta">2560px · Ultra Fine Print</span>
                    </div>
                    <span className="pdm-opt-badge">RAW Quality</span>
                  </button>

                  <button
                    type="button"
                    className="pdm-download-opt"
                    onClick={handleDownloadWeb}
                    role="menuitem"
                  >
                    <div className="pdm-opt-info">
                      <span className="pdm-opt-label">Web Display</span>
                      <span className="pdm-opt-meta">1200px · Fast Social Share</span>
                    </div>
                    <span className="pdm-opt-badge pdm-badge-web">Optimized</span>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              className="pdm-close-btn"
              onClick={onClose}
              aria-label="Close photo details"
              title="Close (Esc)"
            >
              ×
            </button>
          </div>
        </header>

        {/* Main Body (Stage + Info Panel) */}
        <div className="pdm-body">
          {/* Left Stage: Photo Viewport */}
          <div className="pdm-stage">
            {hasPrev && (
              <button
                type="button"
                className="pdm-nav-btn pdm-nav-prev"
                onClick={handlePrev}
                aria-label="Previous photograph"
                title="Previous photo (Left Arrow)"
              >
                ‹
              </button>
            )}

            <div
              className="pdm-stage-wrapper"
              onClick={() => setIsZoomed(!isZoomed)}
              title={isZoomed ? "Click to reset view" : "Click to zoom image"}
            >
              <img
                src={enriched.url}
                alt={enriched.title}
                className={`pdm-image${isZoomed ? " is-zoomed" : ""}`}
              />
            </div>

            {hasNext && (
              <button
                type="button"
                className="pdm-nav-btn pdm-nav-next"
                onClick={handleNext}
                aria-label="Next photograph"
                title="Next photo (Right Arrow)"
              >
                ›
              </button>
            )}

            <span className="pdm-stage-hint">
              {isZoomed ? "Click to zoom out" : "Click image to zoom in • Arrow keys to navigate"}
            </span>
          </div>

          {/* Right Panel: Story, Photographer & Camera Details */}
          <aside className="pdm-info-panel">
            <div className="pdm-header">
              <p className="pdm-header-eyebrow">PHOTOGRAPH ARCHIVE</p>
              <h2 className="pdm-title">{enriched.title}</h2>
            </div>

            {/* "Kya chiz ka photo hai" - Story / Description */}
            <section className="pdm-section">
              <h3 className="pdm-section-title">About This Photograph</h3>
              <div className="pdm-description-box">
                <p className="pdm-description-text">{enriched.description}</p>
              </div>
            </section>

            {/* "Kis ne liya hai" - Photographer & Contributor Profile */}
            <section className="pdm-section">
              <h3 className="pdm-section-title">Photographer &amp; Creator</h3>
              <div className="pdm-author-card">
                <div className="pdm-author-avatar">
                  {(enriched.author || "P").charAt(0).toUpperCase()}
                </div>
                <div className="pdm-author-meta">
                  <div className="pdm-author-row">
                    <strong className="pdm-author-name">{enriched.author}</strong>
                    <span className="pdm-author-shots">{authorShotCount} {authorShotCount === 1 ? "work" : "works"} in studio</span>
                  </div>
                  <p className="pdm-author-role">
                    {enriched.submittedBy
                      ? `Contributed by @${enriched.submittedBy}`
                      : "Rohit Photostudio Featured Artist"}
                  </p>
                  <div className="pdm-author-badges-line">
                    <span className="pdm-author-badge">✓ Verified Artist</span>
                    <span className="pdm-author-badge pdm-author-badge-gear">
                      {enriched.camera.split(" ")[0]} Shooter
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Gear & EXIF Technical Specs Grid */}
            <section className="pdm-section">
              <h3 className="pdm-section-title">Camera &amp; Technical Specs</h3>
              <div className="pdm-meta-grid">
                <div className="pdm-meta-item">
                  <span className="pdm-meta-label">📍 Location</span>
                  <strong className="pdm-meta-value">{enriched.location}</strong>
                </div>

                <div className="pdm-meta-item">
                  <span className="pdm-meta-label">📷 Camera Body</span>
                  <strong className="pdm-meta-value">{enriched.camera}</strong>
                </div>

                <div className="pdm-meta-item">
                  <span className="pdm-meta-label">🔭 Lens Optics</span>
                  <strong className="pdm-meta-value">{enriched.lens}</strong>
                </div>

                <div className="pdm-meta-item">
                  <span className="pdm-meta-label">⚡ Exposure Settings</span>
                  <strong className="pdm-meta-value">{enriched.settings}</strong>
                </div>

                <div className="pdm-meta-item">
                  <span className="pdm-meta-label">📅 Date Captured</span>
                  <strong className="pdm-meta-value">{enriched.date}</strong>
                </div>

                <div className="pdm-meta-item">
                  <span className="pdm-meta-label">🎨 Collection Category</span>
                  <strong className="pdm-meta-value">
                    {CATEGORY_ICONS[enriched.category] ? `${CATEGORY_ICONS[enriched.category]} ` : ""}
                    {enriched.category}
                  </strong>
                </div>
              </div>
            </section>

            {/* Tags / Keywords */}
            {enriched.tags && enriched.tags.length > 0 && (
              <section className="pdm-section">
                <h3 className="pdm-section-title">Tags &amp; Keywords</h3>
                <div className="pdm-tags">
                  {enriched.tags.map((tag, idx) => (
                    <span key={idx} className="pdm-tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Actions Bar */}
            <div className="pdm-action-bar">
              <button
                type="button"
                className="pdm-btn-primary"
                onClick={handleDownloadMaster}
              >
                <span>Master High-Res</span>
                <span aria-hidden="true">⬇</span>
              </button>
              <button
                type="button"
                className="pdm-btn-secondary"
                onClick={handleDownloadWeb}
              >
                <span>Web-Optimized</span>
              </button>
              <button
                type="button"
                className="pdm-btn-secondary"
                onClick={handleCopyLink}
              >
                Share
              </button>
            </div>
          </aside>
        </div>

        {/* Bottom Related Photos Strip */}
        {relatedPhotos.length > 0 && (
          <footer className="pdm-related">
            <h4 className="pdm-related-heading">
              More from {enriched.category} ({relatedPhotos.length})
            </h4>
            <div className="pdm-related-strip">
              {relatedPhotos.map((relPhoto) => (
                <button
                  key={relPhoto.id}
                  type="button"
                  className={`pdm-related-item${relPhoto.id === enriched.id ? " is-current" : ""}`}
                  onClick={() => {
                    setIsZoomed(false);
                    setIsDownloadOpen(false);
                    onSelectPhoto(relPhoto);
                  }}
                  title={`View ${relPhoto.title}`}
                  aria-label={`View ${relPhoto.title}`}
                >
                  <img src={relPhoto.url} alt={relPhoto.title} loading="lazy" />
                  <span>{relPhoto.title}</span>
                </button>
              ))}
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default PhotoDetailModal;
