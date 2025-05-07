const express = require("express");
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require("../middleware/auth");
const Service = require("../models/Service");
const Appointment = require("../models/Appointment");

// @desc    Show all services
// @route   GET /services
router.get("/", async (req, res) => {
  try {
    const services = await Service.find({ isActive: true })
      .sort("price")
      .lean();

    res.render("services/index", {
      title: "Our Services",
      services,
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// @desc    Show add service form (admin only)
// @route   GET /services/add
router.get("/add", ensureAuthenticated, ensureAdmin, (req, res) => {
  res.render("services/add", {
    title: "Add Service",
  });
});

// @desc    Process add service form (admin only)
// @route   POST /services
router.post("/", ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    await Service.create(req.body);
    req.session.success_msg = "Service added successfully";
    res.redirect("/services");
  } catch (err) {
    console.error(err);
    req.session.error_msg = "Error adding service";
    res.render("services/add", {
      title: "Add Service",
      body: req.body,
    });
  }
});

// @desc    Show edit service form (admin only)
// @route   GET /services/:id/edit
router.get("/:id/edit", ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).lean();

    if (!service) {
      return res.render("error/404");
    }

    res.render("services/edit", {
      title: `Edit ${service.name}`,
      service,
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// @desc    Update service (admin only)
// @route   PUT /services/:id
router.put("/:id", ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    let service = await Service.findById(req.params.id).lean();

    if (!service) {
      return res.render("error/404");
    }

    service = await Service.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    });

    req.session.success_msg = "Service updated successfully";
    res.redirect("/services");
  } catch (err) {
    console.error(err);
    req.session.error_msg = "Error updating service";
    res.redirect(`/services/${req.params.id}/edit`);
  }
});

// @desc    Delete service (admin only)
// @route   DELETE /services/:id
router.delete("/:id", ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.render("error/404");
    }

    // Check if there are any appointments associated with this service
    const appointments = await Appointment.countDocuments({
      service: req.params.id,
    });

    if (appointments > 0) {
      // Instead of deleting, mark as inactive
      service.isActive = false;
      await service.save();
      req.session.success_msg = "Service marked as inactive";
    } else {
      await service.remove();
      req.session.success_msg = "Service removed successfully";
    }

    res.redirect("/services");
  } catch (err) {
    console.error(err);
    req.session.error_msg = "Error removing service";
    res.redirect("/services");
  }
});

// @desc    Show single service
// @route   GET /services/:id
router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).lean();

    if (!service) {
      return res.render("error/404");
    }

    res.render("services/show", {
      title: service.name,
      service,
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

module.exports = router;
