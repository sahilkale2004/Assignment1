const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const { encrypt } = require("../utils/crypto");
const { analyzeAadhaar } = require("../utils/aiValidator");
const { analyzePassword } = require("../utils/passwordAI");

const router = express.Router();

/**
 * =========================
 * REGISTER
 * =========================
 */
router.post("/register", async (req, res) => {
  try {
    let { fullName, email, password, aadhaar } = req.body;

    // 🔒 Normalize input
    fullName = fullName?.trim();
    email = email?.trim().toLowerCase();
    aadhaar = aadhaar?.trim();

    if (!fullName || !email || !password || !aadhaar) {
      return res.status(400).json({ message: "All fields required" });
    }

    /* ---------------- PASSWORD AI ---------------- */
    const pwdAI = analyzePassword(password);
    if (pwdAI.strength === "Weak") {
      return res.status(400).json({
        message: "Weak password",
        passwordAI: pwdAI,
      });
    }

    /* ---------------- AADHAAR AI ---------------- */
    const aadhaarAI = analyzeAadhaar(aadhaar);
    if (aadhaarAI.riskLevel === "HIGH") {
      return res.status(400).json({
        message: "High risk Aadhaar",
        aadhaarAI,
      });
    }

    /* ---------------- DUPLICATE USER ---------------- */
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    /* ---------------- PASSWORD HASH ---------------- */
    const passwordHash = await bcrypt.hash(password, 10);

    /* ---------------- AADHAAR ENCRYPTION ---------------- */
    let encryptedAadhaar;
    try {
      encryptedAadhaar = encrypt(aadhaar);
    } catch (cryptoErr) {
      console.error("❌ AADHAAR ENCRYPTION FAILED:", cryptoErr);
      return res.status(500).json({
        message: "Encryption failure",
      });
    }

    /* ---------------- CREATE USER ---------------- */
    const user = await User.create({
      fullName,
      email,
      passwordHash,
      aadhaarEncrypted: encryptedAadhaar,
      aiRiskLevel: aadhaarAI.riskLevel,
      aiScore: aadhaarAI.score,
      role: "user",
    });

    console.log("✅ USER REGISTERED:", user.email);

    return res.status(201).json({
      message: "User registered",
      userId: user._id,
    });
  } catch (err) {
    console.error("❌ REGISTER ERROR (FATAL):", err);
    return res.status(500).json({
      message: "Server error during registration",
    });
  }
});

/**
 * =========================
 * LOGIN
 * =========================
 */
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email?.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("✅ LOGIN SUCCESS:", user.email);

    return res.json({ token });
  } catch (err) {
    console.error("❌ LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
});

/**
 * =========================
 * PROFILE
 * =========================
 */
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      aiRiskLevel: user.aiRiskLevel,
      aiScore: user.aiScore,
    });
  } catch (err) {
    console.error("❌ PROFILE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
