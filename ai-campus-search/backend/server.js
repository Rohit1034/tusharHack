require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");

const app = express();

// Enable CORS for frontend
app.use(cors({
  origin: "*"
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", authRoutes);

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Serve index.html for all routes (for SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));

// API health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date() });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));