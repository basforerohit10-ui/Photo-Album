import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./SiteFooter.css";

const SiteFooter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setIsSubscribed(true);
    setEmail("");
    setTimeout(() => {
      setIsSubscribed(false);
    }, 5000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="site-footer-luxury">
      <div className="footer-ambient-glow" aria-hidden="true" />

      {/* 1. Curatorial Dispatch & Newsletter Banner */}
      <section className="footer-newsletter-banner" aria-label="Subscribe to studio dispatches">
        <div className="footer-newsletter-copy">
          <span className="footer-newsletter-badge">
            <span>✨</span> Curatorial Dispatch
          </span>
          <h3>Stay in the passing light.</h3>
          <p>
            Receive periodic collections, photographer spotlights, and exhibition release notes straight from Rohit Photostudio.
          </p>
        </div>

        {isSubscribed ? (
          <div className="footer-subscribe-success" role="status">
            <span>✓</span> Thank you! You are now subscribed to the Studio Dispatch.
          </div>
        ) : (
          <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email address..."
              aria-label="Email for studio dispatch"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="footer-newsletter-input"
              required
            />
            <button type="submit" className="footer-newsletter-btn">
              Subscribe ↗
            </button>
          </form>
        )}
      </section>

      {/* 2. Main 4-Column Footer Content */}
      <div className="footer-main-grid">
        {/* Column 1: Brand & Philosophy */}
        <div className="footer-col footer-col-brand">
          <Link to="/" className="footer-brand-header" onClick={scrollToTop} aria-label="Rohit Photostudio home">
            <span className="brand-mark" aria-hidden="true">
              <span className="brand-monogram"><span>R</span><span>P</span></span>
            </span>
            <span className="brand-copy">
              <span className="footer-brand-title">Rohit Photostudio</span>
              <span className="brand-tagline">Fine Art Photography Archive</span>
            </span>
          </Link>

          <p className="footer-brand-desc">
            An independent visual archive celebrating the timeless heritage, sacred temples, natural wonders, and vibrant landscapes of Incredible India.
          </p>

          <div className="footer-status-pill">
            <span className="pulse-dot" />
            <span>Archive Live &amp; Accepting Submissions</span>
          </div>

          <span className="footer-location-tag">
            📍 Studio &amp; Archive • Curated by Rohit
          </span>
        </div>

        {/* Column 2: Collections & Themes */}
        <div className="footer-col">
          <h4>Collections</h4>
          <ul className="footer-nav-list">
            <li>
              <Link to="/gallery" onClick={scrollToTop}>
                <span>🛕 Temples &amp; Spiritual</span>
              </Link>
            </li>
            <li>
              <Link to="/gallery" onClick={scrollToTop}>
                <span>🏰 Famous Monuments</span>
              </Link>
            </li>
            <li>
              <Link to="/gallery" onClick={scrollToTop}>
                <span>🌿 Indian Nature</span>
              </Link>
            </li>
            <li>
              <Link to="/gallery" onClick={scrollToTop}>
                <span>🏔️ Himalayas &amp; Deserts</span>
              </Link>
            </li>
            <li>
              <Link to="/gallery" onClick={scrollToTop}>
                <span>🐅 Wildlife of India</span>
              </Link>
            </li>
            <li>
              <Link to="/gallery" onClick={scrollToTop}>
                <span>🪔 Culture &amp; Ghats</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Creators & Community */}
        <div className="footer-col">
          <h4>Creators</h4>
          <ul className="footer-nav-list">
            <li>
              <Link to={user ? "/submit" : "/login"}>
                <span>Submit a Photograph</span>
                <span className="footer-badge-hint">CONTRIBUTE</span>
              </Link>
            </li>
            <li>
              <Link to="/gallery" onClick={scrollToTop}>
                <span>Browse Exhibition</span>
              </Link>
            </li>
            {user ? (
              <>
                <li>
                  <Link to="/profile">My Uploads &amp; Profile</Link>
                </li>
                {user.role === "admin" && (
                  <li>
                    <Link to="/admin">
                      <span>Admin Review Panel</span>
                      <span className="footer-badge-hint">STAFF</span>
                    </Link>
                  </li>
                )}
              </>
            ) : (
              <>
                <li>
                  <Link to="/login">Sign In to Account</Link>
                </li>
                <li>
                  <Link to="/register">Join as a Creator</Link>
                </li>
              </>
            )}
            <li>
              <a
                href="#top"
                onClick={(e) => {
                  e.preventDefault();
                  const searchInput = document.getElementById("gallery-search-input");
                  if (searchInput) {
                    searchInput.focus();
                    searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
                  } else {
                    navigate("/gallery");
                  }
                }}
              >
                <span>Search Archive</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Fine-Art Specs & EXIF Standards */}
        <div className="footer-col">
          <h4>Exhibition Standards</h4>
          <div className="footer-specs-box">
            <div className="footer-spec-item">
              <span>Display Calibration</span>
              <strong>sRGB / DCI-P3</strong>
            </div>
            <div className="footer-spec-item">
              <span>EXIF Metadata</span>
              <strong>100% Verified</strong>
            </div>
            <div className="footer-spec-item">
              <span>Resolution Quality</span>
              <strong>Ultra-HD Raw</strong>
            </div>
            <div className="footer-spec-item">
              <span>Licensing</span>
              <strong>Fine-Art Portfolio</strong>
            </div>

            <div className="footer-shortcut-hint">
              <span>Quick Search Hotkey</span>
              <kbd>/</kbd>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Inspirational Photography Quote */}
      <div className="footer-quote-strip">
        <blockquote className="footer-quote">
          &ldquo;To photograph is to hold one&rsquo;s breath, when all faculties converge to face fleeing reality.&rdquo;
          <cite>— Henri Cartier-Bresson</cite>
        </blockquote>
      </div>

      {/* 4. Bottom Legal & Social Bar */}
      <div className="footer-bottom-bar">
        <div className="footer-social-links">
          <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Unsplash</a>
          <span>•</span>
          <a href="https://www.instagram.com/rohit_basfore_45/" target="_blank" rel="noopener noreferrer">Instagram</a>
          <span>•</span>
          <a href="https://500px.com" target="_blank" rel="noopener noreferrer">500px</a>
          <span>•</span>
          <a href="https://x.com/basforerohit200" target="_blank" rel="noopener noreferrer">Twitter / X</a>
          <span>•</span>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>

        <span>
          © {new Date().getFullYear()} <strong>Rohit Photostudio</strong>. Handcrafted with passion for visual storytellers.
        </span>

        <button type="button" className="footer-back-to-top" onClick={scrollToTop} aria-label="Scroll back to top">
          <span>Back to top</span>
          <span aria-hidden="true">↑</span>
        </button>
      </div>
    </footer>
  );
};

export default SiteFooter;