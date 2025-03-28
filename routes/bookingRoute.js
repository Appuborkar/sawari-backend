const express = require("express");
const router = express.Router();
const Bus = require("../models/bus");
const User = require("../models/User")
const Booking = require("../models/booking");
const authMiddleware = require("../middleware/authMiddleware");

// Book or Confirm Seats
router.post("/:busId/confirm",authMiddleware, async (req, res) => {
  const { seat, passengers } = req.body; // 'seat' received from frontend
  const userId = req.user.id; 

  if (!seat || !Array.isArray(seat) || seat.length === 0) {
    return res.status(400).json({ message: "Seats array is required" });
  }

  try {
    const bus = await Bus.findById(req.params.busId);
    if (!bus) return res.status(404).json({ message: "Bus not found" });

    let totalFare = 0;
    let updatedSeats = [];

    seat.forEach((seatNumber) => {
      const seatObj = bus.seat.find((s) => s.seatNumber === seatNumber);
      if (seatObj) {
        if (passengers) {
          if (seatObj.status === "temp" || seatObj.status === "available") {
            seatObj.status = "booked";
            totalFare += bus.price; // Ensure `bus.price` is per seat
            updatedSeats.push(seatNumber); // Store seat numbers correctly
          } else {
            return res
              .status(400)
              .json({ message: `Seat ${seatNumber} is already booked` });
          }
        } else {
          if (seatObj.status === "available") {
            seatObj.status = "temp";
            updatedSeats.push(seatNumber);
          }
        }
      }
    });

    await bus.save();

    if (passengers) {
      const newBooking = new Booking({
        busId: req.params.busId,
        userId: userId, 
        seats: updatedSeats,
        passengers,
        totalFare,
        status: "confirmed",
      });

      await newBooking.save();
      return res
        .status(200)
        .json({ message: "Booking successful", bookingId: newBooking._id });
    }

    res.json({ message: "Seats temporarily booked" });
  } catch (error) {
    console.error("Error processing booking:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



// Release Seats
router.post("/:busId/release", async (req, res) => {
  const { busId, seat} = req.body;

  try {
    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ message: "Bus not found" });

    seat.forEach(seatNumber => {
      const seat = bus.seat.find(s => s.seatNumber === seatNumber);
      if (seat && seat.status === "temp") seat.status = "available";
    });

    await bus.save();
    res.status(200).json({ message: "Seats released" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Route to Update Booking by ID
router.put("/update/:bookingId", async (req, res) => {
  const { passengers, seats, totalFare } = req.body;

  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (passengers) booking.passengers = passengers;
    if (seats) booking.seats = seats;
    if (totalFare) booking.totalFare = totalFare;

    await booking.save();
    res.status(200).json({ message: "Booking updated successfully", booking });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Route to Delete Booking by ID
router.delete("/delete/:bookingId", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await Booking.findByIdAndDelete(req.params.bookingId);

    // Reset the seat status to "available" after deleting the booking
    const bus = await Bus.findById(booking.busId);
    if (bus) {
      booking.seats.forEach(seatNumber => {
        const seat = bus.seat.find(s => s.seatNumber === seatNumber);
        if (seat) seat.status = "available";
      });
      await bus.save();
    }

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// Fetch ticket details by booking ID
router.get("/ticket/:bookingId", async (req, res) => {
  try {
    const ticket = await Booking.findById(req.params.bookingId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(200).json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// fetch booking for specific user
router.get('/viewticket', authMiddleware, async (req, res) => {
  try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      const tickets = await Booking.find({ userId: req.user.id }); // Fetch all bookings for the user
      res.json(tickets);
  } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
  }
});

// Route to fetch all bookings
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("busId") // Fetch full bus details
      .populate("userId"); // Fetch full user details

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching booking details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});





module.exports = router;
