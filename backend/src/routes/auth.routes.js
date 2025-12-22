console.log("✅ auth.routes.js loaded");

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const { encrypt, decrypt } = require("../utils/crypto");
const { analyzeAadhaar } = require("../utils/aiValidator");

const router = express.Router();

/**
 * REGISTER
 */
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, aadhaar } = req.body;

    if (!fullName || !email || !password || !aadhaar) {
      return res.status(400).json({ message: "All fields required" });
    }

    const ai = analyzeAadhaar(aadhaar);
    if (ai.riskLevel === "HIGH") {
      return res.status(400).json({ message: "High risk Aadhaar", ai });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      passwordHash,
      aadhaarEncrypted: encrypt(aadhaar),
      aiRiskLevel: ai.riskLevel,
      aiScore: ai.score,
      role: "user",
    });

    res.status(201).json({ message: "User registered", userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * LOGIN
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

/**
 * PROFILE
 */
router.get("/profile", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    aadhaar: decrypt(user.aadhaarEncrypted),
    aiRiskLevel: user.aiRiskLevel,
    aiScore: user.aiScore,
  });
});

module.exports = router;
