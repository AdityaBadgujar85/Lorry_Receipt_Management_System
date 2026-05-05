const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const helmet = require("helmet");

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 📁 UPLOAD FOLDER SETUP
// ==========================================

// Base uploads folder
const uploadDir = path.join(process.cwd(), "uploads");

// Subfolder for trip data
const tripDataDir = path.join(uploadDir, "tripdata");

// Ensure folders exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(tripDataDir)) {
  fs.mkdirSync(tripDataDir, { recursive: true });
}

// ==========================================
// 🔐 SECURITY & MIDDLEWARE
// ==========================================

app.use(helmet());
app.use(cors());
app.use(express.json());

// ==========================================
// 📂 SECURE FILE ACCESS
// ==========================================

app.get("/file/:folder/:filename", (req, res) => {
  try {
    const { folder, filename } = req.params;

    // 🚫 Prevent path traversal attacks
    if (folder.includes("..") || filename.includes("..")) {
      return res.status(400).json({
        success: false,
        message: "Invalid file path",
      });
    }

    const filePath = path.join(uploadDir, folder, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Optional debug
    console.log("📂 Serving file:", filePath);

    res.sendFile(filePath);
  } catch (error) {
    console.error("❌ File Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Error retrieving file",
    });
  }
});

// ==========================================
// 📦 ROUTES
// ==========================================

const lrRoutes = require("./routes/LR_Routes");
const tripRoutes = require("./routes/Trip_Data_Routes");
const userRoutes = require("./routes/users");
const billingRoutes = require("./routes/BillingRoutes");
const expenseRoutes = require("./routes/ExpenseRoutes");

app.use("/lrdata", lrRoutes);
app.use("/tripdata", tripRoutes);
app.use("/users", userRoutes);
app.use("/billing", billingRoutes);
app.use("/expense", expenseRoutes);

// ==========================================
// ❤️ HEALTH CHECK
// ==========================================

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ==========================================
// ❌ 404 HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ==========================================
// ❌ GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ==========================================
// 🚀 DATABASE + SERVER START
// ==========================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ DB Connection Error:", error.message);
  });