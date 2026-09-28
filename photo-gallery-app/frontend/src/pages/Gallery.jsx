import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhotoCard from "../components/PhotoCard";
import { useAuth } from "../context/AuthContext";

const Gallery = ({ photos, setPhotos, onDeletePhoto }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [activeModalPhoto, setActiveModalPhoto] = useState(null);

  const categories = ["All", ...new Set(photos.map((photo) => photo.category))];
  const contributorCount = new Set(photos.filter((photo) => photo.submittedBy).map((photo) => photo.submittedBy)).size;
  const myContributionCount = user ? photos.filter((photo) => photo.submittedBy === user.username).length : 0;

  const handleToggleFavorite = (id) => {
    setPhotos((prev) =>
      prev.map((photo) =>
        photo.id === id ? { ...photo, isFavorite: !photo.isFavorite } : photo
      )
    );
  };

  const filteredPhotos = photos
    .filter((photo) => selectedCategory === "All" || photo.category === selectedCategory)
    .filter((photo) => !onlyFavorites || photo.isFavorite)
    .filter((photo) => `${photo.title} ${photo.author} ${photo.category}`.toLowerCase().includes(searchTerm.toLowerCase()));
  const relatedPhotos = activeModalPhoto
    ? photos.filter((photo) => photo.id !== activeModalPhoto.id && photo.category === activeModalPhoto.category).slice(0, 6)
    : [];

  return (
    <main className="gallery-page" id="top">
      <section className="gallery-hero">
        <div className="gallery-hero-copy">
          <p className="eyebrow"><span className="eyebrow-mark" /> Photography by Rohit</p>
          <h1>Places, people<br />and <em>passing light.</em></h1>
          <p className="gallery-hero-intro">A personal collection of photographs from near and far.</p>
          <a className="hero-link" href="#collection">View the photographs <span aria-hidden="true">↘</span></a>
        </div>
        <div className="gallery-hero-image" role="img" aria-label="Sunlight falling across a mountain lake">
          <span className="hero-image-note">LANDSCAPE PHOTOGRAPHY</span>
        </div>
      </section>

      <section className="collection-section" id="collection">
        <div className="collection-heading">
          <div>
            <p className="eyebrow">The portfolio</p>
            <h2>Recent <em>photographs</em></h2>
          </div>
          <p className="collection-count"><strong>{photos.length.toString().padStart(2, "0")}</strong> photographs<br />from <strong>{contributorCount.toString().padStart(2, "0")}</strong> contributors</p>
        </div>

        <div className="gallery-toolbar">
          <label className="gallery-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Find a photograph"
              aria-label="Search photographs by title, creator, or category"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
          <div className="gallery-toolbar-actions">
            {user && <span className="contribution-note">Your photographs: {myContributionCount}</span>}
            {user && <button className="text-action" onClick={() => navigate("/submit")}>Submit a photograph <span aria-hidden="true">↗</span></button>}
            <button className={`favorite-filter${onlyFavorites ? " is-active" : ""}`} onClick={() => setOnlyFavorites(!onlyFavorites)} aria-pressed={onlyFavorites}>
              <span aria-hidden="true">{onlyFavorites ? "♥" : "♡"}</span> Favorites
            </button>
          </div>
        </div>

        <div className="category-list" aria-label="Filter by category">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-filter${selectedCategory === category ? " is-active" : ""}`}
              onClick={() => setSelectedCategory(category)}
              aria-pressed={selectedCategory === category}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="photo-grid">
          {filteredPhotos.length > 0 ? filteredPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onToggleFavorite={handleToggleFavorite}
              onDelete={() => onDeletePhoto(photo)}
              isAdmin={user?.role === "admin"}
              onOpenModal={setActiveModalPhoto}
            />
          )) : (
            <p className="gallery-empty">No photographs match those filters.</p>
          )}
        </div>
      </section>

      {activeModalPhoto && (
        <div className="photo-modal" onClick={() => setActiveModalPhoto(null)}>
          <div className="photo-modal-content" role="dialog" aria-modal="true" aria-label={activeModalPhoto.title} onClick={(event) => event.stopPropagation()}>
            <img src={activeModalPhoto.url} alt={activeModalPhoto.title} />
            <div className="photo-modal-meta">
              <div><h3>{activeModalPhoto.title}</h3><p>Photograph by {activeModalPhoto.author || "Creator"}</p></div>
              <span>{activeModalPhoto.category}</span>
            </div>
            {relatedPhotos.length > 0 && (
              <section className="related-photos" aria-label={`More ${activeModalPhoto.category} photographs`}>
                <h4>More from {activeModalPhoto.category}</h4>
                <div className="related-photo-list">
                  {relatedPhotos.map((photo) => (
                    <button key={photo.id} className="related-photo" onClick={() => setActiveModalPhoto(photo)} aria-label={`View ${photo.title}`}>
                      <img src={photo.url} alt="" loading="lazy" />
                      <span>{photo.title}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}
            <button className="photo-modal-close" onClick={() => setActiveModalPhoto(null)} aria-label="Close photograph">×</button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Gallery;