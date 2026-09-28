import React from "react";
import { Link } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => {
  return (
    <div className="notfound-page">
      <div className="notfound-backdrop" aria-hidden="true" />
      <div className="notfound-card">
        <span className="notfound-code-badge">404</span>
        <div className="notfound-status">
          <span className="notfound-status-dot" />
          Negative Not Found
        </div>
        <h1 className="notfound-title">Lost Frame in the Archive</h1>
        <p className="notfound-desc">
          The photograph or exhibit you requested has either been relocated,
          unexposed, or exists solely in imagination.
        </p>
        <div className="notfound-actions">
          <Link to="/gallery" className="notfound-btn-primary">
            Explore Collection Archive →
          </Link>
          <Link to="/" className="notfound-btn-secondary">
            Return to Studio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
