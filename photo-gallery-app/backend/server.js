import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const port = Number(process.env.PORT || 5000);
const mongoUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET || "local-development-secret-change-me";
const adminSecurityKey = "2005";

if (!mongoUri) {
  console.error("MONGODB_URI is missing. Add it to .env before starting the API.");
  process.exit(1);
}

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

const photoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    submittedBy: { type: String, required: true, trim: true },
    status: { type: String, enum: ["pending", "approved"], default: "pending" },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Photo = mongoose.model("Photo", photoSchema);

const initialPhotos = [
  ["Alpine Peaks", "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80", "Nature", "Elena Rostova"],
  ["Minimal Concrete", "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80", "Architecture", "Klaus Meier"],
  ["Neon Streets", "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80", "Urban", "Kenji Sato"],
  ["Misty Pine Forest", "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80", "Nature", "Lukas Budimaier"],
  ["Geometric Spiral", "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80", "Architecture", "Sarah Dorweiler"],
  ["Desert Solitude", "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80", "Minimal", "Jeremy Bishop"],
  ["Coastal Drift", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", "Nature", "Mila Anders"],
  ["City in Motion", "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=800&q=80", "Urban", "Noah Grant"],
  ["Quiet Horizon", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80", "Minimal", "Ari Sol"],
  ["Forest Lines", "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80", "Nature", "Iris Holt"],
  ["Glass Tower", "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80", "Architecture", "Peter Lane"],
  ["Golden Shore", "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=80", "Nature", "Leah Brooks"],
];

const serializePhoto = (photo) => ({
  id: photo._id.toString(),
  title: photo.title,
  url: photo.url,
  category: photo.category,
  author: photo.author,
  submittedBy: photo.submittedBy,
  status: photo.status,
  isFavorite: photo.isFavorite,
});

const createToken = (user) => jwt.sign(
  { id: user._id.toString(), role: user.role, username: user.username },
  jwtSecret,
  { expiresIn: "7d" }
);

const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Authentication required." });

    const payload = jwt.verify(token, jwtSecret);
    const user = await User.findById(payload.id).select("fullName username role");
    if (!user) return res.status(401).json({ message: "User session is no longer valid." });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Authentication required." });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required." });
  next();
};

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/auth/register", async (req, res) => {
  try {
    const fullName = req.body.fullName?.trim();
    const username = req.body.username?.trim().toLowerCase();
    const password = req.body.password;
    const requestedRole = req.body.role === "admin" ? "admin" : "user";

    if (!fullName || !username || !password) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }
    if (await User.exists({ username })) {
      return res.status(409).json({ message: "This username is already taken." });
    }

    let role = "user";
    if (requestedRole === "admin") role = "admin";

    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ fullName, username, passwordHash, role });
    res.status(201).json({
      message: role === "admin" ? "Admin registration successful! You can now log in." : "Registration successful. Please log in.",
      role,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message || "Unable to register right now." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const username = req.body.username?.trim().toLowerCase();
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(req.body.password || "", user.passwordHash))) {
      return res.status(401).json({ message: "Invalid username or password." });
    }
    if (user.role === "admin" && req.body.adminSecurityKey !== adminSecurityKey) {
      return res.status(401).json({ message: "Invalid Admin Security Key." });
    }

    res.json({
      token: createToken(user),
      user: { id: user._id.toString(), fullName: user.fullName, username: user.username, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to log in right now.", error: error.message });
  }
});

app.get("/api/photos", async (_req, res) => {
  try {
    const photos = await Photo.find({ status: "approved" }).sort({ createdAt: -1 });
    res.json(photos.map(serializePhoto));
  } catch (error) {
    res.status(500).json({ message: "Unable to load gallery photos.", error: error.message });
  }
});

app.get("/api/photos/mine", requireAuth, async (req, res) => {
  try {
    const photos = await Photo.find({ submittedBy: req.user.username }).sort({ createdAt: -1 });
    res.json(photos.map(serializePhoto));
  } catch (error) {
    res.status(500).json({ message: "Unable to load your uploaded photos.", error: error.message });
  }
});

app.post("/api/photos", requireAuth, async (req, res) => {
  try {
    const { title, url, category } = req.body || {};
    if (!title?.trim() || !url?.trim() || !category?.trim()) {
      return res.status(400).json({ message: "Title, category, and image URL/data are required." });
    }

    const author = (req.body.author && req.body.author.trim())
      || (req.user && req.user.fullName)
      || (req.user && req.user.username)
      || "Photographer";

    const submittedBy = (req.user && req.user.username) || "user";
    const status = (req.user && req.user.role === "admin") ? "approved" : "pending";

    const photo = await Photo.create({
      title: title.trim(),
      url: url.trim(),
      category: category.trim(),
      author,
      submittedBy,
      status,
    });
    res.status(201).json(serializePhoto(photo));
  } catch (error) {
    console.error("Submit photo error:", error);
    res.status(500).json({ message: error.message || "Unable to submit photo." });
  }
});

app.get("/api/admin/photos/pending", requireAuth, requireAdmin, async (_req, res) => {
  const photos = await Photo.find({ status: "pending" }).sort({ createdAt: -1 });
  res.json(photos.map(serializePhoto));
});

app.patch("/api/admin/photos/:id/approve", requireAuth, requireAdmin, async (req, res) => {
  const photo = await Photo.findOneAndUpdate(
    { _id: req.params.id, status: "pending" },
    { status: "approved" },
    { new: true }
  );
  if (!photo) return res.status(404).json({ message: "Pending photo not found." });
  res.json(serializePhoto(photo));
});

app.delete("/api/admin/photos/:id", requireAuth, requireAdmin, async (req, res) => {
  const photo = await Photo.findByIdAndDelete(req.params.id);
  if (!photo) return res.status(404).json({ message: "Photo not found." });
  res.json({ message: "Photo deleted." });
});

const seedDatabase = async () => {
  const adminUsername = (process.env.ADMIN_USERNAME || "admin").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const adminExists = await User.exists({ username: adminUsername });

  if (!adminExists) {
    await User.create({
      fullName: "Admin User",
      username: adminUsername,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "admin",
    });
    console.log(`Seeded admin account: ${adminUsername}`);
  }

  if ((await Photo.countDocuments()) === 0) {
    await Photo.insertMany(initialPhotos.map(([title, url, category, author]) => ({
      title, url, category, author, submittedBy: adminUsername, status: "approved",
    })));
    console.log("Seeded initial gallery photos.");
  }
};

mongoose
  .connect(mongoUri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  })
  .then(async () => {
    await seedDatabase();
    app.listen(port, "127.0.0.1", () => console.log(`API running at http://127.0.0.1:${port}`));
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
