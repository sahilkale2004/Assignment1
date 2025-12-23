const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    aadhaarEncrypted: { type: String, required: true },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    aiRiskLevel: { type: String },
    aiScore: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
