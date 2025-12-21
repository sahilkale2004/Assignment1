const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");

const router = express.Router();

/**
 * 👑 ADMIN – Get all users
 */
router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT id, full_name, email, role, created_at FROM users"
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Admin users error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
