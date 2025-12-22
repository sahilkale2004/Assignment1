require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

/**
 * =========================
 * MIDDLEWARES
 * =========================
 */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

/**
 * =========================
 * ROUTES
 * =========================
 */
app.get("/", (req, res) => {
  res.send("✅ Secure Digital Identity Vault API running");
});

app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);

/**
 * =========================
 * SERVER
 * =========================
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
