const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true,unique: true},
  password: { type: String, required: true },
});

// Hash password before saving
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Admin = mongoose.model("Admin", AdminSchema);
module.exports = Admin;

// const updateBooking = async (bookingId, updatedData) => {
//   try {
//     const response = await fetch(`http://localhost:5000/api/update/${bookingId}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(updatedData),
//     });
//     const result = await response.json();
//     console.log(result);
//   } catch (error) {
//     console.error("Error updating booking:", error);
//   }
// };

// const deleteBooking = async (bookingId) => {
//   try {
//     const response = await fetch(`http://localhost:5000/api/delete/${bookingId}`, {
//       method: "DELETE",
//     });
//     const result = await response.json();
//     console.log(result);
//   } catch (error) {
//     console.error("Error deleting booking:", error);
//   }
// };
