const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../middleware/auth");
const Pet = require("../models/Pet");
const Appointment = require("../models/Appointment");

// @desc    Show all user's pets
// @route   GET /pets
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const pets = await Pet.find({ user: req.user.id }).lean();

    res.render("pets/index", {
      title: "My Pets",
      pets,
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// @desc    Show add pet form
// @route   GET /pets/add
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("pets/add", {
    title: "Add Pet",
  });
});

// @desc    Process add pet form
// @route   POST /pets
router.post("/", ensureAuthenticated, async (req, res) => {
  try {
    req.body.user = req.user.id;

    // Handle possible array data coming from form
    if (typeof req.body["healthInfo.conditions"] === "string") {
      req.body["healthInfo.conditions"] = req.body["healthInfo.conditions"]
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (typeof req.body["healthInfo.allergies"] === "string") {
      req.body["healthInfo.allergies"] = req.body["healthInfo.allergies"]
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (typeof req.body["healthInfo.medications"] === "string") {
      req.body["healthInfo.medications"] = req.body["healthInfo.medications"]
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    // Convert checkbox value to boolean
    req.body["healthInfo.vaccinations"] =
      req.body["healthInfo.vaccinations"] === "on" ||
      req.body["healthInfo.vaccinations"] === true;

    await Pet.create(req.body);
    req.session.success_msg = "Pet added successfully";
    res.redirect("/pets");
  } catch (err) {
    console.error(err);
    req.session.error_msg = "Error adding pet";
    res.render("pets/add", {
      title: "Add Pet",
      body: req.body,
    });
  }
});

// @desc    Show edit pet form
// @route   GET /pets/:id/edit
router.get("/:id/edit", ensureAuthenticated, async (req, res) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).lean();

    if (!pet) {
      return res.render("error/404");
    }

    res.render("pets/edit", {
      title: `Edit ${pet.name}`,
      pet,
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// @desc    Update pet
// @route   PUT /pets/:id
router.put("/:id", ensureAuthenticated, async (req, res) => {
  try {
    let pet = await Pet.findById(req.params.id).lean();

    if (!pet) {
      return res.render("error/404");
    }

    // Check for pet ownership
    if (pet.user.toString() !== req.user.id) {
      req.session.error_msg = "Not authorized";
      return res.redirect("/pets");
    }

    // Handle possible array data coming from form
    if (typeof req.body["healthInfo.conditions"] === "string") {
      req.body["healthInfo.conditions"] = req.body["healthInfo.conditions"]
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (typeof req.body["healthInfo.allergies"] === "string") {
      req.body["healthInfo.allergies"] = req.body["healthInfo.allergies"]
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (typeof req.body["healthInfo.medications"] === "string") {
      req.body["healthInfo.medications"] = req.body["healthInfo.medications"]
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    // Convert checkbox value to boolean
    req.body["healthInfo.vaccinations"] =
      req.body["healthInfo.vaccinations"] === "on" ||
      req.body["healthInfo.vaccinations"] === true;

    pet = await Pet.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    });

    req.session.success_msg = "Pet updated successfully";
    res.redirect("/pets");
  } catch (err) {
    console.error(err);
    req.session.error_msg = "Error updating pet";
    res.redirect(`/pets/${req.params.id}/edit`);
  }
});

// @desc    Delete pet
// @route   DELETE /pets/:id
router.delete("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.render("error/404");
    }

    // Check for pet ownership
    if (pet.user.toString() !== req.user.id) {
      req.session.error_msg = "Not authorized";
      return res.redirect("/pets");
    }

    // Check if pet has any appointments
    const appointments = await Appointment.find({ pet: req.params.id });

    if (appointments.length > 0) {
      req.session.error_msg =
        "Cannot delete a pet with appointments. Please cancel all appointments first.";
      return res.redirect("/pets");
    }

    await pet.deleteOne()
    req.session.success_msg = "Pet removed successfully";
    res.redirect("/pets");
  } catch (err) {
    console.error(err);
    req.session.error_msg = "Error removing pet";
    res.redirect("/pets");
  }
});

// @desc    Show single pet
// @route   GET /pets/:id
router.get("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).lean();

    if (!pet) {
      return res.render("error/404");
    }

    // Get pet's appointments
    const appointments = await Appointment.find({ pet: req.params.id })
      .populate("service")
      .sort({ appointmentDate: 1 })
      .lean();

    res.render("pets/show", {
      title: pet.name,
      pet,
      appointments,
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

module.exports = router;
