const express = require("express");
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require("../middleware/auth");
const Service = require("../models/Service");
const Appointment = require("../models/Appointment");
const Setting = require("../models/Setting");
const multer = require("multer");
const path = require("path");

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/services')
    },
    filename: function (req, file, cb) {
        cb(null, 'service-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// Check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// @desc    Show all services
// @route   GET /services
router.get("/", async (req, res) => {
  try {
    const services = await Service.find({ isActive: true })
      .sort("price")
      .lean();

    let settings = await Setting.findOne().lean();
    if (!settings) {
      settings = {
        phone: '',
        email: '',
        hours: '',
        address: '',
        facebook: '',
        instagram: '',
        wechat: ''
      };
    }

    res.render("services/index", {
      title: "Our Services",
      services,
      settings
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// @desc    Show add service form (admin only)
// @route   GET /services/add
router.get("/add", ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    let settings = await Setting.findOne().lean();
    if (!settings) {
      settings = {
        phone: '',
        email: '',
        hours: '',
        address: '',
        facebook: '',
        instagram: '',
        wechat: ''
      };
    }

    res.render("services/add", {
      title: "Add Service",
      settings
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// @desc    Process add service form (admin only)
// @route   POST /services
router.post("/", ensureAuthenticated, ensureAdmin, upload.single('image'), async (req, res) => {
    try {
        const serviceData = { ...req.body };
        if (req.file) {
            serviceData.image = '/uploads/services/' + req.file.filename;
        }
        await Service.create(serviceData);
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
    let settings = await Setting.findOne().lean();
    
    if (!settings) {
      settings = {
        phone: '',
        email: '',
        hours: '',
        address: '',
        facebook: '',
        instagram: '',
        wechat: ''
      };
    }

    if (!service) {
      return res.render("error/404");
    }

    res.render("services/edit", {
      title: `Edit ${service.name}`,
      service,
      settings
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// @desc    Update service (admin only)
// @route   PUT /services/:id
router.put("/:id", ensureAuthenticated, ensureAdmin, upload.single('image'), async (req, res) => {
    try {
        let service = await Service.findById(req.params.id).lean();

        if (!service) {
            return res.render("error/404");
        }

        const serviceData = { ...req.body };
        if (req.file) {
            serviceData.image = '/uploads/services/' + req.file.filename;
        }

        service = await Service.findOneAndUpdate({ _id: req.params.id }, serviceData, {
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
    let settings = await Setting.findOne().lean();
    
    if (!settings) {
      settings = {
        phone: '',
        email: '',
        hours: '',
        address: '',
        facebook: '',
        instagram: '',
        wechat: ''
      };
    }

    if (!service) {
      return res.render("error/404");
    }

    res.render("services/show", {
      title: service.name,
      service,
      user: req.user,
      settings
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

module.exports = router;
