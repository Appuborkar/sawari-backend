const mongoose = require("mongoose");

const PlaceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true }
});

const Place = mongoose.model("Place", PlaceSchema);
module.exports = Place;
