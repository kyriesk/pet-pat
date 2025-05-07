const express = require("express");
const router = express.Router();
const { ensureAuthenticated, ensureGuest } = require("../middleware/auth");
const Pet = require("../models/Pet");
const Service = require("../models/Service");
const Appointment = require("../models/Appointment");
const moment = require("moment");

// @desc    Landing page
// @route   GET /
router.get("/", ensureGuest, (req, res) => {
  res.render("index", {
    layout: "layouts/landing",
    title: "Welcome",
  });
});

// @desc    Dashboard
// @route   GET /dashboard
router.get("/dashboard", ensureAuthenticated, async (req, res) => {
  try {
    // Get user's pets
    const pets = await Pet.find({ owner: req.user.id }).lean();

    // Get user's upcoming appointments
    const appointments = await Appointment.find({
      user: req.user.id,
      date: { $gte: new Date() },
      status: "scheduled",
    })
      .populate("pet")
      .populate("service")
      .sort({ date: "asc" })
      .limit(5)
      .lean();

    // Format dates for display
    appointments.forEach((appointment) => {
      appointment.formattedDate = moment(appointment.date).format(
        "MMMM Do YYYY, h:mm a"
      );
    });

    // Get featured services
    const services = await Service.find()
      .sort({ price: "desc" })
      .limit(3)
      .lean();

    res.render("dashboard", {
      title: "Dashboard",
      pets,
      appointments,
      services,
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

module.exports = router;
