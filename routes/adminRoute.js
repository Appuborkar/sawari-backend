const express = require("express");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();
const Admin = require("../models/Admin");

// Admin Registration
router.post("http/register", async (req, res) => {
    const { email, password } = req.body;
    try {
      let admin = await Admin.findOne({ email });
      if (admin) return res.status(400).json({ message: "Admin already exists" });
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      admin = new Admin({ email, password: hashedPassword });
      await admin.save();
  
      res.json({ message: "Admin registered successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });
  

// Admin Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id }, "secretkey", { expiresIn: "1h" });
    res.json({ token, admin: { id: admin._id, email: admin.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Middleware to Verify Token
const authMiddleware = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).json({ message: "Access denied" });
  try {
    const decoded = jwt.verify(token, "secretkey");
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

// Protected Admin Route
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ message: "Welcome to the admin dashboard" });
});

module.exports = router;