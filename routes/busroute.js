const express = require("express");
const router = express.Router();
const Bus = require("../models/bus");
const moment = require("moment");

router.get("/search", async (req, res) => {
  try {
    const { source, destination, departureDate } = req.query;

    if (!source || !destination || !departureDate) {
      return res.status(400).json({ message: "Please provide source, destination, and departureDate" });
    }

    // Fetch buses 
    const buses = await Bus.find({
      source: source,
      destination:destination,
      departureDate:departureDate
    });

    console.log("Query Parameters:", { source, destination, departureDate });
    console.log("Buses Found:", buses);

    // Check if buses are found
    if (!buses.length) {
      return res.status(404).json({ message: "No buses available for the selected route on the selected date" });
    }

    // Return found buses
    res.json(buses);
  } catch (error) {
    console.error("Error Fetching Buses:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});





//Get all bus routes
router.get("/buses", async (req, res) => {
  try {
    const buses = await Bus.find({ source: "Mumbai" });
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//Create a new bus route
router.post("/bus", async (req, res) => {
  try {
    const { source, destination, departureDate, price, duration, time, distance } = req.body;
    if (!source || !destination || !departureDate || !price || !duration || !time || !distance) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const newBus = new Bus(req.body);
    await newBus.save();
    res.status(201).json({ message: "Bus route added successfully", bus: newBus });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//Update a bus route
router.put("/bus/:id", async (req, res) => {
  try {
    const updatedBus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBus) {
      return res.status(404).json({ message: "Bus not found" });
    }
    res.json({ message: "Bus updated successfully", bus: updatedBus });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete a bus route
router.delete("/bus/:id", async (req, res) => {
  try {
    const deletedBus = await Bus.findByIdAndDelete(req.params.id);
    if (!deletedBus) {
      return res.status(404).json({ message: "Bus not found" });
    }
    res.json({ message: "Bus deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
