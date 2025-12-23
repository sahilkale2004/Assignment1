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
 * REGISTER
 */
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, aadhaar } = req.body;

    if (!fullName || !email || !password || !aadhaar) {
      return res.status(400).json({ message: "All fields required" });
    }

    const pwdAI = analyzePassword(password);
    if (pwdAI.strength === "Weak") {
      return res.status(400).json({
        message: "Weak password",
        passwordAI: pwdAI,
      });
    }

    const aadhaarAI = analyzeAadhaar(aadhaar);
    if (aadhaarAI.riskLevel === "HIGH") {
      return res.status(400).json({
        message: "High risk Aadhaar",
        aadhaarAI,
      });
    }

    if (await User.findOne({ email })) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      passwordHash,
      aadhaarEncrypted: encrypt(aadhaar),
      aiRiskLevel: aadhaarAI.riskLevel,
      aiScore: aadhaarAI.score,
    });

    res.status(201).json({
      message: "User registered",
      userId: user._id,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * LOGIN
 */
router.post("/login", async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PROFILE (NO Aadhaar leakage)
 */
router.get("/profile", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId).select("-passwordHash");

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    aiRiskLevel: user.aiRiskLevel,
    aiScore: user.aiScore,
  });
});

module.exports = router;
