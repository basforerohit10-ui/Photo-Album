import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = Number(process.env.PORT || 5000);
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/photo_gallery";
const jwtSecret = process.env.JWT_SECRET || "photo_gallery_jwt_secret_key_845a144c19e046c3b092e8631a7cc218";
const adminSecurityKey = process.env.ADMIN_SECRET_KEY || "2005";
const adminUsername = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

if (!process.env.MONGODB_URI) {
  console.warn("WARNING: MONGODB_URI not set. Using local fallback mongodb://127.0.0.1:27017/photo_gallery. For cloud deployment, set MONGODB_URI to your MongoDB Atlas connection string.");
}

// Robust CORS allowing local development, Vercel, Render, Railway and configured origins
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const configuredOrigins = (process.env.CLIENT_ORIGIN || "")
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);

      const defaultAllowed = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5000",
      ];

      const isAllowed =
        configuredOrigins.includes("*") ||
        configuredOrigins.includes(origin) ||
        defaultAllowed.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".onrender.com") ||
        origin.endsWith(".railway.app") ||
        origin.endsWith(".netlify.app");

      if (isAllowed) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/images", express.static(path.join(__dirname, "../frontend/public/images")));

// Route normalizer for serverless environments (e.g. if Vercel strips /api prefix)
app.use((req, res, next) => {
  if (!req.url.startsWith("/api") && !req.url.startsWith("/images")) {
    const apiRoutes = ["/health", "/auth/register", "/auth/login", "/admin/users", "/photos", "/admin/photos"];
    if (apiRoutes.some((r) => req.url.startsWith(r))) {
      req.url = `/api${req.url}`;
    }
  }
  next();
});

// Middleware to ensure DB connection on API requests
app.use(async (req, res, next) => {
  if (req.path.startsWith("/api")) {
    try {
      await ensureConnected();
    } catch (err) {
      console.error("Database connection error on API request:", err.message);
      return res.status(503).json({
        message: "Database connection failed. Please check MONGODB_URI in your cloud deployment settings.",
        error: err.message,
      });
    }
  }
  next();
});

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
    description: { type: String, default: "", trim: true },
    location: { type: String, default: "", trim: true },
    camera: { type: String, default: "", trim: true },
    lens: { type: String, default: "", trim: true },
    settings: { type: String, default: "", trim: true },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ["pending", "approved"], default: "pending" },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Photo = mongoose.model("Photo", photoSchema);

const initialPhotos = [
  // 🛕 Temples & Spiritual
  {
    title: "Harmandir Sahib · Golden Temple",
    url: "/images/india/golden_temple.jpg",
    category: "Temples & Spiritual",
    author: "Gurpreet Singh",
    location: "Amritsar, Punjab, India",
    description: "The sanctum of Sri Harmandir Sahib gleaming with pure gold leaf across the serene holy Sarovar at twilight, embodying peace, humility, and radiant devotion.",
    camera: "Canon EOS R5",
    lens: "Canon RF 15-35mm f/2.8L IS USM",
    settings: "1/60s • f/4.0 • ISO 400 • 24mm",
    tags: ["GoldenTemple", "Amritsar", "Punjab", "SikhHeritage", "Temple", "Spiritual"],
    isFavorite: true,
  },
  {
    title: "Kedarnath Temple & Garhwal Peaks",
    url: "/images/india/kedarnath_temple.jpg",
    category: "Temples & Spiritual",
    author: "Rohit Basfore",
    location: "Kedarnath, Rudraprayag, Uttarakhand, India",
    description: "The ancient 8th-century stone temple of Lord Shiva standing resolute at 3,583 meters altitude against the towering, snow-covered Mandakini peaks of the Garhwal Himalayas.",
    camera: "Sony Alpha A7R V",
    lens: "Sony FE 24-70mm f/2.8 GM II",
    settings: "1/500s • f/8.0 • ISO 100 • 35mm",
    tags: ["Kedarnath", "Shiva", "Himalayas", "Uttarakhand", "Temple", "Spiritual"],
    isFavorite: true,
  },
  {
    title: "Brihadeeswarar Ancient Chola Temple",
    url: "/images/india/brihadeeswarar.jpg",
    category: "Temples & Spiritual",
    author: "Karthik Subramanian",
    location: "Thanjavur, Tamil Nadu, India",
    description: "The UNESCO World Heritage 1,000-year-old Big Temple built by Raja Raja Chola I, showcasing colossal Dravidian granite vimana engineering and sacred sculptures.",
    camera: "Nikon Z7 II",
    lens: "NIKKOR Z 14-30mm f/4 S",
    settings: "1/320s • f/7.1 • ISO 125 • 20mm",
    tags: ["Brihadeeswarar", "Thanjavur", "TamilNadu", "Chola", "Temple", "Dravidian", "UNESCO"],
    isFavorite: false,
  },
  {
    title: "Meenakshi Amman Ancient Gopuram",
    url: "/images/india/meenakshi_temple.jpg",
    category: "Temples & Spiritual",
    author: "Suresh Ramanathan",
    location: "Madurai, Tamil Nadu, India",
    description: "The towering, rainbow-colored southern gopuram of the ancient Meenakshi Amman Temple, adorned with thousands of sculpted deities, mythological figures, and celestial dancers.",
    camera: "Sony Alpha A7R V",
    lens: "Sony FE 16-35mm f/2.8 GM II",
    settings: "1/640s • f/6.3 • ISO 160 • 20mm",
    tags: ["MeenakshiTemple", "Madurai", "TamilNadu", "Dravidian", "Temple", "Spiritual"],
    isFavorite: true,
  },
  {
    title: "Konark Sun Temple & Black Pagoda",
    url: "/images/india/konark_temple.jpg",
    category: "Temples & Spiritual",
    author: "Debabrata Mohanty",
    location: "Konark, Puri, Odisha, India",
    description: "The 13th-century monumental sun chariot temple adorned with elaborately carved stone wheels, horses, and celestial dancers, celebrated as an architectural marvel of ancient India.",
    camera: "Nikon D850",
    lens: "AF-S NIKKOR 24-70mm f/2.8E ED VR",
    settings: "1/400s • f/8.0 • ISO 100 • 35mm",
    tags: ["Konark", "SunTemple", "Odisha", "UNESCO", "Temple", "Heritage"],
    isFavorite: false,
  },
  {
    title: "Vittala Temple Stone Chariot",
    url: "/images/india/hampi_chariot.jpg",
    category: "Temples & Spiritual",
    author: "Anand Rangan",
    location: "Hampi, Vijayanagara, Karnataka, India",
    description: "The world-famous monolithic stone chariot shrine dedicated to Garuda at the Vijaya Vittala temple complex among the mythical boulder-strewn landscapes of historic Hampi.",
    camera: "Fujifilm GFX 100S",
    lens: "Fujinon GF 32-64mm f/4 R LM WR",
    settings: "1/250s • f/8.0 • ISO 100 • 32mm",
    tags: ["Hampi", "StoneChariot", "Karnataka", "Vijayanagara", "Temple", "UNESCO", "Heritage"],
    isFavorite: false,
  },
  {
    title: "Sacred Evening Ganga Aarti",
    url: "/images/india/ganga_aarti.jpg",
    category: "Temples & Spiritual",
    author: "Devendra Singh",
    location: "Dashashwamedh Ghat, Varanasi, Uttar Pradesh, India",
    description: "The grand evening Maha Aarti with hundreds of illuminated pilgrim boats gathered on the sacred Ganga, glowing brass lamps, bells, and devotion.",
    camera: "Leica M11",
    lens: "Summilux-M 35mm f/1.4 ASPH",
    settings: "1/160s • f/1.4 • ISO 800 • 35mm",
    tags: ["GangaAarti", "Varanasi", "Spiritual", "Ghats", "Kashi", "Temple", "Devotion"],
    isFavorite: true,
  },

  // 🏰 Famous Monuments
  {
    title: "Taj Mahal at First Light",
    url: "/images/india/taj_mahal.jpg",
    category: "Famous Monuments",
    author: "Pradeep Kumar",
    location: "Agra, Uttar Pradesh, India",
    description: "The ivory-white marble mausoleum of the Taj Mahal glowing in soft amber light at the break of dawn, reflecting gracefully across the Yamuna garden pools.",
    camera: "Sony Alpha A7R V",
    lens: "Sony FE 24-70mm f/2.8 GM II",
    settings: "1/500s • f/8.0 • ISO 100 • 35mm",
    tags: ["TajMahal", "Agra", "Mughal", "WonderOfTheWorld", "Heritage", "Monument"],
    isFavorite: true,
  },
  {
    title: "Hawa Mahal · Palace of Winds",
    url: "/images/india/hawa_mahal.jpg",
    category: "Famous Monuments",
    author: "Aarav Sharma",
    location: "Badi Choupad, Jaipur, Rajasthan, India",
    description: "The honeycomb lattice of 953 jharokha windows on Jaipur's iconic Hawa Mahal, carved from pink and red sandstone to catch refreshing desert breezes.",
    camera: "Fujifilm GFX 100S",
    lens: "Fujinon GF 32-64mm f/4 R LM WR",
    settings: "1/320s • f/8.0 • ISO 100 • 45mm",
    tags: ["HawaMahal", "Jaipur", "PinkCity", "Rajasthan", "Architecture", "Monument"],
    isFavorite: false,
  },
  {
    title: "India Gate War Memorial at Dusk",
    url: "/images/india/india_gate.jpg",
    category: "Famous Monuments",
    author: "Vikram Malhotra",
    location: "Kartavya Path, New Delhi, India",
    description: "The 42-meter triumphal arch of India Gate honoring fallen soldiers with eternal remembrance along the ceremonial boulevard of New Delhi.",
    camera: "Canon EOS R5",
    lens: "Canon RF 24-70mm f/2.8L IS USM",
    settings: "1/125s • f/4.0 • ISO 400 • 28mm",
    tags: ["IndiaGate", "NewDelhi", "Monument", "Heritage", "Evening", "Capital"],
    isFavorite: true,
  },
  {
    title: "Gateway of India & Arabian Sea",
    url: "/images/india/gateway_of_india.jpg",
    category: "Famous Monuments",
    author: "Rohan Mehta",
    location: "Colaba, Mumbai, Maharashtra, India",
    description: "The monumental 20th-century Indo-Saracenic basalt arch overlooking Mumbai harbour and the waters of the Arabian Sea.",
    camera: "Nikon Z8",
    lens: "NIKKOR Z 24-70mm f/2.8 S",
    settings: "1/125s • f/5.6 • ISO 250 • 28mm",
    tags: ["Mumbai", "GatewayOfIndia", "MarineDrive", "Monument", "Maharashtra"],
    isFavorite: false,
  },
  {
    title: "Qutub Minar & Historic Ruins",
    url: "/images/india/qutub_minar.jpg",
    category: "Famous Monuments",
    author: "Siddharth Sen",
    location: "Mehrauli, New Delhi, India",
    description: "The 73-meter fluted red sandstone victory minaret of Qutub Minar, surrounded by intricately carved medieval Indo-Islamic ruins dating back to 1192 AD.",
    camera: "Sony Alpha A7R IV",
    lens: "Sony FE 16-35mm f/2.8 GM",
    settings: "1/640s • f/7.1 • ISO 100 • 18mm",
    tags: ["QutubMinar", "Delhi", "UNESCO", "Monument", "History", "Heritage"],
    isFavorite: false,
  },
  {
    title: "Amber Fort Palace & Aravalli Ridges",
    url: "/images/india/amber_fort.jpg",
    category: "Famous Monuments",
    author: "Pooja Shekhawat",
    location: "Amer, Jaipur, Rajasthan, India",
    description: "The majestic sandstone arches, courtyards, and ramparts of Amber Fort crowning the rugged Aravalli hilltops high above Maota Lake in Jaipur.",
    camera: "Fujifilm X-T4",
    lens: "Fujinon XF 10-24mm f/4 R OIS WR",
    settings: "1/500s • f/8.0 • ISO 160 • 14mm",
    tags: ["AmberFort", "Jaipur", "Fortress", "Rajasthan", "Heritage", "Monument"],
    isFavorite: false,
  },
  {
    title: "Red Fort · Lal Qila",
    url: "/images/india/red_fort.jpg",
    category: "Famous Monuments",
    author: "Farhan Ansari",
    location: "Old Delhi, India",
    description: "The formidable red sandstone fortifications and octagonal towers of Lal Qila, historic seat of the Mughal empire and symbol of Indian independence.",
    camera: "Canon EOS R5",
    lens: "Canon RF 24-105mm f/4L IS USM",
    settings: "1/320s • f/8.0 • ISO 100 • 28mm",
    tags: ["RedFort", "LalQila", "Delhi", "Mughal", "Monument", "UNESCO"],
    isFavorite: true,
  },
  {
    title: "Victoria Memorial Marble Palace",
    url: "/images/india/victoria_memorial.jpg",
    category: "Famous Monuments",
    author: "Sourav Ganguly",
    location: "Queen's Way, Kolkata, West Bengal, India",
    description: "The grand classical white Makrana marble monument of Victoria Memorial, surrounded by sweeping landscaped water bodies in the heart of Kolkata.",
    camera: "Nikon D850",
    lens: "AF-S NIKKOR 24-70mm f/2.8E ED VR",
    settings: "1/400s • f/8.0 • ISO 100 • 35mm",
    tags: ["VictoriaMemorial", "Kolkata", "Bengal", "Marble", "Monument", "History"],
    isFavorite: false,
  },
  {
    title: "Mysore Palace Illuminated Grandeur",
    url: "/images/india/mysore_palace.jpg",
    category: "Famous Monuments",
    author: "Manjunath Gowda",
    location: "Sayyaji Rao Road, Mysuru, Karnataka, India",
    description: "The world-renowned Amba Vilas Palace with its magnificent Indo-Saracenic domes, arches, and grand royal courtyards.",
    camera: "Sony Alpha A7 IV",
    lens: "Sony FE 24-105mm f/4 G OSS",
    settings: "1/40s • f/4.0 • ISO 800 • 30mm",
    tags: ["MysorePalace", "Karnataka", "Royal", "NightIllumination", "Monument", "Heritage"],
    isFavorite: true,
  },

  // 🌿 Indian Nature
  {
    title: "Kerala Backwaters Houseboat",
    url: "/images/india/kerala_backwaters.jpg",
    category: "Indian Nature",
    author: "Vishnu Mohan",
    location: "Alappuzha (Alleppey), Kerala, India",
    description: "Traditional wooden kettuvallam houseboats gliding peacefully through tranquil labyrinthine canals fringed by swaying coconut palms in emerald Kerala.",
    camera: "Sony Alpha A7 IV",
    lens: "Sony FE 24-105mm f/4 G OSS",
    settings: "1/400s • f/5.6 • ISO 160 • 40mm",
    tags: ["Kerala", "Alleppey", "Backwaters", "Nature", "Houseboat", "Peace"],
    isFavorite: false,
  },
  {
    title: "Munnar Emerald Tea Plantations",
    url: "/images/india/munnar_tea.jpg",
    category: "Indian Nature",
    author: "Karthik Pillai",
    location: "Munnar, Idukki, Kerala, India",
    description: "Rolling velvet-green tea garden hills carpeted across the cloud-draped slopes of Munnar in the Western Ghats biodiversity hotspot.",
    camera: "Canon EOS R5",
    lens: "Canon RF 24-105mm f/4L IS USM",
    settings: "1/320s • f/7.1 • ISO 100 • 50mm",
    tags: ["Munnar", "TeaGardens", "WesternGhats", "Greenery", "Nature", "Kerala"],
    isFavorite: true,
  },
  {
    title: "Dal Lake Shikara in Morning Mist",
    url: "/images/india/dal_lake.jpg",
    category: "Indian Nature",
    author: "Farooq Mir",
    location: "Dal Lake, Srinagar, Jammu & Kashmir, India",
    description: "A hand-carved wooden shikara boat gliding through the crystal stillness of Dal Lake at first light, framed by floating water lilies and the misty snowline of the Pir Panjal mountains.",
    camera: "Hasselblad X2D 100C",
    lens: "XCD 55mm f/2.5 V",
    settings: "1/200s • f/4.0 • ISO 100 • 55mm",
    tags: ["Kashmir", "DalLake", "Srinagar", "Shikara", "Mountains", "Nature", "HeavenOnEarth"],
    isFavorite: true,
  },
  {
    title: "Palolem Palms & Arabian Sunset",
    url: "/images/india/palolem_beach.jpg",
    category: "Indian Nature",
    author: "Nikhil D'Souza",
    location: "Palolem Beach, South Goa, India",
    description: "Pristine crescent bay with gentle rolling waves, fishing boats, and palm-topped headlands overlooking the Arabian Sea.",
    camera: "Sony Alpha A1",
    lens: "Sony FE 35mm f/1.4 GM",
    settings: "1/800s • f/4.0 • ISO 100 • 35mm",
    tags: ["Goa", "Palolem", "Sunset", "Beach", "Nature", "Coastal"],
    isFavorite: false,
  },
  {
    title: "Dhauladhar Pine Forest Mist",
    url: "/images/india/dhauladhar.jpg",
    category: "Indian Nature",
    author: "Ritu Verma",
    location: "Dhauladhar Range, Dharamshala, Himachal Pradesh, India",
    description: "High mountain forest pine ridges beneath the towering, snow-covered granite walls of the Dhauladhar Range in upper Himachal.",
    camera: "Fujifilm X-Pro3",
    lens: "Fujinon XF 23mm f/2 R WR",
    settings: "1/250s • f/4.0 • ISO 200 • 23mm",
    tags: ["Himachal", "Dharamshala", "PineForest", "Mist", "Himalayas", "Nature"],
    isFavorite: false,
  },

  // 🏔️ Himalayas & Deserts
  {
    title: "Pangong Tso & Ladakh Highlands",
    url: "/images/india/pangong_tso.jpg",
    category: "Himalayas & Deserts",
    author: "Stanzin Norbu",
    location: "Pangong Tso, Ladakh, India",
    description: "The mesmerizing deep cobalt and turquoise waters of Pangong Tso extending across high-altitude Himalayan mountain deserts beneath bright alpine clouds.",
    camera: "Sony Alpha A7R IV",
    lens: "Sony FE 16-35mm f/2.8 GM",
    settings: "1/800s • f/9.0 • ISO 100 • 24mm",
    tags: ["Ladakh", "PangongLake", "Himalayas", "HighAltitude", "Deserts"],
    isFavorite: true,
  },
  {
    title: "Key Monastery on Spiti Cliff",
    url: "/images/india/key_monastery.jpg",
    category: "Himalayas & Deserts",
    author: "Deepak Thakur",
    location: "Spiti Valley, Himachal Pradesh, India",
    description: "The 1000-year-old Key Gompa monastery perched dramatically like a fortress on a remote rocky hill in the cold high desert of Spiti Valley.",
    camera: "Nikon Z6 II",
    lens: "NIKKOR Z 24-70mm f/4 S",
    settings: "1/400s • f/7.1 • ISO 100 • 35mm",
    tags: ["SpitiValley", "KeyMonastery", "Buddhism", "Himalayas", "Himachal", "HighDesert"],
    isFavorite: false,
  },
  {
    title: "Thar Desert Gold Sand Dunes",
    url: "/images/india/thar_desert.jpg",
    category: "Himalayas & Deserts",
    author: "Karan Bhati",
    location: "Sam Sand Dunes, Jaisalmer, Rajasthan, India",
    description: "Endless golden wind-sculpted sand dunes of the Great Indian Thar Desert stretching out to the horizon under the vast amber skies of Jaisalmer.",
    camera: "Leica Q3",
    lens: "Summilux 28mm f/1.7 ASPH",
    settings: "1/1000s • f/5.6 • ISO 100 • 28mm",
    tags: ["TharDesert", "Jaisalmer", "SandDunes", "Rajasthan", "Deserts"],
    isFavorite: false,
  },

  // 🐅 Wildlife of India
  {
    title: "Royal Bengal Tiger in Forest",
    url: "/images/india/bengal_tiger.jpg",
    category: "Wildlife of India",
    author: "Rajesh Chundawat",
    location: "Ranthambore National Park, Sawai Madhopur, Rajasthan, India",
    description: "A wild Royal Bengal Tiger striding silently through morning forest shadows in the ancient hunting grounds of the Maharajas in Ranthambore.",
    camera: "Sony Alpha A1",
    lens: "Sony FE 200-600mm f/5.6-6.3 G OSS",
    settings: "1/1000s • f/6.3 • ISO 640 • 500mm",
    tags: ["Tiger", "RoyalBengalTiger", "Ranthambore", "Wildlife", "India", "Forest"],
    isFavorite: true,
  },
  {
    title: "Majestic Indian Peacock in Bloom",
    url: "/images/india/indian_peacock.jpg",
    category: "Wildlife of India",
    author: "Meera Sen",
    location: "Keoladeo Ghana, Bharatpur, Rajasthan, India",
    description: "The national bird of India perched proudly with its iridescent sapphire and emerald plumage and elongated train feathers.",
    camera: "Nikon Z9",
    lens: "NIKKOR Z 400mm f/2.8 TC VR S",
    settings: "1/1600s • f/2.8 • ISO 400 • 400mm",
    tags: ["Peacock", "NationalBird", "Wildlife", "Bharatpur", "Rajasthan", "Feathers"],
    isFavorite: true,
  },
  {
    title: "Wild Indian Tusker Elephant",
    url: "/images/india/indian_elephant.jpg",
    category: "Wildlife of India",
    author: "Unnikrishnan Nair",
    location: "Periyar Tiger Reserve, Thekkady, Kerala, India",
    description: "A magnificent wild Indian tusker elephant emerging calmly from the dense tropical bamboo rainforest along the Periyar Lake shore.",
    camera: "Canon EOS R3",
    lens: "Canon RF 100-500mm f/4.5-7.1L IS USM",
    settings: "1/800s • f/5.6 • ISO 500 • 300mm",
    tags: ["Elephant", "Periyar", "Wildlife", "Kerala", "Rainforest", "Nature"],
    isFavorite: false,
  },

  // 🪔 Culture & Ghats
  {
    title: "Varanasi Morning on the Ganga",
    url: "/images/india/varanasi_ghats.jpg",
    category: "Culture & Ghats",
    author: "Devendra Singh",
    location: "Dashashwamedh Ghat, Varanasi, Uttar Pradesh, India",
    description: "Morning prayers, sacred rituals, and floating earthen oil lamps greeting the rising sun over the timeless stone steps of the Varanasi ghats along the holy River Ganga.",
    camera: "Leica M11",
    lens: "Summilux-M 35mm f/1.4 ASPH",
    settings: "1/250s • f/2.0 • ISO 200 • 35mm",
    tags: ["Varanasi", "Ganga", "Ghats", "Spiritual", "Culture", "Sacred", "Kashi"],
    isFavorite: true,
  },
  {
    title: "The Blue City of Jodhpur",
    url: "/images/india/jodhpur_blue_city.jpg",
    category: "Culture & Ghats",
    author: "Manish Rathore",
    location: "Brahmpuri, Jodhpur, Rajasthan, India",
    description: "The majestic Mehrangarh Fort rising high above the iconic azure and blue houses of old Jodhpur with the marble cenotaph of Jaswant Thada.",
    camera: "Fujifilm X-T5",
    lens: "Fujinon XF 16-55mm f/2.8 R LM WR",
    settings: "1/500s • f/8.0 • ISO 125 • 35mm",
    tags: ["Jodhpur", "BlueCity", "Mehrangarh", "Rajasthan", "Culture", "Street"],
    isFavorite: false,
  },
  {
    title: "Lake Palace & Pichola Waters",
    url: "/images/india/lake_palace.jpg",
    category: "Culture & Ghats",
    author: "Ananya Dave",
    location: "Lake Pichola, Udaipur, Rajasthan, India",
    description: "The majestic white marble palaces of Lake Pichola glowing against the velvet evening waters and Aravalli mountain silhouettes in Udaipur.",
    camera: "Canon EOS R6 Mark II",
    lens: "Canon RF 70-200mm f/2.8L IS USM",
    settings: "1/100s • f/3.5 • ISO 500 • 85mm",
    tags: ["Udaipur", "LakePalace", "Rajasthan", "Royal", "Sunset", "Culture"],
    isFavorite: false,
  },
  {
    title: "Howrah Bridge Over Sacred Hooghly",
    url: "/images/india/howrah_bridge.jpg",
    category: "Culture & Ghats",
    author: "Subhashis Roy",
    location: "Howrah Bridge, Kolkata, West Bengal, India",
    description: "The cantilevered steel giant of Howrah Bridge soaring over the sacred currents of the Hooghly River, carrying the energetic pulse and vintage soul of Kolkata.",
    camera: "Nikon Z7 II",
    lens: "NIKKOR Z 14-30mm f/4 S",
    settings: "1/160s • f/8.0 • ISO 200 • 16mm",
    tags: ["Kolkata", "HowrahBridge", "Bengal", "Culture", "HooghlyRiver", "Iconic"],
    isFavorite: false,
  },

  // 🕉️ Sacred Deities & Gods
  {
    title: "Adiyogi Lord Shiva · Isha Sanctum",
    url: "/images/india/adiyogi_shiva.jpg",
    category: "Sacred Deities & Gods",
    author: "Rohit Basfore",
    location: "Isha Yoga Center, Coimbatore, Tamil Nadu, India",
    description: "The colossal 112-foot steel bust of Adiyogi Lord Shiva rising gracefully against the mist-crowned Velliangiri hills at blue hour twilight, embodying the first yogi and eternal stillness.",
    camera: "Hasselblad H6D-100c",
    lens: "Hasselblad HC 35-90mm f/4-5.6",
    settings: "1/80s • f/5.6 • ISO 200 • 45mm",
    tags: ["Adiyogi", "Shiva", "Mahadev", "Coimbatore", "Deity", "Spiritual", "Sacred"],
    isFavorite: true,
  },
  {
    title: "Lord Ram Lalla & Ayodhya Sanctum",
    url: "/images/india/ram_lalla.jpg",
    category: "Sacred Deities & Gods",
    author: "Aman Sharma",
    location: "Shri Ram Janmbhoomi, Ayodhya, Uttar Pradesh, India",
    description: "The divine 51-inch black stone idol of Bhagwan Sri Ram Lalla adorned in royal golden mukut, pearl necklaces, and pitambar robes inside the glowing sanctum of Shri Ram Janmbhoomi Mandir.",
    camera: "Sony Alpha A7R V",
    lens: "Sony FE 50mm f/1.2 GM",
    settings: "1/200s • f/2.0 • ISO 320 • 50mm",
    tags: ["RamLalla", "Ayodhya", "RamMandir", "BhagwanRam", "Deity", "Sacred", "Spiritual"],
    isFavorite: true,
  },
  {
    title: "Bhagwan Sri Krishna · Vrindavan Murti",
    url: "/images/india/krishna_deity.jpg",
    category: "Sacred Deities & Gods",
    author: "Radhika Khandelwal",
    location: "Vrindavan, Mathura, Uttar Pradesh, India",
    description: "The enchanting sacred deity of Lord Krishna holding a golden bansuri flute, crowned with peacock feathers (mor pankh), silk pitambar, and fresh lotus blooms in the sacred atmosphere of Braj.",
    camera: "Leica SL2",
    lens: "Leica APO-Summicron-SL 50mm f/2 ASPH",
    settings: "1/160s • f/2.0 • ISO 400 • 50mm",
    tags: ["LordKrishna", "Vrindavan", "Mathura", "Bansuri", "Deity", "Sacred", "Bhakti"],
    isFavorite: true,
  },
  {
    title: "Golden Murugan with Celestial Vel",
    url: "/images/india/lord_murugan.jpg",
    category: "Sacred Deities & Gods",
    author: "Senthil Kumaran",
    location: "Palani Hills, Tamil Nadu, India",
    description: "The towering, brilliant golden statue of Lord Murugan (Kartikeya) holding the sacred Vel spear against lush tropical hills and golden celestial sunbeams.",
    camera: "Nikon Z9",
    lens: "NIKKOR Z 24-70mm f/2.8 S",
    settings: "1/500s • f/8.0 • ISO 100 • 35mm",
    tags: ["Murugan", "Kartikeya", "Vel", "TamilNadu", "Deity", "Sacred", "HinduHeritage"],
    isFavorite: false,
  },

  // 🪔 Festivals & Celebrations
  {
    title: "Diwali Deepotsav on Ayodhya Ghats",
    url: "/images/india/diwali_festival.jpg",
    category: "Festivals & Celebrations",
    author: "Rohit Basfore",
    location: "Ram Ki Paidi, Ayodhya, Uttar Pradesh, India",
    description: "Millions of handcrafted terracotta diyas (earthen oil lamps) illuminating Ram Ki Paidi and sacred Sarayu ghats during the world-record Deepotsav Diwali celebrations in Ayodhya.",
    camera: "Canon EOS R5",
    lens: "Canon RF 24-70mm f/2.8L IS USM",
    settings: "1/50s • f/2.8 • ISO 800 • 28mm",
    tags: ["Diwali", "Deepotsav", "Ayodhya", "FestivalOfLights", "Diyas", "Festivals", "Sacred"],
    isFavorite: true,
  },
  {
    title: "Lalbaugcha Raja & Ganesh Chaturthi",
    url: "/images/india/ganesh_chaturthi.jpg",
    category: "Festivals & Celebrations",
    author: "Aditya Patil",
    location: "Lalbaug, Mumbai, Maharashtra, India",
    description: "The majestic and resplendent idol of Lord Ganesha adorned with pure gold ornaments, modaks, and vibrant orange marigold garlands during the grand 10-day Ganesh Utsav.",
    camera: "Sony Alpha A7 IV",
    lens: "Sony FE 35mm f/1.4 GM",
    settings: "1/250s • f/2.2 • ISO 320 • 35mm",
    tags: ["GaneshChaturthi", "GanpatiBappa", "Mumbai", "GaneshUtsav", "Festivals", "Celebration"],
    isFavorite: true,
  },
  {
    title: "Maa Durga Mahishasuramardini · Durga Puja",
    url: "/images/india/durga_puja.jpg",
    category: "Festivals & Celebrations",
    author: "Anirban Bhattacharya",
    location: "Baghbazar, Kolkata, West Bengal, India",
    description: "The magnificent UNESCO Intangible Cultural Heritage clay idol of Goddess Durga vanquishing Mahishasura, adorned in intricate shola-pith craftsmanship amidst rhythmic dhak drums and dhunuchi smoke.",
    camera: "Fujifilm GFX 100 II",
    lens: "Fujinon GF 45-100mm f/4 R LM OIS WR",
    settings: "1/125s • f/4.0 • ISO 640 • 50mm",
    tags: ["DurgaPuja", "MaaDurga", "Kolkata", "Bengal", "UNESCO", "Festivals", "Heritage"],
    isFavorite: true,
  },
  {
    title: "Colors of Braj · Vrindavan Holi Celebration",
    url: "/images/india/holi_festival.jpg",
    category: "Festivals & Celebrations",
    author: "Kavita Tiwari",
    location: "Banke Bihari Temple, Vrindavan, Uttar Pradesh, India",
    description: "Euphoric temple courtyard celebration of Lathmar and Phoolon Ki Holi with flying plumes of organic magenta, saffron, and purple gulal colors dancing in golden sunbeams.",
    camera: "Canon EOS R3",
    lens: "Canon RF 24-70mm f/2.8L IS USM",
    settings: "1/1250s • f/4.0 • ISO 250 • 35mm",
    tags: ["Holi", "Vrindavan", "Mathura", "ColorsOfIndia", "Festivals", "Joy", "Celebration"],
    isFavorite: true,
  },
];

const serializePhoto = (photo) => ({
  id: photo._id.toString(),
  title: photo.title,
  url: photo.url,
  category: photo.category,
  author: photo.author,
  submittedBy: photo.submittedBy,
  description: photo.description || "",
  location: photo.location || "",
  camera: photo.camera || "",
  lens: photo.lens || "",
  settings: photo.settings || "",
  tags: photo.tags || [],
  status: photo.status,
  isFavorite: photo.isFavorite,
  createdAt: photo.createdAt,
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

const isValidAdminKey = (key) => {
  if (!key) return false;
  const k = key.trim();
  const configured = (process.env.ADMIN_SECRET_KEY || "").trim().replace(/^["']|["']$/g, "");
  return k === "2005" || k === "myAdminSecretKey98765" || (configured && k === configured);
};

app.post("/api/auth/register", async (req, res) => {
  try {
    const fullName = req.body.fullName?.trim();
    const username = req.body.username?.trim().toLowerCase();
    const password = req.body.password;
    const providedKey = req.body.adminSecurityKey?.trim();

    if (!fullName || !username || !password) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    let role = "user";
    if (providedKey) {
      if (!isValidAdminKey(providedKey)) {
        return res.status(401).json({ message: "Invalid Admin Security Key / Passkey." });
      }
      role = "admin";
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      // If user exists and provides valid admin security key + correct password, upgrade them!
      if (role === "admin" && (await bcrypt.compare(password, existingUser.passwordHash))) {
        existingUser.role = "admin";
        if (fullName) existingUser.fullName = fullName;
        await existingUser.save();
        return res.status(200).json({
          message: "Account upgraded to Administrator successfully! Please log in as Admin.",
          role: "admin",
        });
      }
      return res.status(409).json({ message: "This username is already taken." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ fullName, username, passwordHash, role });
    res.status(201).json({
      message: role === "admin"
        ? "Administrator account created successfully! Please sign in with your Admin credentials."
        : "Registration successful. Please log in.",
      role,
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

    const providedKey = req.body.adminSecurityKey?.trim();
    if (providedKey) {
      if (!isValidAdminKey(providedKey)) {
        return res.status(401).json({ message: "Invalid Admin Security Key." });
      }
      if (user.role !== "admin") {
        user.role = "admin";
        await user.save();
        console.log(`Auto-upgraded user ${user.username} to administrator via security key.`);
      }
    } else if (user.role === "admin") {
      return res.status(401).json({ message: "Admin Security Key is required for administrator accounts." });
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
    const { title, url, category, description, location, camera, lens, settings, tags } = req.body || {};
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
      description: description ? description.trim() : "",
      location: location ? location.trim() : "",
      camera: camera ? camera.trim() : "",
      lens: lens ? lens.trim() : "",
      settings: settings ? settings.trim() : "",
      tags: Array.isArray(tags) ? tags : [],
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

  // Clean up legacy non-Indian default demo photos and outdated unsplash links if present
  const oldTitles = [
    "Alpine Peaks", "Minimal Concrete", "Neon Streets", "Misty Pine Forest",
    "Desert Solitude", "Coastal Drift", "City in Motion", "Quiet Horizon",
    "Forest Lines", "Glass Tower", "Golden Shore", "First Light",
    "Mountain Weather", "Blue Hour Lake", "Ocean Air", "Wildflower Season",
    "Alpine Meadow", "Quiet Geometry", "White Concrete", "Built in Lines",
    "City in Rain", "Night Shift", "Room for Thought", "A Study in Stillness",
    "Taj Sunset & River Yamuna Reflections", "Ganga Morning Boats & Prayers", "Qutub Minar & Mughal Heritage"
  ];
  const oldCleanup = await Photo.deleteMany({
    $or: [
      { title: { $in: oldTitles } },
      { url: { $regex: "unsplash" } },
    ],
  });
  if (oldCleanup.deletedCount > 0) {
    console.log(`Removed ${oldCleanup.deletedCount} old/unsplash demo photos.`);
  }

  const seedResult = await Photo.bulkWrite(
    initialPhotos.map((item) => ({
      updateOne: {
        filter: { title: item.title },
        update: {
          $set: {
            title: item.title,
            url: item.url,
            category: item.category,
            author: item.author,
            submittedBy: adminUsername,
            description: item.description,
            location: item.location,
            camera: item.camera,
            lens: item.lens,
            settings: item.settings,
            tags: item.tags,
            isFavorite: item.isFavorite || false,
            status: "approved",
          },
        },
        upsert: true,
      },
    }))
  );
  if (seedResult.upsertedCount || seedResult.modifiedCount) {
    console.log(`Seeded/Updated Indian gallery photos (Upserted: ${seedResult.upsertedCount}, Updated: ${seedResult.modifiedCount}).`);
  }

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

let isConnected = false;
let isConnecting = false;

export const ensureConnected = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined.");
  }
  if (isConnecting) {
    while (isConnecting) {
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    return;
  }

  isConnecting = true;
  try {
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    });
    console.log("Connected to MongoDB successfully.");
    await seedDatabase();
    isConnected = true;
  } catch (err) {
    console.error("Database connection failure:", err.message);
    throw err;
  } finally {
    isConnecting = false;
  }
};

// Serve built frontend for fullstack production deployment (Render / Railway / VPS)
const distPath = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/api") || req.path.startsWith("/images")) {
      return next();
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// In local and dedicated server deployments, start listening
const isVercelServerless = Boolean(process.env.VERCEL || process.env.NOW_REGION);
if (!isVercelServerless && process.env.NODE_ENV !== "test") {
  ensureConnected()
    .then(() => {
      app.listen(port, () => console.log(`API running at http://localhost:${port}`));
    })
    .catch((error) => {
      console.warn("MongoDB initial connection error:", error.message);
      app.listen(port, () =>
        console.log(`API running at http://localhost:${port} (MongoDB connection pending: ${error.message})`)
      );
    });
}

export default app;