import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="site-nav" aria-label="Main navigation">
      <Link to="/" className="site-brand" aria-label="Rohit Photostudio home">
        <span className="brand-mark" aria-hidden="true">
          <span className="brand-monogram"><span>R</span><span>P</span></span>
        </span>
        <span className="brand-copy">
          <span className="brand-name">Rohit Photostudio</span>
          <span className="brand-tagline">Photography · India</span>
        </span>
      </Link>

      <div className="site-nav-links">
        <Link to="/gallery" className="nav-link">Collection</Link>
        {user?.role === "admin" && <Link to="/admin" className="nav-action nav-admin">Admin</Link>}
        {user && <Link to="/profile" className="nav-link">Profile</Link>}
        {user && <Link to="/submit" className="nav-action">Submit photo</Link>}
        {user ? (
          <div className="nav-user-box">
            <span className="nav-avatar" aria-hidden="true">{user.username.charAt(0).toUpperCase()}</span>
            <span className="nav-user-meta">
              <span className="nav-username">{user.fullName || user.username}</span>
              <span className="nav-role">{user.role === "admin" ? "Administrator" : "Contributor"}</span>
            </span>
            <button className="nav-logout" onClick={() => { logout(); navigate("/"); }}>Log out</button>
          </div>
        ) : (
          <div className="nav-auth">
            <Link to="/login" className="nav-link">Sign in</Link>
            <Link to="/register" className="nav-action">Join the collection</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;