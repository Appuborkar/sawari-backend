const express = require("express");
const Place = require("../models/place");
const router = express.Router();

// Get all places for dropdown
router.get("/", async (req, res) => {
  try {
    const places = await Place.find().sort({ name: 1 });
    res.json(places);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
