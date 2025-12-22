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
 * =========================
 * REGISTER
 * =========================
 */
router.post("/register", async (req, res) => {
  try {
    console.log("📩 REGISTER HIT:", req.body);

    const { fullName, email, password, aadhaar } = req.body;

    if (!fullName || !email || !password || !aadhaar) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 🤖 AI Aadhaar validation
    const ai = analyzeAadhaar(aadhaar);

    if (ai.riskLevel === "HIGH") {
      return res.status(400).json({
        message: "High risk Aadhaar",
        aiAnalysis: ai,
      });
    }

    // Existing user check
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      fullName,
      email,
      passwordHash,
      aadhaarEncrypted: encrypt(aadhaar),
      aiRiskLevel: ai.riskLevel,
      aiScore: ai.riskScore, // ✅ FIXED
      role: "user",
    });

    console.log("✅ USER CREATED:", user.email);

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
      aiAnalysis: ai,
    });
  } catch (err) {
    console.error("❌ REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * =========================
 * LOGIN
 * =========================
 */
router.post("/login", async (req, res) => {
  try {
    console.log("📩 LOGIN HIT:", req.body.email);

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ USER NOT FOUND");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    console.log("🔐 PASSWORD MATCH:", match);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("✅ LOGIN SUCCESS:", user.email);

    res.json({ token });
  } catch (err) {
    console.error("❌ LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * =========================
 * PROFILE
 * =========================
 */
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      aadhaar: decrypt(user.aadhaarEncrypted),
      aiSecurityStatus: user.aiRiskLevel,
      aiScore: user.aiScore,
    });
  } catch (err) {
    console.error("❌ PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
