const express = require("express");
const {
  loginUser,
  signUpUser,
} = require("../controllers/usercontroller");

const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

const User = require("../models/UsersModel");

const router = express.Router();


// ================= PUBLIC ROUTES =================

// 🔐 LOGIN
router.post("/login", loginUser);


// ================= PROTECTED ROUTES =================

// apply auth to all routes below
router.use(requireAuth);


// ================= ADMIN ROUTES =================

// ➕ CREATE USER (ADMIN ONLY)
router.post("/signup", requireRole("admin"), signUpUser);


// 📥 GET ALL USERS (ADMIN ONLY)
router.get("/", requireRole("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// ❌ DELETE USER (ADMIN ONLY)
router.delete("/:id", requireRole("admin"), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// ================= CURRENT USER =================

// 👤 GET LOGGED-IN USER DETAILS
router.get("/me", (req, res) => {
  res.status(200).json(req.user); // {_id, role}
});


module.exports = router;