const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config({ path: "../.env" }); // ✅ FIXED

const User = require("./UsersModel");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const hashedPassword = await bcrypt.hash("admin@1234", 10);

    const existing = await User.findOne({ email: "admin@gmail.com" });

    if (existing) {
      console.log("⚠️ Admin already exists");
      process.exit();
    }

    await User.create({
      username: "admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ Admin created successfully");
    process.exit();

  } catch (err) {
    console.log(err);
    process.exit(1);
  }
})();