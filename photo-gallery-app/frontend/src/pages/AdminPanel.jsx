import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import PhotoDetailModal from "../components/PhotoDetailModal";
import "./AdminPanel.css";

const CATEGORIES = [
  "All",
  "Temples & Spiritual",
  "Famous Monuments",
  "Nature & Wildlife",
  "Indian Culture & Street",
  "Royal Palaces",
];

const AdminPanel = ({ photos = [], pendingPhotos = [], onApprovePhoto, onDeletePhoto }) => {
  const [activeModalPhoto, setActiveModalPhoto] = useState(null);
  const [activeTab, setActiveTab] = useState(pendingPhotos.length > 0 ? "pending" : "approved");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const approvedPhotos = photos;

  // Compute metrics
  const contributorCount = useMemo(() => {
    return new Set(
      approvedPhotos
        .filter((photo) => photo.submittedBy)
        .map((photo) => photo.submittedBy.toLowerCase())
    ).size;
  }, [approvedPhotos]);

  const uniqueCategoriesCount = useMemo(() => {
    return new Set(
      approvedPhotos
        .filter((p) => p.category)
        .map((p) => p.category)
    ).size;
  }, [approvedPhotos]);

  // Current active list
  const currentList = activeTab === "pending" ? pendingPhotos : approvedPhotos;

  // Filtered list by search & category
  const filteredPhotos = useMemo(() => {
    return currentList.filter((photo) => {
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
  }, [currentList, selectedCategory, searchQuery]);

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
              Review artist submissions, approve pending fine-art photography, and manage public archive content.
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

        {/* Studio Metrics Grid */}
        <section className="admin-metrics-grid" aria-label="Studio Statistics">
          <div className={`admin-metric-card ${pendingPhotos.length > 0 ? "alert" : "success"}`}>
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
          </div>

          <div className="admin-metric-card accent">
            <div className="metric-top">
              <span className="metric-label">Live Archive</span>
              <span className="metric-pill success">Published</span>
            </div>
            <div className="metric-value">{approvedPhotos.length}</div>
            <p className="metric-caption">Fine-art photographs in public gallery</p>
          </div>

          <div className="admin-metric-card neutral">
            <div className="metric-top">
              <span className="metric-label">Contributing Artists</span>
              <span className="metric-pill neutral">Active</span>
            </div>
            <div className="metric-value">{contributorCount}</div>
            <p className="metric-caption">Unique contributors to the archive</p>
          </div>

          <div className="admin-metric-card neutral">
            <div className="metric-top">
              <span className="metric-label">Indian Themes</span>
              <span className="metric-pill neutral">Curated</span>
            </div>
            <div className="metric-value">{uniqueCategoriesCount}</div>
            <p className="metric-caption">Heritage, spiritual, and nature themes</p>
          </div>
        </section>

        {/* Tab Selection & Search Bar */}
        <section className="admin-controls-bar">
          <div className="admin-tabs-nav" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "pending"}
              onClick={() => setActiveTab("pending")}
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
              onClick={() => setActiveTab("approved")}
              className={`admin-tab-toggle ${activeTab === "approved" ? "active" : ""}`}
            >
              <span>Live Gallery Archive</span>
              <span className="tab-badge neutral">{approvedPhotos.length}</span>
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
              placeholder={`Search ${activeTab === "pending" ? "pending submissions" : "live archive"} by title, artist, location...`}
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

        {/* Category Filter Pills */}
        <div className="admin-category-filters" role="group" aria-label="Filter by Category">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`admin-category-pill ${selectedCategory === cat ? "active" : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Submissions / Photos Grid */}
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
      </div>

      {/* Cinematic Detail Inspection Modal */}
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

export default AdminPanel;