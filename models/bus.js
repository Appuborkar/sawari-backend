const mongoose = require("mongoose");

const SeatSchema = new mongoose.Schema({
  seatNumber: { type: Number, required: true },
  status: { type: String, enum: ["available", "temp", "booked"], default: "available" },
});

const BusSchema = new mongoose.Schema({
  source: { type: String, required: true },
  destination: { type: String, required: true },
  departureDate: { type: String, required: true },
  price: { type: Number, required: true },
  boardingTime: { type: String, required: true },
  alightingTime: { type: String, required: true },
  duration: { type: String, required: true },
  distance: { type: String, required: true },
  seat: [SeatSchema],  // Array of seats
  totalSeats: { type: Number, default: 40 },
});

const Bus = mongoose.model("Bus", BusSchema);
module.exports = Bus;
