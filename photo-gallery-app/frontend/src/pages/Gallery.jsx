import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PhotoCard from "../components/PhotoCard";
import PhotoDetailModal from "../components/PhotoDetailModal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { CATEGORY_ICONS } from "../data/photoDetails";

const TRENDING_TAGS = [
  { label: "🛕 Golden Temple", query: "Golden Temple" },
  { label: "🕌 Taj Mahal", query: "Taj" },
  { label: "🕉️ Varanasi Ghats", query: "Varanasi" },
  { label: "⛰️ Kedarnath", query: "Kedarnath" },
  { label: "🏰 Hawa Mahal", query: "Hawa Mahal" },
  { label: "🌴 Kerala Backwaters", query: "Kerala" },
  { label: "🏔️ Ladakh & Spiti", query: "Ladakh" },
  { label: "🐅 Royal Bengal Tiger", query: "Tiger" },
];

const Gallery = ({ photos, setPhotos, onDeletePhoto }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [activeModalPhoto, setActiveModalPhoto] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("curated");

  // Keyboard shortcut listener: press "/" or "Ctrl+K" to focus search
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Don't trigger if user is already typing in an input/textarea
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
        return;
      }
      if (event.key === "/" || (event.key === "k" && (event.metaKey || event.ctrlKey))) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const categories = useMemo(() => {
    return ["All", ...new Set(photos.map((photo) => photo.category))];
  }, [photos]);

  const categoryCounts = useMemo(() => {
    const counts = { All: photos.length };
    photos.forEach((photo) => {
      counts[photo.category] = (counts[photo.category] || 0) + 1;
    });
    return counts;
  }, [photos]);

  const contributorCount = useMemo(() => {
    return new Set(
      photos.filter((photo) => photo.submittedBy).map((photo) => photo.submittedBy)
    ).size;
  }, [photos]);

  const myContributionCount = user
    ? photos.filter((photo) => photo.submittedBy === user.username).length
    : 0;

  const handleToggleFavorite = (id) => {
    setPhotos((prev) =>
      prev.map((photo) => {
        if (photo.id === id) {
          const nextState = !photo.isFavorite;
          showToast(
            nextState
              ? `♥ Added "${photo.title}" to favorites`
              : `Removed "${photo.title}" from favorites`,
            nextState ? "success" : "info"
          );
          return { ...photo, isFavorite: nextState };
        }
        return photo;
      })
    );
  };

  // Comprehensive multi-attribute search filter
  const filteredPhotos = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const baseList = photos
      .filter((photo) => selectedCategory === "All" || photo.category === selectedCategory)
      .filter((photo) => !onlyFavorites || photo.isFavorite)
      .filter((photo) => {
        if (!term) return true;
        const tagsStr = Array.isArray(photo.tags) ? photo.tags.join(" ") : "";
        const searchableText = `${photo.title} ${photo.author || ""} ${photo.category} ${photo.location || ""} ${photo.camera || ""} ${photo.description || ""} ${tagsStr} ${photo.submittedBy || ""}`.toLowerCase();
        return searchableText.includes(term);
      });

    if (sortBy === "popular") {
      return [...baseList].sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
    }
    if (sortBy === "latest") {
      return [...baseList].sort((a, b) => b.id - a.id);
    }
    return baseList;
  }, [photos, selectedCategory, onlyFavorites, searchTerm, sortBy]);

  // Featured hero photo
  const featuredHeroPhoto = useMemo(() => {
    return photos.find((p) => p.id === 1) || photos[0];
  }, [photos]);

  const isFiltered = Boolean(searchTerm || onlyFavorites || selectedCategory !== "All");

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setOnlyFavorites(false);
  };

  return (
    <main className="gallery-page" id="top">
      {/* Hero Section */}
      <section className="gallery-hero" id="hero">
        <div className="hero-ambient-glow" aria-hidden="true" />

        <div className="gallery-hero-copy">
          <div className="hero-status-pill">
            <span className="pulse-dot" />
            <span>INCREDIBLE INDIA PHOTOGRAPHY ARCHIVE</span>
            <span className="pill-divider">•</span>
            <span className="pill-edition">CURATED 2026</span>
          </div>

          <h1 className="hero-heading">
            Temples, Heritage<br />
            and <em>Sacred Lands.</em>
          </h1>

          <p className="gallery-hero-intro">
            A handpicked fine-art exhibition of India's iconic monuments, ancient temples, magnificent wildlife, and breathtaking natural wonders captured across the subcontinent.
          </p>

          <div className="hero-actions-row">
            <a className="hero-link-btn" href="#collection">
              <span>Explore Collection</span>
              <span aria-hidden="true">↘</span>
            </a>
            <button
              type="button"
              className="hero-secondary-btn"
              onClick={() => {
                if (user) navigate("/submit");
                else navigate("/login");
              }}
            >
              <span>Submit a Shot</span>
              <span aria-hidden="true">↗</span>
            </button>
          </div>

          <div className="hero-metrics-strip">
            <div className="hero-metric-item">
              <strong>{photos.length}+</strong>
              <span>Curated Shots</span>
            </div>
            <div className="hero-metric-divider" />
            <div className="hero-metric-item">
              <strong>{contributorCount || 1}</strong>
              <span>Global Creators</span>
            </div>
            <div className="hero-metric-divider" />
            <div className="hero-metric-item">
              <strong>100%</strong>
              <span>Raw EXIF Details</span>
            </div>
          </div>
        </div>

        {/* Featured Showcase Widget */}
        {featuredHeroPhoto && (
          <div
            className="hero-showcase-card"
            onClick={() => setActiveModalPhoto(featuredHeroPhoto)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveModalPhoto(featuredHeroPhoto);
              }
            }}
            aria-label={`Featured Photograph: ${featuredHeroPhoto.title} by ${featuredHeroPhoto.author}`}
            title="Click to view full photograph details"
          >
            <div className="hero-showcase-img-wrap">
              <img src={featuredHeroPhoto.url} alt={featuredHeroPhoto.title} />
              <div className="hero-showcase-badge">
                <span>⭐ FEATURED PIECE</span>
              </div>
            </div>
            <div className="hero-showcase-meta">
              <div className="hero-showcase-top">
                <span className="hero-showcase-cat">{featuredHeroPhoto.category}</span>
                <span className="hero-showcase-hint">Click to inspect ↗</span>
              </div>
              <h3 className="hero-showcase-title">{featuredHeroPhoto.title}</h3>
              <p className="hero-showcase-author">
                <span>Photograph by <strong>{featuredHeroPhoto.author}</strong></span>
                {featuredHeroPhoto.location && (
                  <span className="hero-showcase-loc">📍 {featuredHeroPhoto.location.split(",")[0]}</span>
                )}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Main Collection & Aesthetic Search Hub */}
      <section className="collection-section" id="collection">
        <div className="collection-heading">
          <div>
            <p className="eyebrow"><span className="eyebrow-mark" /> The Exhibition Portfolio</p>
            <h2>Recent <em>photographs</em></h2>
          </div>
          <p className="collection-count">
            <strong>{photos.length.toString().padStart(2, "0")}</strong> photographs<br />
            from <strong>{contributorCount.toString().padStart(2, "0")}</strong> contributors
          </p>
        </div>

        {/* Aesthetic Search Hub */}
        <div className="aesthetic-search-container">
          <div className={`aesthetic-search-capsule${isSearchFocused ? " is-focused" : ""}`}>
            <div className="search-icon-wrap" aria-hidden="true">
              <span className="search-icon">⌕</span>
            </div>

            <input
              ref={searchInputRef}
              id="gallery-search-input"
              type="text"
              className="aesthetic-search-input"
              placeholder="Search by temple, monument, state, camera, tags (e.g. Taj Mahal, Varanasi, Kedarnath, Kerala, Sony)..."
              aria-label="Search photographs"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />

            {searchTerm && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => {
                  setSearchTerm("");
                  searchInputRef.current?.focus();
                }}
                aria-label="Clear search query"
                title="Clear search"
              >
                ✕
              </button>
            )}

            <div className="search-meta-badge">
              <kbd className="search-shortcut" title="Press / anywhere to search">/</kbd>
            </div>
          </div>

          {/* Quick Trending Searches */}
          <div className="trending-tags-row">
            <span className="trending-label">Quick Filters:</span>
            <div className="trending-tags-list">
              {TRENDING_TAGS.map((item) => {
                const isActive = searchTerm.toLowerCase() === item.query.toLowerCase();
                return (
                  <button
                    key={item.query}
                    type="button"
                    className={`trending-tag-chip${isActive ? " is-active" : ""}`}
                    onClick={() => setSearchTerm(isActive ? "" : item.query)}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="chip-remove">✕</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Gallery Toolbar with Category Tabs & Actions */}
        <div className="gallery-toolbar-enhanced">
          <div className="category-pills" role="tablist" aria-label="Filter photographs by category">
            {categories.map((category) => (
              <button
                key={category}
                role="tab"
                className={`category-pill${selectedCategory === category ? " is-active" : ""}`}
                onClick={() => setSelectedCategory(category)}
                aria-selected={selectedCategory === category}
              >
                <span className="category-pill-icon" aria-hidden="true">
                  {CATEGORY_ICONS[category] || "📷"}
                </span>
                <span>{category}</span>
                <span className="category-count-badge">
                  {categoryCounts[category] || 0}
                </span>
              </button>
            ))}
          </div>

          <div className="toolbar-actions-group">
            {user && (
              <span className="contribution-pill">
                <span>Your Photos:</span> <strong>{myContributionCount}</strong>
              </span>
            )}
            {user && (
              <button
                type="button"
                className="action-submit-btn"
                onClick={() => navigate("/submit")}
              >
                <span>Submit Photo</span>
                <span aria-hidden="true">↗</span>
              </button>
            )}
            <button
              type="button"
              className={`favorite-filter-btn${onlyFavorites ? " is-active" : ""}`}
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              aria-pressed={onlyFavorites}
            >
              <span className="fav-heart">{onlyFavorites ? "♥" : "♡"}</span>
              <span>Favorites</span>
              <span className="fav-count">
                {photos.filter((p) => p.isFavorite).length}
              </span>
            </button>
          </div>
        </div>

        {/* Live Search Status Bar */}
        {isFiltered && (
          <div className="search-status-bar">
            <span>
              Showing <strong>{filteredPhotos.length}</strong> of <strong>{photos.length}</strong> photographs
              {searchTerm && <span> matching &ldquo;<strong>{searchTerm}</strong>&rdquo;</span>}
              {onlyFavorites && <span> in <strong>Favorites</strong></span>}
              {selectedCategory !== "All" && <span> in <strong>{selectedCategory}</strong></span>}
            </span>
            <button
              type="button"
              className="reset-filters-btn"
              onClick={handleResetFilters}
            >
              Reset all filters ↺
            </button>
          </div>
        )}

        {/* Controls Bar: Layout View Switcher & Sorting */}
        <div className="gallery-controls-bar">
          <div className="controls-left">
            <div className="view-mode-toggle-group" role="group" aria-label="Gallery layout view mode">
              <button
                type="button"
                className={`view-mode-btn${viewMode === "grid" ? " is-active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Uniform 3-Column Grid"
              >
                <span>☷</span>
                <span>Grid</span>
              </button>
              <button
                type="button"
                className={`view-mode-btn${viewMode === "masonry" ? " is-active" : ""}`}
                onClick={() => setViewMode("masonry")}
                title="Editorial Masonry Flow"
              >
                <span>☶</span>
                <span>Masonry</span>
              </button>
              <button
                type="button"
                className={`view-mode-btn${viewMode === "cinematic" ? " is-active" : ""}`}
                onClick={() => setViewMode("cinematic")}
                title="Cinematic Widescreen Frames"
              >
                <span>▤</span>
                <span>Cinematic</span>
              </button>
            </div>
          </div>

          <div className="controls-right">
            <div className="sort-select-wrap">
              <span>Sort:</span>
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort collection"
              >
                <option value="curated">Curated Collection</option>
                <option value="popular">Most Appreciated</option>
                <option value="latest">Recently Added</option>
              </select>
            </div>
          </div>
        </div>

        {/* Photo Grid */}
        <div className={`photo-grid is-view-${viewMode}`}>
          {filteredPhotos.length > 0 ? (
            filteredPhotos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onToggleFavorite={handleToggleFavorite}
                onDelete={() => onDeletePhoto(photo)}
                isAdmin={user?.role === "admin"}
                onOpenModal={setActiveModalPhoto}
              />
            ))
          ) : (
            <div className="gallery-empty-state">
              <span className="empty-state-icon">🔍</span>
              <h3>No photographs found</h3>
              <p>
                No photographs matched your current search query or category filters.
              </p>
              <button
                type="button"
                className="empty-reset-btn"
                onClick={handleResetFilters}
              >
                View all {photos.length} photographs
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Detail Lightbox Modal */}
      {activeModalPhoto && (
        <PhotoDetailModal
          photo={activeModalPhoto}
          photos={filteredPhotos.length > 0 ? filteredPhotos : photos}
          onClose={() => setActiveModalPhoto(null)}
          onSelectPhoto={setActiveModalPhoto}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </main>
  );
};

export default Gallery;