require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api/admin", require("./routes/admin.routes"));


// Health check
app.get("/", (req, res) => {
  res.send("Secure Digital Identity Vault API running");
});

// Routes
app.use("/api", require("./routes/auth.routes"));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
