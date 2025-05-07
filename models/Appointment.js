const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pet",
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    default: "scheduled",
    enum: ["scheduled", "completed", "cancelled"],
    lowercase: true,
  },
  notes: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual for formatted date
AppointmentSchema.virtual("formattedDate").get(function () {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return this.date.toLocaleDateString("en-US", options);
});

// Ensure virtual fields are serialized when converted to JSON
AppointmentSchema.set("toJSON", { virtuals: true });
AppointmentSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Appointment", AppointmentSchema);
