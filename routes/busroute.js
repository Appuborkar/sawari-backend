const express = require("express");
const router = express.Router();
const Bus = require("../models/bus");
const mongoose = require("mongoose");

// Middleware to validate ObjectId
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.busId)) {
    return res.status(400).json({ message: "Invalid bus ID" });
  }
  next();
};

// Fetch buses based on source, destination, and date
router.get("/search", async (req, res) => {
  try {
    const { source, destination, departureDate } = req.query;
    if (!source || !destination || !departureDate) {
      return res.status(400).json({ message: "Please provide source, destination, and departureDate" });
    }
    const buses = await Bus.find({ source, destination, departureDate });
    if (!buses.length) {
      return res.status(404).json({ message: "No buses available for the selected route on the selected date" });
    }
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all bus routes
router.get("/buses", async (req, res) => {
  try {
    const buses = await Bus.find();
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// fetch the bus through busId
router.get("/details/:busId", async (req, res) => {
  try {
    const busId = req.params.busId;
    const bus = await Bus.findById(busId);

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    res.json(bus);
  } catch (error) {
    console.error("Error fetching bus details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Create a new bus with seats
router.post("/newbus", async (req, res) => {
  try {
    const { source, destination, departureDate, price, boardingTime, alightingTime, duration, distance } = req.body;
    if (!source || !destination || !departureDate || !price || !boardingTime || !alightingTime || !duration || !distance) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }
    const seats = Array.from({ length: 40 }, (_, i) => ({
      seatNumber: i + 1,
      status: "available"
    }));
    const newBus = new Bus({
      source,
      destination,
      departureDate,
      price,
      boardingTime,
      alightingTime,
      duration,
      distance,
      seat: seats,
      totalSeats: 40,
    });
    await newBus.save();
    res.status(201).json({ message: "Bus and seats added successfully", bus: newBus });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Fetch seats for a specific bus
router.get("/:busId/seats", validateObjectId, async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.busId);
    if (!bus) return res.status(404).json({ message: "Bus not found" });
    res.json(bus.seat);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get fare price for a specific bus
router.get("/:busId/price", validateObjectId, async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.busId);
    if (!bus) return res.status(404).json({ error: "Bus not found" });
    res.json({ price: bus.price });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch fare" });
  }
});

// Temporarily hold a seat
router.post("/:busId/temp-hold", validateObjectId, async (req, res) => {
  const { seatNumber } = req.body;
  if (!seatNumber) return res.status(400).json({ message: "Seat number is required" });
  try {
    const bus = await Bus.findById(req.params.busId);
    if (!bus) return res.status(404).json({ message: "Bus not found" });
    const seat = bus.seat.find((s) => s.seatNumber === seatNumber);
    if (!seat || seat.status !== "available") {
      return res.status(400).json({ message: "Seat not available" });
    }
    seat.status = "temp";
    await bus.save();
    setTimeout(async () => {
      await Bus.updateOne(
        { _id: req.params.busId, "seat.seatNumber": seatNumber, "seat.status": "temp" },
        { $set: { "seat.$.status": "available" } }
      );
    }, 30000);
    res.json({ message: "Seat temporarily held" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Confirm seat booking
router.post("/:busId/book", validateObjectId, async (req, res) => {
  const { seats } = req.body;
  if (!seats || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ message: "Seats array is required" });
  }
  try {
    const bus = await Bus.findById(req.params.busId);
    if (!bus) return res.status(404).json({ message: "Bus not found" });
    seats.forEach(seatNumber => {
      const seat = bus.seat.find(s => s.seatNumber === seatNumber);
      if (seat && seat.status === "temp") {
        seat.status = "booked";
      }
    });
    await bus.save();
    res.json({ message: "Booking confirmed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete a bus route
router.delete("/delete/:id", async (req, res) => {
  try {
    const deletedBus = await Bus.findByIdAndDelete(req.params.id);
    if (!deletedBus) return res.status(404).json({ message: "Bus not found" });
    res.json({ message: "Bus deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
module.exports = router;
