const mongoose = require("mongoose");
// const { addBusdata } = require("../routes/addBusdata");

const BusSchema = new mongoose.Schema({
  source: { type: String, required: true },
  destination: { type: String, required: true },
  departureDate: { type:String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  time: { type: String, required: true },
  distance: { type: String, required: true },
  // image: { type: String } // Image URL
});
// addBusdata();
const Bus = mongoose.model("Bus", BusSchema);
module.exports = Bus;
