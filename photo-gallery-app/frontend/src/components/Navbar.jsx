import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Track window scroll for elevated frosted glass depth
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside listener for user dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Escape key to close menus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsUserMenuOpen(false);
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const closeAllMenus = () => {
    setIsUserMenuOpen(false);
    setIsMobileOpen(false);
  };

  const handleLogout = () => {
    closeAllMenus();
    logout();
    navigate("/");
  };

  return (
    <header
      className={`site-nav-luxury ${isScrolled ? "is-scrolled" : ""}`}
      role="banner"
    >
      <div className="nav-container">
        {/* Brand identity & rotating aperture mark */}
        <Link
          to="/"
          className="nav-brand-link"
          aria-label="Rohit Photostudio Fine Art Archive home"
          onClick={closeAllMenus}
        >
          <span className="nav-brand-mark" aria-hidden="true">
            <span className="nav-brand-monogram">
              <span>R</span>
              <span>P</span>
            </span>
          </span>
          <span className="nav-brand-copy">
            <span className="nav-brand-name">Rohit Photostudio</span>
            <span className="nav-brand-tagline">
              <span className="nav-brand-live-dot" title="Archive Live"></span>
              Fine Art Archive · India
            </span>
          </span>
        </Link>

        {/* Desktop Navigation Links & User Capsule */}
        <nav className="nav-links-desktop" aria-label="Desktop primary navigation">
          <Link
            to="/gallery"
            className={`nav-link-item ${
              location.pathname === "/gallery" || location.pathname === "/"
                ? "is-active"
                : ""
            }`}
            onClick={closeAllMenus}
          >
            Collection
          </Link>

          {user?.role === "admin" && (
            <Link
              to="/admin"
              className={`nav-admin-badge-link ${
                location.pathname === "/admin" ? "is-active" : ""
              }`}
              onClick={closeAllMenus}
            >
              <span aria-hidden="true">⚡</span> Admin Panel
            </Link>
          )}

          {user && (
            <Link to="/submit" className="nav-cta-submit" onClick={closeAllMenus}>
              <span aria-hidden="true">+</span> Submit Photo
            </Link>
          )}

          {user ? (
            <div
              className={`nav-user-container ${isUserMenuOpen ? "is-open" : ""}`}
              ref={userMenuRef}
            >
              <button
                type="button"
                className="nav-user-pill-btn"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
                aria-label="User account dropdown"
              >
                <span className="nav-user-avatar" aria-hidden="true">
                  {user.username.charAt(0).toUpperCase()}
                </span>
                <span className="nav-user-details">
                  <span className="nav-user-name">
                    {user.fullName || user.username}
                  </span>
                  <span className="nav-user-badge">
                    {user.role === "admin" ? "Curator" : "Artist"}
                  </span>
                </span>
                <span className="nav-user-chevron" aria-hidden="true">▼</span>
              </button>

              {isUserMenuOpen && (
                <div className="nav-dropdown-menu" role="menu">
                  <div className="nav-dropdown-header">
                    <p className="nav-dropdown-user">
                      {user.fullName || user.username}
                    </p>
                    <p className="nav-dropdown-role">
                      {user.role === "admin"
                        ? "Studio Curator (Admin)"
                        : "Contributing Artist"}
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    className="nav-dropdown-item"
                    role="menuitem"
                    onClick={closeAllMenus}
                  >
                    <span aria-hidden="true">👤</span>
                    <span>My Portfolio & Profile</span>
                  </Link>

                  <Link
                    to="/submit"
                    className="nav-dropdown-item"
                    role="menuitem"
                    onClick={closeAllMenus}
                  >
                    <span aria-hidden="true">📷</span>
                    <span>Submit New Photograph</span>
                  </Link>

                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      className="nav-dropdown-item"
                      role="menuitem"
                      onClick={closeAllMenus}
                    >
                      <span aria-hidden="true">⚡</span>
                      <span>Archive Moderation</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    className="nav-dropdown-item nav-dropdown-logout"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    <span aria-hidden="true">🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-guest-group">
              <Link to="/login" className="nav-btn-signin" onClick={closeAllMenus}>
                Sign in
              </Link>
              <Link to="/register" className="nav-btn-join" onClick={closeAllMenus}>
                Join Archive
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className={`nav-mobile-toggle ${isMobileOpen ? "is-open" : ""}`}
          onClick={() => setIsMobileOpen((prev) => !prev)}
          aria-label={isMobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`nav-mobile-drawer ${isMobileOpen ? "is-open" : ""}`}
        aria-hidden={!isMobileOpen}
      >
        <Link to="/gallery" onClick={closeAllMenus}>
          <span>Collection Archive</span>
          <span>→</span>
        </Link>

        {user ? (
          <>
            <Link to="/profile" onClick={closeAllMenus}>
              <span>My Portfolio ({user.fullName || user.username})</span>
              <span>👤</span>
            </Link>

            <Link
              to="/submit"
              className="nav-cta-submit"
              onClick={closeAllMenus}
            >
              <span>+ Submit Photograph</span>
            </Link>

            {user.role === "admin" && (
              <Link to="/admin" onClick={closeAllMenus}>
                <span>⚡ Admin Moderation</span>
                <span>→</span>
              </Link>
            )}

            <button
              type="button"
              onClick={handleLogout}
              style={{ color: "#fca5a5" }}
            >
              <span>Sign Out</span>
              <span>🚪</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={closeAllMenus}>
              <span>Sign in</span>
              <span>→</span>
            </Link>
            <Link
              to="/register"
              className="nav-cta-submit"
              onClick={closeAllMenus}
            >
              <span>Join the Archive</span>
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;