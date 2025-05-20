const express = require("express");
const router = express.Router();
const moment = require("moment");
const { ensureAuthenticated, ensureAdmin } = require("../middleware/auth");
const Appointment = require("../models/Appointment");
const Pet = require("../models/Pet");
const Service = require("../models/Service");

// @desc    Show appointment booking form
// @route   GET /appointments/book
router.get("/book", ensureAuthenticated, async (req, res) => {
  try {
    // Get user's pets
    const pets = await Pet.find({ user: req.user._id }).lean();
    const selectedPet = req.query.pet || null;

    // Get active services, sorted by order and category
    const services = await Service.find({ isActive: true })
      .sort({ order: 1, category: 1 })
      .lean();

    // Group services by category
    const servicesByCategory = services.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    }, {});

    res.render("appointments/book", {
      title: "Book Appointment",
      pets,
      servicesByCategory,
      selectedPet,
      selectedService: null,
      moment
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// @desc    Show all user appointments
// @route   GET /appointments
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    console.log('Fetching appointments for user:', req.user.id);
    
    // If user is admin, show all appointments
    const query = req.user.isAdmin ? {} : { user: req.user.id };
    
    const appointments = await Appointment.find(query)
      .populate("pet")
      .populate("service")
      .populate("user", "name email")
      .sort({ date: "desc" })
      .lean();

    console.log('Found appointments:', appointments.length);

    // Format dates for display
    appointments.forEach((appointment) => {
      appointment.formattedDate = moment(appointment.date).format(
        "MMMM Do YYYY, h:mm a"
      );
    });

    res.render("appointments/index", {
      title: "My Appointments",
      appointments,
      success_msg: req.session.success_msg,
      error_msg: req.session.error_msg,
      moment,
      isAdmin: req.user.isAdmin
    });

    // Clear session messages after rendering
    delete req.session.success_msg;
    delete req.session.error_msg;
  } catch (err) {
    console.error('Error fetching appointments:', err);
    req.session.error_msg = "Error loading appointments: " + err.message;
    res.render("error/500");
  }
});

// @desc    Process appointment booking
// @route   POST /appointments
router.post("/", ensureAuthenticated, async (req, res) => {
  try {
    const { pet, service, appointment_date, time, notes } = req.body;
    console.log('Appointment booking attempt:', { pet, service, appointment_date, time, notes });
    
    // Validate pet ownership
    const petDoc = await Pet.findById(pet);
    if (!petDoc || petDoc.user.toString() !== req.user.id) {
      console.log('Invalid pet selection:', { petId: pet, userId: req.user.id });
      req.session.error_msg = "Invalid pet selection";
      return res.redirect("/appointments/book");
    }

    // Combine date and time
    const date = new Date(`${appointment_date}T${time}`);
    console.log('Combined date:', date);
    
    // Validate if date is valid
    if (isNaN(date.getTime())) {
      console.log('Invalid date format:', { appointment_date, time });
      req.session.error_msg = "Invalid date or time format";
      return res.redirect("/appointments/book");
    }

    // Create appointment
    const appointment = await Appointment.create({
      user: req.user.id,
      pet,
      service,
      date,
      notes,
      status: "scheduled",
    });
    console.log('Appointment created successfully:', appointment._id);

    req.session.success_msg = "Appointment booked successfully";
    res.redirect("/appointments");
  } catch (err) {
    console.error('Error in appointment creation:', err);
    req.session.error_msg = "Error booking appointment: " + err.message;
    res.redirect("/appointments/book");
  }
});

// @desc    Show edit appointment page
// @route   GET /appointments/:id/edit
router.get("/:id/edit", ensureAuthenticated, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).lean();

    if (!appointment) {
      return res.render("error/404");
    }

    // Check ownership
    if (appointment.user.toString() !== req.user.id) {
      res.redirect("/appointments");
    } else {
      // Check if appointment is in the past
      if (new Date(appointment.date) < new Date()) {
        req.session.error_msg = "Can't edit appointments that are in the past";
        return res.redirect("/appointments");
      }

      // Only allow editing for scheduled appointments
      if (appointment.status !== "scheduled") {
        req.session.error_msg =
          "Can't edit cancelled or completed appointments";
        return res.redirect("/appointments");
      }

      // Get user's pets and services for the form
      const pets = await Pet.find({ user: req.user._id }).lean();
      const services = await Service.find().lean();

      // Format date for input fields
      const formattedDate = moment(appointment.date).format("YYYY-MM-DD");
      const formattedTime = moment(appointment.date).format("HH:mm");
      res.render("appointments/edit", {
        title: "Edit Appointment",
        appointment,
        pets,
        services,
        formattedDate,
        formattedTime,
        moment
      });
    }
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// @desc    Show single appointment
// @route   GET /appointments/:id
router.get("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("pet")
      .populate("service")
      .populate("user", "name email")
      .lean();

    if (!appointment) {
      return res.render("error/404");
    }

    // Check appointment owner or admin status
    if (appointment.user._id.toString() !== req.user.id && !req.user.isAdmin) {
      req.session.error_msg = "Not authorized to view this appointment";
      return res.redirect("/appointments");
    }

    // Format date for display
    appointment.formattedDate = moment(appointment.date).format(
      "MMMM Do YYYY, h:mm a"
    );

    res.render("appointments/show", {
      title: "Appointment Details",
      appointment,
      isAdmin: req.user.isAdmin,
      PATHS: require('../config/paths')
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// @desc    Update appointment
// @route   PUT /appointments/:id
router.put("/:id", ensureAuthenticated, async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.render("error/404");
    }

    // Check ownership
    if (appointment.user.toString() !== req.user.id) {
      res.redirect("/appointments");
    } else {
      // Validate pet ownership
      if (req.body.pet) {
        const petDoc = await Pet.findById(req.body.pet);
        if (!petDoc || petDoc.user.toString() !== req.user._id) {
          req.session.error_msg = "Invalid pet selection";
          return res.redirect(`/appointments/${req.params.id}/edit`);
        }
      }

      // Combine date and time if provided
      if (req.body.appointmentDate && req.body.appointmentTime) {
        req.body.date = new Date(
          `${req.body.appointmentDate}T${req.body.appointmentTime}`
        );
        delete req.body.appointmentDate;
        delete req.body.appointmentTime;
      }

      // Update appointment
      appointment = await Appointment.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        { new: true, runValidators: true }
      );

      req.session.success_msg = "Appointment updated successfully";
      res.redirect("/appointments");
    }
  } catch (err) {
    console.error(err);
    req.session.error_msg = "Error updating appointment";
    res.redirect(`/appointments/${req.params.id}/edit`);
  }
});

// @desc    Cancel appointment
// @route   PUT /appointments/:id/cancel
router.put("/:id/cancel", ensureAuthenticated, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.render("error/404");
    }

    // Check ownership or admin status
    if (appointment.user.toString() !== req.user.id && !req.user.isAdmin) {
      req.session.error_msg = "Not authorized to cancel this appointment";
      return res.redirect("/appointments");
    }

    // Check if appointment is in the past
    if (new Date(appointment.date) < new Date()) {
      req.session.error_msg = "Can't cancel appointments that are in the past";
      return res.redirect("/appointments");
    }

    // Update status to cancelled
    await Appointment.findOneAndUpdate(
      { _id: req.params.id },
      { status: "cancelled" }
    );

    req.session.success_msg = "Appointment cancelled successfully";
    res.redirect("/appointments");
  } catch (err) {
    console.error(err);
    req.session.error_msg = "Error cancelling appointment";
    res.redirect("/appointments");
  }
});

module.exports = router;
