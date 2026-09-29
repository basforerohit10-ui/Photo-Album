import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Navbar from "./components/Navbar";
import SiteFooter from "./components/SiteFooter";
import Gallery from "./pages/Gallery";
import AdminPanel from "./pages/AdminPanel";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SubmitPhoto from "./pages/SubmitPhoto";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { api } from "./api";
import { useAuth } from "./context/AuthContext";
import { enrichPhotoWithDetails } from "./data/photoDetails";

const INITIAL_PHOTOS = [
  // 🛕 Temples & Spiritual
  {
    id: 1,
    title: "Harmandir Sahib · Golden Temple",
    url: "/images/india/golden_temple.jpg",
    category: "Temples & Spiritual",
    author: "Gurpreet Singh",
    submittedBy: "admin",
    isFavorite: true,
  },
  {
    id: 2,
    title: "Kedarnath Temple & Garhwal Peaks",
    url: "/images/india/kedarnath_temple.jpg",
    category: "Temples & Spiritual",
    author: "Rohit Basfore",
    submittedBy: "admin",
    isFavorite: true,
  },
  {
    id: 3,
    title: "Brihadeeswarar Ancient Chola Temple",
    url: "/images/india/brihadeeswarar.jpg",
    category: "Temples & Spiritual",
    author: "Karthik Subramanian",
    submittedBy: "admin",
    isFavorite: false,
  },
  {
    id: 4,
    title: "Meenakshi Amman Ancient Gopuram",
    url: "/images/india/meenakshi_temple.jpg",
    category: "Temples & Spiritual",
    author: "Suresh Ramanathan",
    submittedBy: "admin",
    isFavorite: true,
  },
  {
    id: 5,
    title: "Konark Sun Temple & Black Pagoda",
    url: "/images/india/konark_temple.jpg",
    category: "Temples & Spiritual",
    author: "Debabrata Mohanty",
    submittedBy: "admin",
    isFavorite: false,
  },
  {
    id: 6,
    title: "Vittala Temple Stone Chariot",
    url: "/images/india/hampi_chariot.jpg",
    category: "Temples & Spiritual",
    author: "Anand Rangan",
    submittedBy: "admin",
    isFavorite: false,
  },
  {
    id: 7,
    title: "Sacred Evening Ganga Aarti",
    url: "/images/india/ganga_aarti.jpg",
    category: "Temples & Spiritual",
    author: "Devendra Singh",
    submittedBy: "admin",
    isFavorite: true,
  },

  // 🏰 Famous Monuments
  {
    id: 8,
    title: "Taj Mahal at First Light",
    url: "/images/india/taj_mahal.jpg",
    category: "Famous Monuments",
    author: "Pradeep Kumar",
    submittedBy: "admin",
    isFavorite: true,
  },
  {
    id: 9,
    title: "Hawa Mahal · Palace of Winds",
    url: "/images/india/hawa_mahal.jpg",
    category: "Famous Monuments",
    author: "Aarav Sharma",
    submittedBy: "admin",
    isFavorite: false,
  },
  {
    id: 10,
    title: "India Gate War Memorial at Dusk",
    url: "/images/india/india_gate.jpg",
    category: "Famous Monuments",
    author: "Vikram Malhotra",
    submittedBy: "admin",
    isFavorite: true,
  },
  {
    id: 11,
    title: "Gateway of India & Arabian Sea",
    url: "/images/india/gateway_of_india.jpg",
    category: "Famous Monuments",
    author: "Rohan Mehta",
    submittedBy: "admin",
    isFavorite: false,
  },
  {
    id: 12,
    title: "Qutub Minar & Historic Ruins",
    url: "/images/india/qutub_minar.jpg",
    category: "Famous Monuments",
    author: "Siddharth Sen",
    submittedBy: "admin",
    isFavorite: false,
  },
  {
    id: 13,
    title: "Amber Fort Palace & Aravalli Ridges",
    url: "/images/india/amber_fort.jpg",
    category: "Famous Monuments",
    author: "Pooja Shekhawat",
    submittedBy: "admin",
    isFavorite: false,
  },
  {
    id: 14,
    title: "Red Fort · Lal Qila",
    url: "/images/india/red_fort.jpg",
    category: "Famous Monuments",
    author: "Farhan Ansari",
    submittedBy: "admin",
    isFavorite: true,
  },
  {
    id: 15,
    title: "Victoria Memorial Marble Palace",
    url: "/images/india/victoria_memorial.jpg",
    category: "Famous Monuments",
    author: "Sourav Ganguly",
    submittedBy: "admin",
    isFavorite: false,
  },
  {
    id: 16,
    title: "Mysore Palace Illuminated Grandeur",
    url: "/images/india/mysore_palace.jpg",
    category: "Famous Monuments",
    author: "Manjunath Gowda",
    submittedBy: "admin",
    isFavorite: true,
  },

  // 🌿 Indian Nature
  {
    id: 17,
    title: "Kerala Backwaters Houseboat",
    url: "/images/india/kerala_backwaters.jpg",
    category: "Indian Nature",
    author: "Vishnu Mohan",
    submittedBy: "admin",
    isFavorite: false,
  },
  {
    id: 18,
    title: "Munnar Emerald Tea Plantations",
    url: "/images/india/munnar_tea.jpg",
    category: "Indian Nature",
    author: "Karthik Pillai",
    submittedBy: "admin",
    isFavorite: true,
  },
  {
    id: 19,
    title: "Dal Lake Shikara in Morning Mist",
    url: "/images/india/dal_lake.jpg",
    category: "Indian Nature",
    author: "Farooq Mir",
    submittedBy: "admin",
    isFavorite: true,
  },
  {
    id: 20,
    title: "Palolem Palms & Arabian Sunset",
    url: "/images/india/palolem_beach.jpg",
    category: "Indian Nature",
    author: "Nikhil D'Souza",
    submittedBy: "admin",
    isFavorite: false,
  },
  {
    id: 21,
    title: "Dhauladhar Pine Forest Mist",
    url: "/images/india/dhauladhar.jpg",
    category: "Indian Nature",
    author: "Ritu Verma",
    submittedBy: "admin",
    isFavorite: false,
  },

  // 🏔️ Himalayas & Deserts
  {
    id: 22,
    title: "Pangong Tso & Ladakh Highlands",
    url: "/images/india/pangong_tso.jpg",
    category: "Himalayas & Deserts",
    author: "Stanzin Norbu",
    submittedBy: "admin",
    isFavorite: true,
  },
  {
    id: 23,
    title: "Key Monastery on Spiti Cliff",
    url: "/images/india/key_monastery.jpg",
    category: "Himalayas & Deserts",
    author: "Deepak Thakur",
    submittedBy: "admin",
    isFavorite: false,
  },
  {
    id: 24,
    title: "Thar Desert Gold Sand Dunes",
    url: "/images/india/thar_desert.jpg",
    category: "Himalayas & Deserts",
    author: "Karan Bhati",
    submittedBy: "admin",
    isFavorite: false,
  },

  // 🐅 Wildlife of India
  {
    id: 25,
    title: "Royal Bengal Tiger in Forest",
    url: "/images/india/bengal_tiger.jpg",
    category: "Wildlife of India",
    author: "Rajesh Chundawat",
    submittedBy: "admin",
    isFavorite: true,
  },
  {
    id: 26,
    title: "Majestic Indian Peacock in Bloom",
    url: "/images/india/indian_peacock.jpg",
    category: "Wildlife of India",
    author: "Meera Sen",
    submittedBy: "admin",
    isFavorite: true,
  },
  {
    id: 27,
    title: "Wild Indian Tusker Elephant",
    url: "/images/india/indian_elephant.jpg",
    category: "Wildlife of India",
    author: "Unnikrishnan Nair",
    submittedBy: "admin",
    isFavorite: false,
  },

  // 🪔 Culture & Ghats
  {
    id: 28,
    title: "Varanasi Morning on the Ganga",
    url: "/images/india/varanasi_ghats.jpg",
    category: "Culture & Ghats",
    author: "Devendra Singh",
    submittedBy: "admin",
    isFavorite: true,
  },
  {
    id: 29,
    title: "The Blue City of Jodhpur",
    url: "/images/india/jodhpur_blue_city.jpg",
    category: "Culture & Ghats",
    author: "Manish Rathore",
    submittedBy: "admin",
    isFavorite: false,
  },
  {
    id: 30,
    title: "Lake Palace & Pichola Waters",
    url: "/images/india/lake_palace.jpg",
    category: "Culture & Ghats",
    author: "Ananya Dave",
    submittedBy: "admin",
    isFavorite: false,
  },
  {
    id: 31,
    title: "Howrah Bridge Over Sacred Hooghly",
    url: "/images/india/howrah_bridge.jpg",
    category: "Culture & Ghats",
    author: "Subhashis Roy",
    submittedBy: "admin",
    isFavorite: false,
  },
];

function AppContent() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState(() => INITIAL_PHOTOS.map(enrichPhotoWithDetails));
  const [pendingPhotos, setPendingPhotos] = useState([]);

  useEffect(() => {
    api.getPhotos()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPhotos(data.map(enrichPhotoWithDetails));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      api.getPendingPhotos(user.token)
        .then((data) => {
          if (Array.isArray(data)) {
            setPendingPhotos(data.map(enrichPhotoWithDetails));
          } else {
            setPendingPhotos([]);
          }
        })
        .catch(() => setPendingPhotos([]));
    }
  }, [user]);

  const activePendingPhotos = user?.role === "admin" ? pendingPhotos : [];

  const approvePhoto = async (photo) => {
    const approvedPhoto = await api.approvePhoto(user.token, photo.id);
    const enrichedApproved = enrichPhotoWithDetails(approvedPhoto);
    setPhotos((prev) => [enrichedApproved, ...prev]);
    setPendingPhotos((prev) => prev.filter((item) => item.id !== photo.id));
  };

  const handleSubmitPhoto = async (newPhoto) => {
    if (!user?.token) {
      throw new Error("You must be logged in to submit a photo.");
    }
    const createdPhoto = await api.submitPhoto(user.token, newPhoto);
    const enrichedCreated = enrichPhotoWithDetails(createdPhoto);
    if (createdPhoto.status === "approved") {
      setPhotos((prev) => [enrichedCreated, ...prev]);
    } else if (user?.role === "admin") {
      setPendingPhotos((prev) => [enrichedCreated, ...prev]);
    }
    return enrichedCreated;
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
          <Route path="*" element={<NotFound />} />
        </Routes>
        <SiteFooter />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <AppContent />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;