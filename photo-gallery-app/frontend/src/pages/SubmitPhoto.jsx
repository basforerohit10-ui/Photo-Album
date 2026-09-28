import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SubmitPhoto = ({ onSubmitPhoto }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [uploadType, setUploadType] = useState("file"); // "file" | "url"
  const [form, setForm] = useState({
    title: "",
    category: "Nature",
    url: "",
    description: "",
    location: "",
    camera: "",
    tags: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    if (event.target.name === "url") {
      setImagePreview(event.target.value);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file (JPG, PNG, WebP, etc.).");
      setIsSuccess(false);
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setMessage("Image file size is too large. Please choose an image under 20MB.");
      setIsSuccess(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result;
      setForm((prev) => ({ ...prev, url: base64Data }));
      setImagePreview(base64Data);
      setMessage("");
    };
    reader.onerror = () => {
      setMessage("Failed to read image file. Please try again.");
      setIsSuccess(false);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setForm((prev) => ({ ...prev, url: "" }));
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!user) {
      setMessage("Please log in before submitting a photo.");
      setIsSuccess(false);
      return;
    }

    if (!form.title?.trim() || !form.url?.trim()) {
      setMessage("Please provide a photo title and choose or enter an image.");
      setIsSuccess(false);
      return;
    }

    const payload = {
      title: form.title.trim(),
      category: form.category,
      url: form.url.trim(),
      author: user.fullName || user.username || "Photographer",
      submittedBy: user.username,
      description: form.description?.trim() || "",
      location: form.location?.trim() || "",
      camera: form.camera?.trim() || "",
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    };

    setLoading(true);
    try {
      await onSubmitPhoto(payload);
      setIsSuccess(true);
      const isUserAdmin = user.role === "admin";
      setMessage(
        isUserAdmin
          ? "✓ Photo published directly to the live gallery!"
          : "✓ Photo submitted successfully! It is now in the review queue for admin approval."
      );
      setForm({ title: "", category: "Nature", url: "", description: "", location: "", camera: "", tags: "" });
      setImagePreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      setTimeout(() => {
        navigate(isUserAdmin ? "/admin" : "/gallery");
      }, 1400);
    } catch (error) {
      setIsSuccess(false);
      setMessage(error.message || "Failed to submit photo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page} className="studio-submit-page">
      <div style={styles.container} className="studio-submit-layout">
        <aside className="studio-submit-aside">
          <span className="studio-aside-kicker">ROHIT PHOTOSTUDIO</span>
          <div>
            <h1>Every frame<br />has a story.</h1>
            <p>Choose a photograph that deserves a place in the collection.</p>
          </div>
          <span className="studio-aside-caption">SHARE YOUR PERSPECTIVE</span>
        </aside>
        <div style={styles.card} className="studio-submit-card">
          <div style={styles.header}>
            {user?.role === "admin" && (
              <span style={styles.adminBadge}>ADMIN DIRECT PUBLISH</span>
            )}
            <h2 style={styles.title}>Submit Photography</h2>
            <p style={styles.sub}>
              {user?.role === "admin"
                ? "Upload or link a photo. As an administrator, it will be published immediately to Rohit Photostudio."
                : "Submit your work for Rohit Photostudio. The admin will review and publish it."}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Photo Title *</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Misty Mountain Sunrise"
                value={form.title}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="Nature">Nature</option>
                <option value="Architecture">Architecture</option>
                <option value="Urban">Urban</option>
                <option value="Minimal">Minimal</option>
                <option value="Wildlife">Wildlife</option>
                <option value="Portrait">Portrait</option>
              </select>
            </div>

            {/* Photo Details / Story */}
            <div style={styles.field}>
              <label style={styles.label}>Photo Story &amp; Details (Kya chiz ka photo hai?)</label>
              <textarea
                name="description"
                placeholder="Photo ke baare mein bataiye: scene kaisa tha, kya chiz photo mein capture hui hai, lighting kaisi thi..."
                value={form.description}
                onChange={handleChange}
                rows={3}
                style={{ ...styles.input, height: "auto", resize: "vertical", padding: "0.75rem 1rem" }}
              />
            </div>

            {/* Location & Camera Device */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              <div style={styles.field}>
                <label style={styles.label}>Location (Kahan liya gaya?)</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Manali, Himachal or Tokyo, Japan"
                  value={form.location}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Camera / Phone</label>
                <input
                  type="text"
                  name="camera"
                  placeholder="e.g. Sony A7IV or iPhone 15 Pro"
                  value={form.camera}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Tags (Separate with commas)</label>
              <input
                type="text"
                name="tags"
                placeholder="e.g. Mountains, Sunset, Golden Hour"
                value={form.tags}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            {/* Upload Method Switcher */}
            <div style={styles.field}>
              <label style={styles.label}>Image Source</label>
              <div style={styles.uploadTabs}>
                <button
                  type="button"
                  onClick={() => setUploadType("file")}
                  style={{
                    ...styles.tabBtn,
                    ...(uploadType === "file" ? styles.tabBtnActive : {}),
                  }}
                >
                  📁 Upload from Device
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType("url")}
                  style={{
                    ...styles.tabBtn,
                    ...(uploadType === "url" ? styles.tabBtnActive : {}),
                  }}
                >
                  🔗 Image URL Link
                </button>
              </div>
            </div>

            {uploadType === "file" ? (
              <div style={styles.field}>
                <label style={styles.label}>Select Image File *</label>
                <div
                  style={styles.dropZone}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span style={styles.dropIcon}>📸</span>
                  <span style={styles.dropText}>Click to browse and choose a photo</span>
                  <span style={styles.dropSub}>JPG, PNG, WebP supported</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>
            ) : (
              <div style={styles.field}>
                <label style={styles.label}>Image Web URL *</label>
                <input
                  type="url"
                  name="url"
                  placeholder="https://images.unsplash.com/... or web image link"
                  value={form.url}
                  onChange={handleChange}
                  required={uploadType === "url"}
                  style={styles.input}
                />
              </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
              <div style={styles.previewBox}>
                <div style={styles.previewHeader}>
                  <span style={styles.previewLabel}>Photo Preview</span>
                  <button
                    type="button"
                    onClick={handleClearImage}
                    style={styles.clearBtn}
                  >
                    ✕ Remove
                  </button>
                </div>
                <img
                  src={imagePreview}
                  alt="Submission preview"
                  style={styles.previewImg}
                  onError={() => {
                    setMessage("Unable to load image from URL. Please check the link.");
                    setIsSuccess(false);
                  }}
                />
              </div>
            )}

            {message && (
              <p style={isSuccess ? styles.successMsg : styles.errorMsg}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                ...(user?.role === "admin" ? styles.adminSubmitBtn : {}),
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Submitting..."
                : user?.role === "admin"
                ? "⚡ Publish Photo Directly"
                : "Submit for Approval"}
            </button>
          </form>

          <div style={styles.footerNote}>
            <Link to="/gallery" style={styles.backLink}>
              ← Back to Gallery
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    position: "relative",
    minHeight: "calc(100vh - 72px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
    background: "transparent",
  },
  container: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: "1rem 0",
  },
  card: {
    maxWidth: "520px",
    width: "100%",
    padding: "2.4rem",
    borderRadius: "20px",
    background: "rgba(15, 23, 42, 0.78)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  },
  header: {
    marginBottom: "1.6rem",
  },
  adminBadge: {
    display: "inline-block",
    background: "rgba(245, 158, 11, 0.2)",
    border: "1px solid rgba(245, 158, 11, 0.45)",
    color: "#fbbf24",
    fontSize: "0.65rem",
    fontWeight: "800",
    letterSpacing: "0.08em",
    padding: "0.2rem 0.6rem",
    borderRadius: "20px",
    marginBottom: "0.6rem",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: "800",
    color: "#fff",
    margin: "0 0 0.35rem 0",
    letterSpacing: "-0.5px",
  },
  sub: {
    color: "#cbd5e1",
    fontSize: "0.86rem",
    margin: 0,
    lineHeight: "1.4",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.2rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.45rem",
  },
  label: {
    fontSize: "0.82rem",
    color: "#e2e8f0",
    fontWeight: "600",
  },
  input: {
    background: "rgba(255, 255, 255, 0.07)",
    border: "1px solid rgba(255, 255, 255, 0.14)",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    color: "#fff",
    outline: "none",
    fontSize: "0.9rem",
  },
  select: {
    background: "rgba(15, 23, 42, 0.95)",
    border: "1px solid rgba(255, 255, 255, 0.14)",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    color: "#fff",
    outline: "none",
    fontSize: "0.9rem",
  },
  uploadTabs: {
    display: "flex",
    gap: "0.4rem",
    background: "rgba(255, 255, 255, 0.05)",
    padding: "0.25rem",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  tabBtn: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    padding: "0.55rem",
    borderRadius: "8px",
    fontSize: "0.78rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  tabBtnActive: {
    background: "rgba(255, 255, 255, 0.15)",
    color: "#fff",
  },
  dropZone: {
    border: "2px dashed rgba(255, 255, 255, 0.22)",
    borderRadius: "12px",
    padding: "1.4rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.3rem",
    cursor: "pointer",
    background: "rgba(255, 255, 255, 0.03)",
    transition: "all 0.2s ease",
  },
  dropIcon: {
    fontSize: "1.8rem",
  },
  dropText: {
    fontSize: "0.85rem",
    color: "#e2e8f0",
    fontWeight: "600",
  },
  dropSub: {
    fontSize: "0.72rem",
    color: "#94a3b8",
  },
  previewBox: {
    background: "rgba(0, 0, 0, 0.35)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    padding: "0.8rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
  },
  previewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewLabel: {
    fontSize: "0.75rem",
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  clearBtn: {
    background: "rgba(239, 68, 68, 0.2)",
    border: "1px solid rgba(239, 68, 68, 0.4)",
    color: "#fca5a5",
    padding: "0.2rem 0.5rem",
    borderRadius: "6px",
    fontSize: "0.7rem",
    cursor: "pointer",
    fontWeight: "600",
  },
  previewImg: {
    width: "100%",
    maxHeight: "220px",
    objectFit: "cover",
    borderRadius: "8px",
  },
  successMsg: {
    color: "#86efac",
    fontSize: "0.84rem",
    fontWeight: "600",
    margin: "-0.2rem 0",
    lineHeight: "1.3",
  },
  errorMsg: {
    color: "#fca5a5",
    fontSize: "0.84rem",
    margin: "-0.2rem 0",
    lineHeight: "1.3",
  },
  submitBtn: {
    background: "linear-gradient(135deg, #10b981, #34d399)",
    color: "#04110d",
    border: "none",
    padding: "0.85rem",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "0.92rem",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(16, 185, 129, 0.3)",
    transition: "transform 0.1s ease, box-shadow 0.2s ease",
  },
  adminSubmitBtn: {
    background: "linear-gradient(135deg, #f59e0b, #ef4444)",
    color: "#fff",
    boxShadow: "0 8px 20px rgba(245, 158, 11, 0.3)",
  },
  footerNote: {
    marginTop: "1.4rem",
    textAlign: "center",
  },
  backLink: {
    color: "#cbd5e1",
    fontSize: "0.82rem",
    textDecoration: "none",
    fontWeight: "600",
  },
};

export default SubmitPhoto;
