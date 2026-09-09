const express = require("express");
const compression = require("compression");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
require("dotenv").config();

const {
  isSupabaseConfigured,
  getCmsData,
  saveCmsData,
  getAdminUser,
  saveAdminUser,
  uploadImage,
  listImages,
  deleteImage,
} = require("./supabase");

const app = express();
app.use(compression());
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || "cafeemil_jwt_secret_token_valby_2025_secure_key";

// CORS configuration
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000,http://localhost:3005")
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-side proxy)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, "");
      if (
        allowedOrigins.includes(cleanOrigin) ||
        allowedOrigins.includes("*") ||
        cleanOrigin.includes("vercel.app") ||
        cleanOrigin.includes("cafeemil.dk")
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Multer in-memory upload handler
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/avif",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Filtypen ${file.mimetype} er ikke tilladt. Tilladte formater: JPG, PNG, WEBP, GIF, AVIF, SVG.`,
        ),
      );
    }
  },
});

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.headers["x-admin-token"]) {
    token = req.headers["x-admin-token"];
  }

  if (!token) {
    return res.status(401).json({ error: "Uautoriseret adgang. Log venligst ind." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Ugyldig eller udløbet session. Log venligst ind igen." });
  }
}

// ---------------------------------------------------------------------------
// Health & Status Routes
// ---------------------------------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Cafe Emil Node.js & Supabase Backend",
    health: "/api/health",
    cms: "/api/cms",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Cafe Emil Node.js & Supabase Backend",
    supabaseConnected: isSupabaseConfigured(),
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// Authentication Routes
// ---------------------------------------------------------------------------

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Brugernavn og adgangskode skal udfyldes" });
    }

    const trimmedUser = username.trim().toLowerCase();
    const isDefaultAdmin = trimmedUser === "admin" || trimmedUser === "admin@cafeemil.dk";

    // 1. Try to find user in Supabase
    let isValid = false;
    const dbUser = await getAdminUser(trimmedUser);

    if (dbUser && dbUser.password_hash) {
      isValid = await bcrypt.compare(password, dbUser.password_hash);
    } else if (isDefaultAdmin) {
      // Fallback default password
      isValid = password === "CafeEmil2025!";
    }

    if (!isValid) {
      return res.status(401).json({ error: "Ugyldigt brugernavn eller adgangskode" });
    }

    // Generate JWT token
    const token = jwt.sign({ username: trimmedUser, role: "admin" }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      message: "Login gennemført",
      token,
      user: { username: trimmedUser, role: "admin" },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Der opstod en fejl under login" });
  }
});

app.get("/api/auth/verify", authenticateToken, (req, res) => {
  res.json({
    authenticated: true,
    user: req.user,
  });
});

app.put("/api/auth/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const username = req.user.username || "admin";

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Både nuværende og ny adgangskode skal angives" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Ny adgangskode skal være mindst 8 tegn" });
    }

    // Verify current password
    const dbUser = await getAdminUser(username);
    let isCurrentValid = false;
    if (dbUser && dbUser.password_hash) {
      isCurrentValid = await bcrypt.compare(currentPassword, dbUser.password_hash);
    } else {
      isCurrentValid = currentPassword === "CafeEmil2025!";
    }

    if (!isCurrentValid) {
      return res.status(400).json({ error: "Nuværende adgangskode er forkert" });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    await saveAdminUser(username, newHash);

    const newToken = jwt.sign({ username, role: "admin" }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      message: "Adgangskoden er opdateret",
      token: newToken,
    });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({ error: "Kunne ikke ændre adgangskode" });
  }
});

// ---------------------------------------------------------------------------
// CMS Content Routes
// ---------------------------------------------------------------------------

// Public: Get all CMS data
app.get("/api/cms", async (req, res) => {
  try {
    const data = await getCmsData();
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json(data);
  } catch (error) {
    console.error("Fetch CMS error:", error);
    res.status(500).json({ error: "Failed to fetch CMS data" });
  }
});

// Protected: Update CMS data
app.post("/api/cms", authenticateToken, async (req, res) => {
  try {
    const updated = await saveCmsData(req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Save CMS error:", error);
    res.status(500).json({ error: error.message || "Failed to update CMS data" });
  }
});

app.put("/api/cms", authenticateToken, async (req, res) => {
  try {
    const updated = await saveCmsData(req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Save CMS error:", error);
    res.status(500).json({ error: error.message || "Failed to update CMS data" });
  }
});

// ---------------------------------------------------------------------------
// Image Upload Routes (Supabase Storage)
// ---------------------------------------------------------------------------

// Protected: Upload image to Supabase Storage
app.post("/api/upload", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Ingen billedfil modtaget" });
    }

    const result = await uploadImage(req.file.originalname, req.file.buffer, req.file.mimetype);

    res.json({
      success: true,
      url: result.url,
      filename: result.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message || "Der opstod en fejl under upload af billedet" });
  }
});

// Protected: List uploaded images
app.get("/api/upload", authenticateToken, async (req, res) => {
  try {
    const files = await listImages();
    res.json({ files });
  } catch (error) {
    console.error("List uploads error:", error);
    res.status(500).json({ error: "Kunne ikke hente uploadede billeder" });
  }
});

// Protected: Delete uploaded image
app.delete("/api/upload/:filename", authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    await deleteImage(filename);
    res.json({ success: true, message: "Billede slettet" });
  } catch (error) {
    console.error("Delete upload error:", error);
    res.status(500).json({ error: error.message || "Kunne ikke slette billedet" });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`✓ Café Emil Backend Server is running on http://localhost:${PORT}`);
  console.log(
    `  Supabase Status: ${isSupabaseConfigured() ? "Connected" : "Not configured (using local fallback)"}`,
  );
});
