const express = require("express");
const router = express.Router();
const { ensureAuthenticated, ensureGuest } = require("../middleware/auth");
const Pet = require("../models/Pet");
const Service = require("../models/Service");
const Appointment = require("../models/Appointment");
const Gallery = require("../models/Gallery");
const Setting = require("../models/Setting");
const moment = require("moment");
const Feedback = require("../models/Feedback");

// @desc    Landing page
// @route   GET /
router.get("/", async(req, res) => {
  try {
    // Get all active media items, sorted by order and creation date
    const gallery = await Gallery.find({ 
      isActive: true 
    })
    .sort({ order: 1, createdAt: -1 })
    .lean();

    // Separate photos and videos
    const photos = gallery.filter(item => item.type === 'image');
    const videos = gallery.filter(item => item.type === 'video');

    let settings = await Setting.findOne().lean();

    if (!settings) {
      settings = { phone: "", email: "", hours: "" };
    }

    // Get active services, sorted by order
    const services = await Service.find({ 
      isActive: true 
    })
    .sort({ order: 1, createdAt: -1 })
    .lean();

    res.render("index", {
      layout: "layouts/landing",
      title: "Welcome",
      photos,
      videos,
      settings,
      services
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// @desc    Dashboard
// @route   GET /dashboard
router.get("/dashboard", ensureAuthenticated, async (req, res) => {
  try {
    // Get user's pets
    const pets = await Pet.find({ user: req.user.id }).lean();

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

// @desc    Feedback form
// @route   GET /feedback
router.get("/feedback", async (req, res) => {
    try {
        let settings = await Setting.findOne().lean();

        if (!settings) {
            settings = { phone: "", email: "", hours: "" };
        }

        res.render("feedback", {
            title: "Leave a Feedback",
            settings
        });
    } catch (err) {
        console.error(err);
        res.render("error/500");
    }
});

// @desc    Process feedback form
// @route   POST /feedback
router.post("/feedback", async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        const newFeedback = new Feedback({
            name,
            email,
            phone,
            message
        });
        await newFeedback.save();
        res.redirect("/thankyou");
    } catch (err) {
        console.error(err);
        res.render("error/500");
    }
});

// @desc    Thank you page
// @route   GET /thankyou
router.get("/thankyou", (req, res) => {
    res.render("thankyou", {
        title: "Thank You"
    });
});

module.exports = router;
