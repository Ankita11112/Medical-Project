const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/Userr");

const JWT_SECRET = process.env.JWT_SECRET || "secretkey"; // ⚡ move to .env

// ================= Signup =================
router.post("/signup", async (req, res) => {
  const { username, password, role } = req.body;
  console.log("Signup request body:", req.body);

  try {
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashed, role });
    await newUser.save();

    console.log("User created:", newUser);
    res.json({ message: "User registered successfully", role: newUser.role });
  } catch (err) {
    console.error("Signup error:", err.message);

    if (err.code === 11000) {
      return res.status(400).json({ error: "Username already exists" });
    }
    res.status(500).json({ error: "Database error during signup" });
  }
});

// ================= Login =================
router.post("/login", async (req, res) => {
  const { username, password, role } = req.body;
  console.log("Login request body:", req.body);

  try {
    const user = await User.findOne({ username, role });
    if (!user) {
      console.log("No user found");
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("Login success, token created");
    res.json({ token, role: user.role, expiresIn: 3600 });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed. Try again." });
  }
});

module.exports = router;
