const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  busId: { type: mongoose.Schema.Types.ObjectId, ref: "Bus", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ticketNumber: { type: Number, unique: true },
  seats: [{ type: Number, required: true }],
  passengers: [
    {
      name: { type: String, required: true },
      age: { type: Number, required: true },
      gender: { type: String, required: true },
      mobile: { type: String, required: true },
    }
  ],
  totalFare: { type: Number, required: true },
  status: { type: String, enum: ["confirmed", "canceled"], default: "confirmed" },
  bookedAt: { type: Date, default: Date.now }
});

// ✅ Auto-increment ticket number before saving
bookingSchema.pre("save", async function (next) {
  if (!this.ticketNumber) {
    try {
      // Fetch the last ticket number from the database
      const lastBooking = await this.constructor.findOne().sort({ ticketNumber: -1 }).select("ticketNumber");

      // Set the next ticket number (start from 10000000 if none exist)
      this.ticketNumber = lastBooking && lastBooking.ticketNumber ? lastBooking.ticketNumber + 1 : 67291254;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
