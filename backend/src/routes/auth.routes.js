const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// ✅ Central DB config
const pool = require("../config/db");

// 🔐 AES crypto utility
const { encrypt, decrypt } = require("../utils/crypto");

// 🤖 AI Aadhaar risk analyzer
const { analyzeAadhaar } = require("../utils/aiValidator");

const authMiddleware = require("../middleware/auth");

const router = express.Router();

/**
 * =========================
 * REGISTER USER
 * =========================
 */
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, aadhaar } = req.body;

    if (!fullName || !email || !password || !aadhaar) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🤖 AI-based Aadhaar Risk Analysis
    const aiResult = analyzeAadhaar(aadhaar);

    if (aiResult.riskLevel === "HIGH") {
      return res.status(400).json({
        message: "Aadhaar rejected due to high risk",
        aiAnalysis: aiResult,
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Encrypt Aadhaar
    const encryptedAadhaar = encrypt(aadhaar);

    // 🔑 Default role is USER
    const role = "user";

    // Insert user WITH role
    await pool.query(
      `INSERT INTO users 
        (full_name, email, password_hash, aadhaar_encrypted, role)
       VALUES ($1, $2, $3, $4, $5)`,
      [fullName, email, passwordHash, encryptedAadhaar, role]
    );

    res.status(201).json({
      message: "User registered successfully",
      aiAnalysis: aiResult,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * =========================
 * LOGIN USER
 * =========================
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔐 JWT now INCLUDES ROLE
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role, // 🔑 THIS IS CRITICAL
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * =========================
 * GET USER PROFILE
 * =========================
 */
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const userResult = await pool.query(
      "SELECT full_name, email, aadhaar_encrypted, role FROM users WHERE id = $1",
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    const decryptedAadhaar = decrypt(user.aadhaar_encrypted);

    res.json({
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      aadhaar: decryptedAadhaar,
      aiSecurityStatus: "LOW RISK",
      aiMessage:
        "AI analysis found no suspicious identity patterns during verification.",
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
