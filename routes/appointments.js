const express = require("express");
const router = express.Router();
const moment = require("moment");
const { ensureAuthenticated } = require("../middleware/auth");
const Appointment = require("../models/Appointment");
const Pet = require("../models/Pet");
const Service = require("../models/Service");

// @desc    Show appointment booking form
// @route   GET /appointments/book
router.get("/book", ensureAuthenticated, async (req, res) => {
  try {
    // Get user's pets
    const pets = await Pet.find({ owner: req.user.id }).lean();

    // Get available services
    const services = await Service.find().lean();

    res.render("appointments/book", {
      title: "Book Appointment",
      pets,
      services,
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// @desc    Process appointment booking
// @route   POST /appointments
router.post("/", ensureAuthenticated, async (req, res) => {
  try {
    const { pet, service, date, notes } = req.body;

    // Validate pet ownership
    const petDoc = await Pet.findById(pet);
    if (!petDoc || petDoc.owner.toString() !== req.user.id) {
      req.session.error_msg = "Invalid pet selection";
      return res.redirect("/appointments/book");
    }

    // Create appointment
    await Appointment.create({
      user: req.user.id,
      pet,
      service,
      date: new Date(date),
      notes,
      status: "scheduled",
    });

    req.session.success_msg = "Appointment booked successfully";
    res.redirect("/appointments");
  } catch (err) {
    console.error(err);
    req.session.error_msg = "Error booking appointment";
    res.redirect("/appointments/book");
  }
});

// @desc    Show all user appointments
// @route   GET /appointments
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id })
      .populate("pet")
      .populate("service")
      .sort({ date: "desc" })
      .lean();

    // Format dates for display
    appointments.forEach((appointment) => {
      appointment.formattedDate = moment(appointment.date).format(
        "MMMM Do YYYY, h:mm a"
      );
    });

    res.render("appointments/index", {
      title: "My Appointments",
      appointments,
    });
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
      .lean();

    if (!appointment) {
      return res.render("error/404");
    }

    // Check appointment owner
    if (appointment.user.toString() !== req.user.id) {
      res.redirect("/appointments");
    } else {
      // Format date for display
      appointment.formattedDate = moment(appointment.date).format(
        "MMMM Do YYYY, h:mm a"
      );

      res.render("appointments/show", {
        title: "Appointment Details",
        appointment,
      });
    }
  } catch (err) {
    console.error(err);
    res.render("error/500");
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
      const pets = await Pet.find({ owner: req.user.id }).lean();
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
      });
    }
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
        if (!petDoc || petDoc.owner.toString() !== req.user.id) {
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

    // Check ownership
    if (appointment.user.toString() !== req.user.id) {
      res.redirect("/appointments");
    } else {
      // Check if appointment is in the past
      if (new Date(appointment.date) < new Date()) {
        req.session.error_msg =
          "Can't cancel appointments that are in the past";
        return res.redirect("/appointments");
      }

      // Update status to cancelled
      await Appointment.findOneAndUpdate(
        { _id: req.params.id },
        { status: "cancelled" }
      );

      req.session.success_msg = "Appointment cancelled successfully";
      res.redirect("/appointments");
    }
  } catch (err) {
    console.error(err);
    req.session.error_msg = "Error cancelling appointment";
    res.redirect("/appointments");
  }
});

module.exports = router;
