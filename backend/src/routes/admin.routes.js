const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const User = require("../models/User");

const router = express.Router();

/**
 * GET ALL USERS (ADMIN ONLY)
 */
router.get("/users", auth, admin, async (req, res) => {
  const users = await User.find().select("-passwordHash -aadhaarEncrypted");
  res.json(users);
});

module.exports = router;
