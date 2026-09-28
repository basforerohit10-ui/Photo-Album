import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import SiteFooter from "./components/SiteFooter";
import Gallery from "./pages/Gallery";
import AdminPanel from "./pages/AdminPanel";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SubmitPhoto from "./pages/SubmitPhoto";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import { api } from "./api";
import { useAuth } from "./context/AuthContext";

const INITIAL_PHOTOS = [
  {
    id: 1,
    title: "Alpine Peaks",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    category: "Nature",
    author: "Elena Rostova",
    submittedBy: "admin",
    isFavorite: false,
  },
  {
    id: 2,
    title: "Minimal Concrete",
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    category: "Architecture",
    author: "Klaus Meier",
    submittedBy: "admin",
    isFavorite: false,
  },
  {
    id: 3,
    title: "Neon Streets",
    url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80",
    category: "Urban",
    author: "Kenji Sato",
    submittedBy: "admin",
    isFavorite: true,
  },
  {
    id: 4,
    title: "Misty Pine Forest",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    category: "Nature",
    author: "Lukas Budimaier",
    submittedBy: "admin",
    isFavorite: false,
  },
  {
    id: 6,
    title: "Desert Solitude",
    url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
    category: "Minimal",
    author: "Jeremy Bishop",
    submittedBy: "admin",
    isFavorite: false,
  },
  {
    id: 7,
    title: "Coastal Drift",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    category: "Nature",
    author: "Mila Anders",
    submittedBy: "admin",
    isFavorite: false,
  },
  {
    id: 8,
    title: "City in Motion",
    url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=800&q=80",
    category: "Urban",
    author: "Noah Grant",
    submittedBy: "admin",
    isFavorite: true,
  },
  {
    id: 9,
    title: "Quiet Horizon",
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    category: "Minimal",
    author: "Ari Sol",
    submittedBy: "admin",
    isFavorite: false,
  },
  {
    id: 10,
    title: "Forest Lines",
    url: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80",
    category: "Nature",
    author: "Iris Holt",
    submittedBy: "admin",
    isFavorite: false,
  },
  {
    id: 11,
    title: "Glass Tower",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    category: "Architecture",
    author: "Peter Lane",
    submittedBy: "admin",
    isFavorite: false,
  },
  {
    id: 12,
    title: "Golden Shore",
    url: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=80",
    category: "Nature",
    author: "Leah Brooks",
    submittedBy: "admin",
    isFavorite: false,
  },
  { id: 13, title: "First Light", url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=800&q=80", category: "Nature", author: "Unsplash", submittedBy: "admin", isFavorite: false },
  { id: 14, title: "Mountain Weather", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80", category: "Nature", author: "Unsplash", submittedBy: "admin", isFavorite: false },
  { id: 15, title: "Blue Hour Lake", url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80", category: "Nature", author: "Unsplash", submittedBy: "admin", isFavorite: false },
  { id: 16, title: "Ocean Air", url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80", category: "Nature", author: "Unsplash", submittedBy: "admin", isFavorite: false },
  { id: 17, title: "Wildflower Season", url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80", category: "Nature", author: "Unsplash", submittedBy: "admin", isFavorite: false },
  { id: 18, title: "Alpine Meadow", url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80", category: "Nature", author: "Unsplash", submittedBy: "admin", isFavorite: false },
  { id: 19, title: "Quiet Geometry", url: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=800&q=80", category: "Architecture", author: "Unsplash", submittedBy: "admin", isFavorite: false },
  { id: 20, title: "White Concrete", url: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=800&q=80", category: "Architecture", author: "Unsplash", submittedBy: "admin", isFavorite: false },
  { id: 21, title: "Built in Lines", url: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80", category: "Architecture", author: "Unsplash", submittedBy: "admin", isFavorite: false },
  { id: 22, title: "City in Rain", url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80", category: "Urban", author: "Unsplash", submittedBy: "admin", isFavorite: false },
  { id: 23, title: "Night Shift", url: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=800&q=80", category: "Urban", author: "Unsplash", submittedBy: "admin", isFavorite: false },
  { id: 24, title: "Room for Thought", url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80", category: "Minimal", author: "Unsplash", submittedBy: "admin", isFavorite: false },
  { id: 25, title: "A Study in Stillness", url: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=800&q=80", category: "Minimal", author: "Unsplash", submittedBy: "admin", isFavorite: false },
];

function AppContent() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);
  const [pendingPhotos, setPendingPhotos] = useState([]);

  useEffect(() => {
    api.getPhotos().then(setPhotos).catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      api.getPendingPhotos(user.token).then(setPendingPhotos).catch(() => setPendingPhotos([]));
    }
  }, [user]);

  const activePendingPhotos = user?.role === "admin" ? pendingPhotos : [];

  const approvePhoto = async (photo) => {
    const approvedPhoto = await api.approvePhoto(user.token, photo.id);
    setPhotos((prev) => [approvedPhoto, ...prev]);
    setPendingPhotos((prev) => prev.filter((item) => item.id !== photo.id));
  };

  const handleSubmitPhoto = async (newPhoto) => {
    if (!user?.token) {
      throw new Error("You must be logged in to submit a photo.");
    }
    const createdPhoto = await api.submitPhoto(user.token, newPhoto);
    if (createdPhoto.status === "approved") {
      setPhotos((prev) => [createdPhoto, ...prev]);
    } else if (user?.role === "admin") {
      setPendingPhotos((prev) => [createdPhoto, ...prev]);
    }
    return createdPhoto;
  };

  const handleDeletePhoto = async (photo) => {
    await api.deletePhoto(user.token, photo.id);
    setPhotos((prev) => prev.filter((item) => item.id !== photo.id));
    setPendingPhotos((prev) => prev.filter((item) => item.id !== photo.id));
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={<Gallery photos={photos} setPhotos={setPhotos} onDeletePhoto={handleDeletePhoto} />}
          />
          <Route
            path="/gallery"
            element={<Gallery photos={photos} setPhotos={setPhotos} onDeletePhoto={handleDeletePhoto} />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<Login initialMode="admin" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/register" element={<ProtectedRoute requiredRole="admin"><Register adminMode /></ProtectedRoute>} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submit"
            element={
              <ProtectedRoute>
                <SubmitPhoto onSubmitPhoto={handleSubmitPhoto} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanel
                  photos={photos}
                  pendingPhotos={activePendingPhotos}
                  onApprovePhoto={approvePhoto}
                  onDeletePhoto={handleDeletePhoto}
                />
              </ProtectedRoute>
            }
          />
        </Routes>
        <SiteFooter />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;