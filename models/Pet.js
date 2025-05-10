const mongoose = require("mongoose");

const PetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    lowercase: true,
    enum: ["dog", "cat", "bird", "rabbit", "other"],
  },
  breed: {
    type: String,
    trim: true,
  },
  age: {
    type: Number,
    min: 0,
  },
  gender: {
    type: String,
    enum: ["male", "female", "unknown"],
    default: "unknown",
    lowercase: true,
  },
  weight: {
    type: Number,
    min: 0,
  },
  healthInfo: {
    vaccinations: Boolean,
    conditions: [String],
    allergies: [String],
    medications: [String],
  },
  temperament: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  image: {
    type: String,
    default: "/img/default-pet.png",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Pet", PetSchema);
