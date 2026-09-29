import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import PhotoDetailModal from "../components/PhotoDetailModal";
import "./Profile.css";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [photoError, setPhotoError] = useState("");
  const [activeModalPhoto, setActiveModalPhoto] = useState(null);
  const [filterTab, setFilterTab] = useState("all");
  const [pendingStudioQueueCount, setPendingStudioQueueCount] = useState(0);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!user?.token) return;

    // Fetch user's own submissions
    api.getMyPhotos(user.token)
      .then(setPhotos)
      .catch((error) => setPhotoError(error.message))
      .finally(() => setLoadingPhotos(false));

    // If Admin, also fetch the studio-wide pending reviews queue count
    if (isAdmin) {
      api.getPendingPhotos(user.token)
        .then((pending) => {
          if (Array.isArray(pending)) {
            setPendingStudioQueueCount(pending.length);
          }
        })
        .catch(() => {});
    }
  }, [user, isAdmin]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/gallery");
    }
  };

  // Metrics computation
  const totalSubmissions = photos.length;

  const approvedPhotos = useMemo(() => {
    return photos.filter((p) => p.status === "approved" || p.isApproved !== false);
  }, [photos]);

  const pendingPhotos = useMemo(() => {
    return photos.filter((p) => p.status === "pending" || p.isApproved === false);
  }, [photos]);

  const uniqueCategoriesCount = useMemo(() => {
    return new Set(photos.filter((p) => p.category).map((p) => p.category)).size;
  }, [photos]);

  // Tab filtering
  const displayedPhotos = useMemo(() => {
    if (filterTab === "approved") return approvedPhotos;
    if (filterTab === "pending") return pendingPhotos;
    return photos;
  }, [filterTab, photos, approvedPhotos, pendingPhotos]);

  const initialLetter = (user?.fullName || user?.username || "A").charAt(0).toUpperCase();

  return (
    <main className="studio-profile-page">
      <div className="studio-profile-container">
        {/* Top Bar with Return Navigation */}
        <div className="profile-top-bar">
          <button type="button" onClick={handleBack} className="profile-back-btn" title="Return to previous page">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Return to Studio Gallery</span>
          </button>

          <div className="profile-auth-status">
            <span className="auth-live-dot" />
            <span>Active Session · {isAdmin ? "Master Administrator" : "Verified Contributor"}</span>
          </div>
        </div>

        {/* Hero Identity Card (Distinctive for Admin vs Contributor) */}
        <section className={`profile-hero-card ${isAdmin ? "admin-hero" : "contributor-hero"}`}>
          <div className="profile-hero-main">
            <div className="profile-avatar-wrapper">
              <div className={`profile-avatar-circle ${isAdmin ? "admin-avatar" : "contributor-avatar"}`}>
                {initialLetter}
              </div>
              <div className="avatar-role-badge" title={isAdmin ? "Studio Administrator" : "Contributing Photographer"}>
                {isAdmin ? "👑" : "📷"}
              </div>
            </div>

            <div className="profile-identity-content">
              <span className={`profile-kicker-badge ${isAdmin ? "admin-kicker" : "contributor-kicker"}`}>
                {isAdmin ? "ROHIT PHOTOSTUDIO · MASTER CURATOR & ADMINISTRATOR" : "INCREDIBLE INDIA · CONTRIBUTING ARTIST"}
              </span>

              <h1 className="profile-full-name">{user?.fullName || user?.username}</h1>

              <div className="profile-sub-identity">
                <span className="profile-username-tag">@{user?.username}</span>
                <span className={`profile-role-pill ${isAdmin ? "admin" : "contributor"}`}>
                  {isAdmin ? "★ Master Administrator" : "● Contributing Photographer"}
                </span>
              </div>

              <p className="profile-bio-desc">
                {isAdmin
                  ? "Full administrative authority over Rohit Photostudio: curatorial review queue management, direct fine-art publishing, archive moderation, and studio governance."
                  : "Verified studio contributor sharing the divine heritage, sacred temples, and majestic natural landscapes of India with art enthusiasts worldwide."}
              </p>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="profile-actions-row">
            {isAdmin ? (
              <>
                <Link to="/admin" className="profile-btn primary" title="Open the studio curation and review console">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  <span>Curatorial Console ↗</span>
                </Link>

                <Link to="/submit" className="profile-btn secondary" title="Directly publish a fine-art photo">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>Submit Direct Photo</span>
                </Link>

                <Link to="/admin/register" className="profile-btn secondary" title="Register an additional admin">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                  <span>Add Administrator</span>
                </Link>

                <Link to="/gallery" className="profile-btn secondary" title="Explore live public gallery">
                  <span>Browse Live Gallery ↗</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/submit" className="profile-btn primary" title="Submit a new photograph for curation">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>Submit New Photograph</span>
                </Link>

                <Link to="/gallery" className="profile-btn secondary" title="Browse the live collection">
                  <span>Explore Public Archive ↗</span>
                </Link>
              </>
            )}

            <button type="button" onClick={handleLogout} className="profile-btn danger" title="End your session">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </section>

        {/* Studio Metrics Row (Adaptive to Role) */}
        <section className="profile-metrics-grid" aria-label="Studio Metrics">
          {isAdmin ? (
            <>
              {/* Admin Metric 1: Studio Review Queue */}
              <div className={`profile-metric-card ${pendingStudioQueueCount > 0 ? "alert" : "success"}`}>
                <div className="profile-metric-top">
                  <span className="profile-metric-label">Studio Review Queue</span>
                  {pendingStudioQueueCount > 0 ? (
                    <span className="profile-metric-pill alert">● Action Needed</span>
                  ) : (
                    <span className="profile-metric-pill success">✓ All Clear</span>
                  )}
                </div>
                <div className="profile-metric-value">{pendingStudioQueueCount}</div>
                <p className="profile-metric-caption">
                  {pendingStudioQueueCount === 1
                    ? "1 submission awaiting your review"
                    : `${pendingStudioQueueCount} submissions awaiting your review`}
                </p>
                {pendingStudioQueueCount > 0 && (
                  <Link to="/admin" className="profile-metric-link">
                    Open Review Console →
                  </Link>
                )}
              </div>

              {/* Admin Metric 2: My Personal Submissions */}
              <div className="profile-metric-card accent">
                <div className="profile-metric-top">
                  <span className="profile-metric-label">My Submissions</span>
                  <span className="profile-metric-pill neutral">Uploaded</span>
                </div>
                <div className="profile-metric-value">{totalSubmissions}</div>
                <p className="profile-metric-caption">Direct fine-art uploads by you</p>
              </div>

              {/* Admin Metric 3: Live in Public Gallery */}
              <div className="profile-metric-card success">
                <div className="profile-metric-top">
                  <span className="profile-metric-label">Published &amp; Live</span>
                  <span className="profile-metric-pill success">Live</span>
                </div>
                <div className="profile-metric-value">{approvedPhotos.length}</div>
                <p className="profile-metric-caption">Active photographs in public gallery</p>
              </div>

              {/* Admin Metric 4: Studio Authority */}
              <div className="profile-metric-card neutral">
                <div className="profile-metric-top">
                  <span className="profile-metric-label">Clearance Tier</span>
                  <span className="profile-metric-pill neutral">Master</span>
                </div>
                <div className="profile-metric-value" style={{ fontSize: "28px", paddingTop: "8px" }}>
                  Tier-1 Admin
                </div>
                <p className="profile-metric-caption">Full moderation &amp; publishing rights</p>
              </div>
            </>
          ) : (
            <>
              {/* Contributor Metric 1: Total Submissions */}
              <div className="profile-metric-card accent">
                <div className="profile-metric-top">
                  <span className="profile-metric-label">Total Submissions</span>
                  <span className="profile-metric-pill neutral">Portfolio</span>
                </div>
                <div className="profile-metric-value">{totalSubmissions}</div>
                <p className="profile-metric-caption">Total photographs submitted to studio</p>
              </div>

              {/* Contributor Metric 2: Live Published */}
              <div className="profile-metric-card success">
                <div className="profile-metric-top">
                  <span className="profile-metric-label">Live in Gallery</span>
                  <span className="profile-metric-pill success">Published</span>
                </div>
                <div className="profile-metric-value">{approvedPhotos.length}</div>
                <p className="profile-metric-caption">Approved and featured in live gallery</p>
              </div>

              {/* Contributor Metric 3: Awaiting Review */}
              <div className={`profile-metric-card ${pendingPhotos.length > 0 ? "alert" : "neutral"}`}>
                <div className="profile-metric-top">
                  <span className="profile-metric-label">Pending Approval</span>
                  {pendingPhotos.length > 0 ? (
                    <span className="profile-metric-pill alert">● In Review</span>
                  ) : (
                    <span className="profile-metric-pill success">✓ All Reviewed</span>
                  )}
                </div>
                <div className="profile-metric-value">{pendingPhotos.length}</div>
                <p className="profile-metric-caption">Currently in curatorial queue</p>
              </div>

              {/* Contributor Metric 4: Categories Explored */}
              <div className="profile-metric-card neutral">
                <div className="profile-metric-top">
                  <span className="profile-metric-label">Themes Covered</span>
                  <span className="profile-metric-pill neutral">Curated</span>
                </div>
                <div className="profile-metric-value">{uniqueCategoriesCount}</div>
                <p className="profile-metric-caption">Heritage, spiritual, and nature themes</p>
              </div>
            </>
          )}
        </section>

        {/* Portfolio & Submissions Section */}
        <section className="profile-portfolio-card" aria-label="Personal Portfolio">
          <div className="portfolio-header-bar">
            <div className="portfolio-header-copy">
              <h2>{isAdmin ? "My Photographic Uploads" : "My Submissions & Portfolio"}</h2>
              <p>
                {isAdmin
                  ? "Fine-art captures and heritage photographs published by your administrator account."
                  : "Track the status of your submitted artwork and view high-resolution studio details."}
              </p>
            </div>

            <div className="portfolio-filter-tabs">
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={`portfolio-tab-btn ${filterTab === "all" ? "active" : ""}`}
              >
                <span>All Submissions</span>
                <span className="portfolio-tab-count">{totalSubmissions}</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterTab("approved")}
                className={`portfolio-tab-btn ${filterTab === "approved" ? "active" : ""}`}
              >
                <span>Published &amp; Live</span>
                <span className="portfolio-tab-count">{approvedPhotos.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterTab("pending")}
                className={`portfolio-tab-btn ${filterTab === "pending" ? "active" : ""}`}
              >
                <span>Pending Review</span>
                <span className="portfolio-tab-count">{pendingPhotos.length}</span>
              </button>
            </div>
          </div>

          {loadingPhotos && (
            <p style={{ textAlign: "center", color: "#9fa297", padding: "40px 0" }}>
              Loading your studio portfolio...
            </p>
          )}

          {photoError && (
            <p style={{ textAlign: "center", color: "#fca5a5", padding: "30px 0" }}>
              {photoError}
            </p>
          )}

          {!loadingPhotos && !photoError && displayedPhotos.length === 0 && (
            <div className="profile-empty-portfolio">
              <div className="profile-empty-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </div>
              <h3 className="profile-empty-title">
                {filterTab === "pending"
                  ? "No Submissions Awaiting Review"
                  : filterTab === "approved"
                  ? "No Live Photographs in Gallery Yet"
                  : "No Photographs Uploaded Yet"}
              </h3>
              <p className="profile-empty-desc">
                {filterTab === "pending"
                  ? "All your submissions have been curated and approved for the public gallery."
                  : "Share high-resolution captures of Indian monuments, sacred ghats, temples, and wilderness with Rohit Photostudio."}
              </p>
              <Link to="/submit" className="profile-btn primary" style={{ marginTop: "8px" }}>
                <span>+ Submit a Fine-Art Photograph</span>
              </Link>
            </div>
          )}

          {!loadingPhotos && displayedPhotos.length > 0 && (
            <div className="profile-photos-grid">
              {displayedPhotos.map((photo) => {
                const isApproved = photo.status === "approved" || photo.isApproved !== false;
                return (
                  <article
                    key={photo.id}
                    className="profile-photo-card"
                    onClick={() => setActiveModalPhoto(photo)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setActiveModalPhoto(photo);
                    }}
                    title="Click to inspect high-resolution details"
                  >
                    <div className="profile-photo-thumb-container">
                      <img src={photo.url} alt={photo.title} className="profile-photo-img" loading="lazy" />
                      <span className="profile-photo-category-tag">{photo.category || "General"}</span>
                      <span className={`profile-photo-status-tag ${isApproved ? "approved" : "pending"}`}>
                        {isApproved ? "✓ Live in Gallery" : "● In Review"}
                      </span>
                    </div>

                    <div className="profile-photo-body">
                      <h4 className="profile-photo-title">{photo.title}</h4>
                      <div className="profile-photo-meta">
                        {photo.location ? (
                          <span className="profile-photo-location">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#e0a18b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span>{photo.location}</span>
                          </span>
                        ) : (
                          <span>Studio Upload</span>
                        )}
                        <span style={{ color: "#777b70" }}>Inspect ↗</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Credentials & Security Information Drawer */}
        <section className="profile-credentials-card" aria-label="Account Credentials">
          <div className="credentials-header">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e0a18b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <h3>Account &amp; Studio Security Credentials</h3>
          </div>

          <div className="credentials-grid">
            <div className="credential-item">
              <span className="credential-label">Registered Username</span>
              <span className="credential-value">@{user?.username}</span>
            </div>

            <div className="credential-item">
              <span className="credential-label">Access Clearance</span>
              <span className="credential-value" style={{ color: isAdmin ? "#fbbf24" : "#e0a18b" }}>
                {isAdmin ? "Chief Studio Administrator" : "Verified Artist & Contributor"}
              </span>
            </div>

            <div className="credential-item">
              <span className="credential-label">Authentication Hash</span>
              <span className="credential-value">PBKDF2 Cryptographic Security</span>
            </div>

            <div className="credential-item">
              <span className="credential-label">Database Status</span>
              <span className="credential-value" style={{ color: "#34d399" }}>
                ● Connected to MongoDB Atlas
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Cinematic Detail Inspection Modal */}
      {activeModalPhoto && (
        <PhotoDetailModal
          photo={activeModalPhoto}
          photos={photos}
          onClose={() => setActiveModalPhoto(null)}
          onSelectPhoto={setActiveModalPhoto}
        />
      )}
    </main>
  );
};

export default Profile;
