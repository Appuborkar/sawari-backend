// const express = require("express");
// const router = express.Router();
// const Seat = require("../models/seat");
// const Bus = require("../models/bus");
// const mongoose = require("mongoose");

// // Middleware to validate ObjectId
// const validateObjectId = (req, res, next) => {
//   if (!mongoose.Types.ObjectId.isValid(req.params.busId)) {
//     return res.status(400).json({ message: "Invalid bus ID" });
//   }
//   next();
// };

// // Get all seats for a bus
// router.get("/:busId/seats", validateObjectId, async (req, res) => {
//   try {
//     const seats = await Seat.find({ busId: req.params.busId });
//     res.json(seats);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

// // Get selected seats for a bus
// router.get("/:busId/selected-seats", validateObjectId, async (req, res) => {
//   try {
//     const selectedSeats = await Seat.find({ busId: req.params.busId, status: "temp" }).select("seatNumber");
//     res.json(selectedSeats.map(seat => seat.seatNumber));
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch selected seats" });
//   }
// });

// // Get fare price for a specific bus
// router.get("/:busId/price", validateObjectId, async (req, res) => {
//   try {
//     const bus = await Bus.findById(req.params.busId);
//     if (!bus) return res.status(404).json({ error: "Bus not found" });

//     res.json({ price: bus.price });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch fare" });
//   }
// });

// // Temporarily hold a seat (expires in 5 minutes)
// router.post("/:busId/temp-hold", validateObjectId, async (req, res) => {
//   const { seatNumber } = req.body;
//   if (!seatNumber) return res.status(400).json({ message: "Seat number is required" });

//   try {
//     const seat = await Seat.findOne({ busId: req.params.busId, seatNumber });

//     if (!seat || seat.status !== "available") {
//       return res.status(400).json({ message: "Seat not available" });
//     }

//     await Seat.updateOne({ busId: req.params.busId, seatNumber }, { $set: { status: "temp" } });

//     // Auto-release the seat after 5 minutes
//     setTimeout(async () => {
//       await Seat.updateOne(
//         { busId: req.params.busId, seatNumber, status: "temp" },
//         { $set: { status: "available" } }
//       );
//     }, 5 * 60 * 1000);

//     res.json({ message: "Seat temporarily held" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

// // Confirm seat booking
// router.post("/:busId/book", validateObjectId, async (req, res) => {
//   const { seats } = req.body;

//   if (!seats || !Array.isArray(seats) || seats.length === 0) {
//     return res.status(400).json({ message: "Seats array is required" });
//   }

//   try {
//     const seatUpdates = await Seat.updateMany(
//       { busId: req.params.busId, seatNumber: { $in: seats }, status: "temp" },
//       { $set: { status: "booked" } }
//     );

//     if (seatUpdates.matchedCount !== seats.length) {
//       return res.status(400).json({ message: "Some seats were not booked" });
//     }

//     res.json({ message: "Booking confirmed" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

// module.exports = router;
