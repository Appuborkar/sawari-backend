const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require('path');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function (req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ success: false, error: "Access Denied: No token provided" });
  }

  try {
    const extractedToken = token.replace("Bearer ", ""); // Ensure only token is passed
    const decoded = jwt.verify(extractedToken, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    return res.status(403).json({ success: false, error: "Invalid Token" });
  }
};
