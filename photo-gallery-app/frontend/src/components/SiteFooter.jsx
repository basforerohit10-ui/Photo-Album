import React from "react";
import { Link } from "react-router-dom";

const SiteFooter = () => (
  <footer className="site-footer">
    <div className="footer-brand-block">
      <Link className="footer-brand" to="/">Rohit Photostudio</Link>
      <p>Stories told through photographs.</p>
    </div>
    <nav className="footer-links" aria-label="Footer navigation">
      <Link to="/#collection">Collection</Link>
      <Link to="/login">Sign in</Link>
      <Link to="/register">Join the gallery</Link>
    </nav>
    <p className="footer-credit">Sample photographs are from Unsplash. Use your own or properly licensed images for your portfolio.</p>
    <span className="footer-copyright">© {new Date().getFullYear()} Rohit Photostudio</span>
  </footer>
);

export default SiteFooter;