import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import PhotoDetailModal from "../components/PhotoDetailModal";
import { INDIAN_CATEGORIES, CATEGORY_ICONS } from "../data/photoDetails";
import "./AdminPanel.css";

const THEME_DESCRIPTIONS = {
  "Temples & Spiritual": "Sacred sanctums, divine rituals, ancient temples & pilgrimage centers across India.",
  "Famous Monuments": "Architectural marvels, Mughal architecture, forts, palaces & UNESCO world heritage sites.",
  "Indian Nature": "Lush landscapes, serene rivers, waterfalls, coastal serenity & rural tranquility.",
  "Himalayas & Deserts": "Snowcapped Himalayan heights, high-altitude passes, and golden Thar desert dunes.",
  "Wildlife of India": "Bengal tigers, Asiatic elephants, vibrant bird sanctuaries, and national park safaris.",
  "Culture & Ghats": "Vibrant street life, colorful festivals, Varanasi ghats, classical arts & living traditions.",
  "Royal Palaces": "Magnificent royal residences, heritage havelis, and regal architecture across royal states.",
  "Indian Culture & Street": "Everyday Indian life, bustling bazaars, street portraiture, and festive spirit.",
};

const AdminPanel = ({ photos = [], pendingPhotos = [], onApprovePhoto, onDeletePhoto }) => {
  const [activeModalPhoto, setActiveModalPhoto] = useState(null);
  const [activeTab, setActiveTab] = useState(pendingPhotos.length > 0 ? "pending" : "approved");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const approvedPhotos = photos;
  const allPhotos = useMemo(() => [...pendingPhotos, ...approvedPhotos], [pendingPhotos, approvedPhotos]);

  // Compute all unique artists and their submission breakdowns
  const artistsList = useMemo(() => {
    const map = new Map();
    allPhotos.forEach((photo) => {
      const name = photo.submittedBy || photo.author || "Studio Contributor";
      const key = name.toLowerCase().trim();
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: name,
          photos: [],
          approvedCount: 0,
          pendingCount: 0,
          categories: new Set(),
        });
      }
      const entry = map.get(key);
      entry.photos.push(photo);
      const isPending = pendingPhotos.some((p) => p.id === photo.id);
      if (isPending) {
        entry.pendingCount += 1;
      } else {
        entry.approvedCount += 1;
      }
      if (photo.category) {
        entry.categories.add(photo.category);
      }
    });
    return Array.from(map.values()).sort((a, b) => b.photos.length - a.photos.length);
  }, [allPhotos, pendingPhotos]);

  // Compute all themes / categories
  const allCategories = useMemo(() => {
    const set = new Set(INDIAN_CATEGORIES);
    allPhotos.forEach((p) => {
      if (p.category && p.category !== "All") set.add(p.category);
    });
    return Array.from(set);
  }, [allPhotos]);

  const themesList = useMemo(() => {
    return allCategories.map((catName) => {
      const catApproved = approvedPhotos.filter((p) => p.category === catName);
      const catPending = pendingPhotos.filter((p) => p.category === catName);
      const samplePhoto = catApproved[0] || catPending[0] || null;
      return {
        name: catName,
        icon: CATEGORY_ICONS[catName] || "📷",
        description:
          THEME_DESCRIPTIONS[catName] ||
          "Curated fine-art photography collection capturing the timeless essence of this theme.",
        approvedCount: catApproved.length,
        pendingCount: catPending.length,
        totalCount: catApproved.length + catPending.length,
        samplePhoto: samplePhoto,
      };
    });
  }, [allCategories, approvedPhotos, pendingPhotos]);

  const contributorCount = artistsList.length;
  const uniqueCategoriesCount = themesList.length;

  // Filtered lists for the active tab
  const currentPhotoList = activeTab === "pending" ? pendingPhotos : approvedPhotos;

  const filteredPhotos = useMemo(() => {
    return currentPhotoList.filter((photo) => {
      const matchesCategory =
        selectedCategory === "All" || photo.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        photo.title?.toLowerCase().includes(q) ||
        photo.location?.toLowerCase().includes(q) ||
        photo.author?.toLowerCase().includes(q) ||
        photo.submittedBy?.toLowerCase().includes(q) ||
        photo.category?.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [currentPhotoList, selectedCategory, searchQuery]);

  const filteredArtists = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return artistsList;
    return artistsList.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        Array.from(a.categories).some((c) => c.toLowerCase().includes(q))
    );
  }, [artistsList, searchQuery]);

  const filteredThemes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return themesList;
    return themesList.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }, [themesList, searchQuery]);

  const scrollToContent = () => {
    const el = document.getElementById("admin-content-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCardClick = (tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === "approved" || tabKey === "pending") {
      setSelectedCategory("All");
    }
    setSearchQuery("");
    scrollToContent();
  };

  const handleSelectArtist = (artistName) => {
    setActiveTab("approved");
    setSelectedCategory("All");
    setSearchQuery(artistName);
    scrollToContent();
  };

  const handleSelectTheme = (themeName) => {
    setActiveTab("approved");
    setSelectedCategory(themeName);
    setSearchQuery("");
    scrollToContent();
  };

  const handleDelete = (photo) => {
    if (deleteConfirmId === photo.id) {
      onDeletePhoto(photo);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(photo.id);
      setTimeout(() => setDeleteConfirmId(null), 4000);
    }
  };

  return (
    <main className="studio-admin-page">
      <div className="studio-admin-container">
        {/* Top Curatorial Header */}
        <header className="admin-header-panel">
          <div className="admin-header-copy">
            <span className="admin-kicker">ROHIT PHOTOSTUDIO · CURATORIAL CONSOLE</span>
            <h1 className="admin-title">Archive &amp; Studio Administration</h1>
            <p className="admin-subtitle">
              Review artist submissions, inspect photography details, manage the live gallery, and browse curated themes and contributors.
            </p>
          </div>

          <div className="admin-header-actions">
            <Link to="/submit" className="admin-action-btn primary" title="Directly publish fine art photo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Submit Direct Photo</span>
            </Link>

            <Link to="/admin/register" className="admin-action-btn secondary" title="Register an additional admin">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              <span>Add Administrator</span>
            </Link>

            <Link to="/gallery" className="admin-action-btn secondary" title="View the live public collection">
              <span>View Live Archive ↗</span>
            </Link>
          </div>
        </header>

        {/* Studio Metrics Grid — All 4 Cards are fully Clickable & Interactive */}
        <section className="admin-metrics-grid" aria-label="Studio Statistics & Quick View Switchers">
          {/* Card 1: Pending Reviews */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleCardClick("pending")}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleCardClick("pending"); }}
            className={`admin-metric-card ${pendingPhotos.length > 0 ? "alert" : "success"} ${activeTab === "pending" ? "is-active-tab" : ""}`}
            title="Click to check Pending Submissions"
          >
            <div className="metric-top">
              <span className="metric-label">Pending Reviews</span>
              {pendingPhotos.length > 0 ? (
                <span className="metric-pill alert">● Needs Action</span>
              ) : (
                <span className="metric-pill success">✓ All Clear</span>
              )}
            </div>
            <div className="metric-value">{pendingPhotos.length}</div>
            <p className="metric-caption">
              {pendingPhotos.length === 1
                ? "1 submission awaiting review"
                : `${pendingPhotos.length} submissions awaiting review`}
            </p>
            <div className="metric-action-hint">
              <span>{activeTab === "pending" ? "● Currently Viewing" : "Click to check queue →"}</span>
            </div>
          </div>

          {/* Card 2: Live Archive */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleCardClick("approved")}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleCardClick("approved"); }}
            className={`admin-metric-card accent ${activeTab === "approved" ? "is-active-tab" : ""}`}
            title="Click to check Live Published Archive"
          >
            <div className="metric-top">
              <span className="metric-label">Live Archive</span>
              <span className="metric-pill success">Published</span>
            </div>
            <div className="metric-value">{approvedPhotos.length}</div>
            <p className="metric-caption">Fine-art photographs in public gallery</p>
            <div className="metric-action-hint">
              <span>{activeTab === "approved" ? "● Currently Viewing" : "Click to browse archive →"}</span>
            </div>
          </div>

          {/* Card 3: Contributing Artists */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleCardClick("artists")}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleCardClick("artists"); }}
            className={`admin-metric-card neutral ${activeTab === "artists" ? "is-active-tab" : ""}`}
            title="Click to check Contributing Artists Directory"
          >
            <div className="metric-top">
              <span className="metric-label">Contributing Artists</span>
              <span className="metric-pill neutral">Active</span>
            </div>
            <div className="metric-value">{contributorCount}</div>
            <p className="metric-caption">Unique contributors to the archive</p>
            <div className="metric-action-hint">
              <span>{activeTab === "artists" ? "● Currently Viewing" : "Click to view artists roster →"}</span>
            </div>
          </div>

          {/* Card 4: Indian Themes */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleCardClick("themes")}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleCardClick("themes"); }}
            className={`admin-metric-card neutral ${activeTab === "themes" ? "is-active-tab" : ""}`}
            title="Click to check Curated Themes & Categories"
          >
            <div className="metric-top">
              <span className="metric-label">Indian Themes</span>
              <span className="metric-pill neutral">Curated</span>
            </div>
            <div className="metric-value">{uniqueCategoriesCount}</div>
            <p className="metric-caption">Heritage, spiritual, and nature themes</p>
            <div className="metric-action-hint">
              <span>{activeTab === "themes" ? "● Currently Viewing" : "Click to explore themes →"}</span>
            </div>
          </div>
        </section>

        {/* Tab Selection & Search Bar */}
        <section id="admin-content-section" className="admin-controls-bar">
          <div className="admin-tabs-nav" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "pending"}
              onClick={() => handleCardClick("pending")}
              className={`admin-tab-toggle ${activeTab === "pending" ? "active" : ""}`}
            >
              <span>Pending Review</span>
              <span className={`tab-badge ${pendingPhotos.length > 0 ? "alert" : "neutral"}`}>
                {pendingPhotos.length}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "approved"}
              onClick={() => handleCardClick("approved")}
              className={`admin-tab-toggle ${activeTab === "approved" ? "active" : ""}`}
            >
              <span>Live Gallery Archive</span>
              <span className="tab-badge neutral">{approvedPhotos.length}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "artists"}
              onClick={() => handleCardClick("artists")}
              className={`admin-tab-toggle ${activeTab === "artists" ? "active" : ""}`}
            >
              <span>Contributing Artists</span>
              <span className="tab-badge neutral">{contributorCount}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "themes"}
              onClick={() => handleCardClick("themes")}
              className={`admin-tab-toggle ${activeTab === "themes" ? "active" : ""}`}
            >
              <span>Indian Themes</span>
              <span className="tab-badge neutral">{uniqueCategoriesCount}</span>
            </button>
          </div>

          <div className="admin-search-wrapper">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8a8d83" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="admin-search-input"
              placeholder={
                activeTab === "artists"
                  ? "Search artist or contributor name..."
                  : activeTab === "themes"
                  ? "Search theme or category name..."
                  : activeTab === "pending"
                  ? "Search pending submissions by title, artist, location..."
                  : "Search live archive by title, artist, location..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{ background: "none", border: "none", color: "#8a8d83", cursor: "pointer", padding: "0 4px" }}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </section>

        {/* Category Filter Pills (Shown only for Photos views: Pending & Approved) */}
        {(activeTab === "pending" || activeTab === "approved") && (
          <div className="admin-category-filters" role="group" aria-label="Filter by Category">
            <button
              type="button"
              onClick={() => setSelectedCategory("All")}
              className={`admin-category-pill ${selectedCategory === "All" ? "active" : ""}`}
            >
              All Categories
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`admin-category-pill ${selectedCategory === cat ? "active" : ""}`}
              >
                {CATEGORY_ICONS[cat] ? `${CATEGORY_ICONS[cat]} ` : ""}{cat}
              </button>
            ))}
          </div>
        )}

        {/* ----------------- VIEW 1 & 2: PHOTOS LIST (PENDING / APPROVED) ----------------- */}
        {(activeTab === "pending" || activeTab === "approved") && (
          <section className="admin-submissions-grid" aria-label="Curated Photographs">
            {filteredPhotos.length === 0 ? (
              <div className="admin-empty-queue">
                <div className="empty-queue-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                </div>
                <h2 className="empty-queue-title">
                  {activeTab === "pending"
                    ? "The Review Queue Is Completely Clear"
                    : "No Published Photos Found"}
                </h2>
                <p className="empty-queue-desc">
                  {activeTab === "pending"
                    ? "All contributor submissions have been reviewed and published to the live Rohit Photostudio archive."
                    : searchQuery || selectedCategory !== "All"
                    ? "No photographs match the active search or category filter. Try clearing the filters."
                    : "No photographs currently in the live archive."}
                </p>
                {activeTab === "pending" && approvedPhotos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleCardClick("approved")}
                    className="admin-action-btn secondary"
                    style={{ marginTop: "12px" }}
                  >
                    View Live Archive ({approvedPhotos.length}) →
                  </button>
                )}
                {(searchQuery || selectedCategory !== "All") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                    className="admin-action-btn secondary"
                    style={{ marginTop: "12px" }}
                  >
                    Clear Search &amp; Filters
                  </button>
                )}
              </div>
            ) : (
              filteredPhotos.map((photo) => (
                <article key={photo.id} className="admin-submission-card">
                  <div
                    className="submission-image-container"
                    onClick={() => setActiveModalPhoto(photo)}
                    title="Click to inspect high-resolution details"
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="submission-image"
                      loading="lazy"
                    />
                    <span className="submission-overlay-badge">{photo.category || "General"}</span>
                    <span className={`submission-status-chip ${activeTab === "approved" ? "live" : ""}`}>
                      {activeTab === "pending" ? "● Pending Review" : "✓ Live"}
                    </span>
                  </div>

                  <div className="submission-body">
                    <h3
                      className="submission-title"
                      onClick={() => setActiveModalPhoto(photo)}
                      title="Click to view details"
                    >
                      {photo.title}
                    </h3>

                    <div className="submission-meta-list">
                      <div className="submission-meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e0a18b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>
                          Artist: <strong>{photo.author || photo.submittedBy || "Unknown"}</strong>
                        </span>
                      </div>

                      {photo.location && (
                        <div className="submission-meta-item">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e0a18b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          <span>{photo.location}</span>
                        </div>
                      )}

                      <div className="submission-meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8a8d83" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span style={{ color: "#777b70" }}>
                          Submitted by: {photo.submittedBy || "contributor"}
                        </span>
                      </div>
                    </div>

                    {photo.description && (
                      <p className="submission-desc">{photo.description}</p>
                    )}

                    <div className="submission-card-actions">
                      {activeTab === "pending" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onApprovePhoto(photo)}
                            className="btn-approve"
                            title="Publish this photograph to the public gallery"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>Approve &amp; Publish</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveModalPhoto(photo)}
                            className="btn-inspect"
                            title="Inspect photograph EXIF and resolution"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="11" cy="11" r="8"></circle>
                              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <span>Inspect</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(photo)}
                            className="btn-reject"
                            title="Reject and discard submission"
                          >
                            {deleteConfirmId === photo.id ? (
                              "Confirm Reject?"
                            ) : (
                              <>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                                <span>Reject</span>
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setActiveModalPhoto(photo)}
                            className="btn-inspect"
                            style={{ flex: 1 }}
                            title="Inspect photograph details"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="11" cy="11" r="8"></circle>
                              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <span>Inspect Fullscreen</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(photo)}
                            className="btn-reject"
                            title="Remove photo from live gallery"
                          >
                            {deleteConfirmId === photo.id ? (
                              "Confirm Delete?"
                            ) : (
                              <>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                <span>Remove</span>
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        )}

        {/* ----------------- VIEW 3: CONTRIBUTING ARTISTS ROSTER ----------------- */}
        {activeTab === "artists" && (
          <section className="admin-artists-section" aria-label="Contributing Artists Directory">
            <div className="section-intro-bar">
              <div>
                <h2 className="section-intro-title">Contributing Artists &amp; Photographers Roster</h2>
                <p className="section-intro-desc">
                  Overview of all photographers and studio contributors with total submissions and published portfolio counts.
                </p>
              </div>
              <span className="section-count-badge">{filteredArtists.length} Artists</span>
            </div>

            {filteredArtists.length === 0 ? (
              <div className="admin-empty-queue">
                <h3 className="empty-queue-title">No Artists Found</h3>
                <p className="empty-queue-desc">No contributing artists match your search query "{searchQuery}".</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="admin-action-btn secondary"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="admin-artists-grid">
                {filteredArtists.map((artist) => {
                  const initial = artist.name ? artist.name.charAt(0).toUpperCase() : "A";
                  return (
                    <article key={artist.id} className="admin-artist-card">
                      <div className="artist-card-header">
                        <div className="artist-avatar">{initial}</div>
                        <div className="artist-info">
                          <h3 className="artist-name">{artist.name}</h3>
                          <span className="artist-badge">Verified Contributor</span>
                        </div>
                      </div>

                      <div className="artist-stats-row">
                        <div className="artist-stat-box">
                          <span className="stat-label">Published</span>
                          <span className="stat-num success">{artist.approvedCount}</span>
                        </div>
                        <div className="artist-stat-box">
                          <span className="stat-label">Pending</span>
                          <span className={`stat-num ${artist.pendingCount > 0 ? "alert" : "neutral"}`}>
                            {artist.pendingCount}
                          </span>
                        </div>
                        <div className="artist-stat-box">
                          <span className="stat-label">Total Work</span>
                          <span className="stat-num">{artist.photos.length}</span>
                        </div>
                      </div>

                      {artist.categories.size > 0 && (
                        <div className="artist-categories-row">
                          <span className="artist-cat-label">Curated Themes:</span>
                          <div className="artist-cat-chips">
                            {Array.from(artist.categories).slice(0, 3).map((cat) => (
                              <span key={cat} className="artist-cat-chip">
                                {cat}
                              </span>
                            ))}
                            {artist.categories.size > 3 && (
                              <span className="artist-cat-chip more">
                                +{artist.categories.size - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Photo preview reel */}
                      <div className="artist-photo-reel">
                        {artist.photos.slice(0, 4).map((p) => (
                          <div
                            key={p.id}
                            className="reel-thumb-container"
                            onClick={() => setActiveModalPhoto(p)}
                            title={`Inspect ${p.title}`}
                          >
                            <img src={p.url} alt={p.title} className="reel-thumb-img" loading="lazy" />
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectArtist(artist.name)}
                        className="btn-browse-artist"
                        title={`Browse all photos by ${artist.name}`}
                      >
                        <span>Browse Artist Photos ({artist.photos.length})</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ----------------- VIEW 4: INDIAN THEMES MATRIX ----------------- */}
        {activeTab === "themes" && (
          <section className="admin-themes-section" aria-label="Curated Indian Themes Matrix">
            <div className="section-intro-bar">
              <div>
                <h2 className="section-intro-title">Curated Indian Photography Themes &amp; Categories</h2>
                <p className="section-intro-desc">
                  Explore fine-art photographs structured across India's sacred heritage, majestic monuments, and breathtaking wild landscapes.
                </p>
              </div>
              <span className="section-count-badge">{filteredThemes.length} Curated Themes</span>
            </div>

            {filteredThemes.length === 0 ? (
              <div className="admin-empty-queue">
                <h3 className="empty-queue-title">No Themes Found</h3>
                <p className="empty-queue-desc">No categories match your search query "{searchQuery}".</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="admin-action-btn secondary"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="admin-themes-grid">
                {filteredThemes.map((theme) => (
                  <article key={theme.name} className="admin-theme-card">
                    <div
                      className="theme-cover-container"
                      onClick={() => handleSelectTheme(theme.name)}
                      title={`Explore ${theme.name}`}
                    >
                      {theme.samplePhoto ? (
                        <img
                          src={theme.samplePhoto.url}
                          alt={theme.name}
                          className="theme-cover-image"
                          loading="lazy"
                        />
                      ) : (
                        <div className="theme-cover-placeholder">
                          <span className="theme-placeholder-icon">{theme.icon}</span>
                        </div>
                      )}
                      <div className="theme-cover-gradient" />
                      <div className="theme-cover-badge">
                        <span className="theme-icon">{theme.icon}</span>
                        <span className="theme-title-overlay">{theme.name}</span>
                      </div>
                      <span className="theme-count-chip">
                        {theme.approvedCount} {theme.approvedCount === 1 ? "Photo" : "Photos"}
                      </span>
                    </div>

                    <div className="theme-body">
                      <p className="theme-description">{theme.description}</p>

                      <div className="theme-meta-stats">
                        <div className="theme-meta-item">
                          <span className="meta-dot live" />
                          <span>{theme.approvedCount} Live Published</span>
                        </div>
                        {theme.pendingCount > 0 && (
                          <div className="theme-meta-item">
                            <span className="meta-dot alert" />
                            <span style={{ color: "#fbbf24" }}>{theme.pendingCount} Pending Review</span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectTheme(theme.name)}
                        className="btn-browse-theme"
                        title={`View ${theme.name} photos in gallery archive`}
                      >
                        <span>Explore Theme Archive</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Cinematic Detail Inspection Modal */}
      {activeModalPhoto && (
        <PhotoDetailModal
          photo={activeModalPhoto}
          photos={allPhotos}
          onClose={() => setActiveModalPhoto(null)}
          onSelectPhoto={setActiveModalPhoto}
        />
      )}
    </main>
  );
};

export default AdminPanel;