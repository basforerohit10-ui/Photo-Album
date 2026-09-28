import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const port = Number(process.env.PORT || 5000);
const mongoUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;
const adminSecurityKey = process.env.ADMIN_SECRET_KEY;

if (!mongoUri || !jwtSecret || !adminSecurityKey || !process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
  console.error("MONGODB_URI, JWT_SECRET, ADMIN_SECRET_KEY, ADMIN_USERNAME, and ADMIN_PASSWORD must be set in .env.");
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
  ["Desert Solitude", "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80", "Minimal", "Jeremy Bishop"],
  ["Coastal Drift", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", "Nature", "Mila Anders"],
  ["City in Motion", "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=800&q=80", "Urban", "Noah Grant"],
  ["Quiet Horizon", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80", "Minimal", "Ari Sol"],
  ["Forest Lines", "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80", "Nature", "Iris Holt"],
  ["Glass Tower", "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80", "Architecture", "Peter Lane"],
  ["Golden Shore", "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=80", "Nature", "Leah Brooks"],
  ["First Light", "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=800&q=80", "Nature", "Unsplash"],
  ["Mountain Weather", "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80", "Nature", "Unsplash"],
  ["Blue Hour Lake", "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80", "Nature", "Unsplash"],
  ["Ocean Air", "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80", "Nature", "Unsplash"],
  ["Wildflower Season", "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80", "Nature", "Unsplash"],
  ["Alpine Meadow", "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80", "Nature", "Unsplash"],
  ["Quiet Geometry", "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=800&q=80", "Architecture", "Unsplash"],
  ["White Concrete", "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=800&q=80", "Architecture", "Unsplash"],
  ["Built in Lines", "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80", "Architecture", "Unsplash"],
  ["City in Rain", "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80", "Urban", "Unsplash"],
  ["Night Shift", "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=800&q=80", "Urban", "Unsplash"],
  ["Room for Thought", "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80", "Minimal", "Unsplash"],
  ["A Study in Stillness", "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=800&q=80", "Minimal", "Unsplash"],
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

// Root route
app.get("/", (_req, res) => {
  res.json({ message: "Photo Gallery API is running successfully!" });
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/auth/register", async (req, res) => {
  try {
    const fullName = req.body.fullName?.trim();
    const username = req.body.username?.trim().toLowerCase();
    const password = req.body.password;
    if (!fullName || !username || !password) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }
    if (await User.exists({ username })) {
      return res.status(409).json({ message: "This username is already taken." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ fullName, username, passwordHash, role: "user" });
    res.status(201).json({
      message: "Registration successful. Please log in.",
      role: "user",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message || "Unable to register right now." });
  }
});

app.post("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const fullName = req.body.fullName?.trim();
    const username = req.body.username?.trim().toLowerCase();
    const password = req.body.password;

    if (!fullName || !username || !password) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }
    if (await User.exists({ username })) {
      return res.status(409).json({ message: "This username is already taken." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ fullName, username, passwordHash, role: "admin" });
    res.status(201).json({ message: "Admin account created successfully.", role: "admin" });
  } catch (error) {
    console.error("Admin registration error:", error);
    res.status(500).json({ message: error.message || "Unable to create admin account." });
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
  const adminUsername = process.env.ADMIN_USERNAME.toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
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

  const seedResult = await Photo.bulkWrite(initialPhotos.map(([title, url, category, author]) => ({
    updateOne: {
      filter: { title },
      update: { $setOnInsert: { title, url, category, author, submittedBy: adminUsername, status: "approved" } },
      upsert: true,
    },
  })));
  if (seedResult.upsertedCount) console.log(`Added ${seedResult.upsertedCount} sample gallery photos.`);

  const approvedPhotos = await Photo.find({ status: "approved" })
    .sort({ createdAt: 1, _id: 1 })
    .select("_id url")
    .lean();
  const seenImageUrls = new Set();
  const duplicatePhotoIds = [];

  for (const photo of approvedPhotos) {
    let imageUrl = photo.url.trim();
    try {
      const parsedUrl = new URL(imageUrl);
      imageUrl = `${parsedUrl.origin}${parsedUrl.pathname}`;
    } catch {
      // Keep non-URL image values distinct by their exact string.
    }
    if (seenImageUrls.has(imageUrl)) duplicatePhotoIds.push(photo._id);
    else seenImageUrls.add(imageUrl);
  }

  if (duplicatePhotoIds.length) {
    const result = await Photo.deleteMany({ _id: { $in: duplicatePhotoIds } });
    console.log(`Removed ${result.deletedCount} duplicate approved gallery photos.`);
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