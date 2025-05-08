const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const passportConfig = require("../config/passport");
const { ensureAuthenticated, ensureGuest } = require("../middleware/auth");
const User = require("../models/User");

// Initialize passport configuration
passportConfig(passport);

// @desc    Show Register page
// @route   GET /users/register
router.get("/register", ensureGuest, (req, res) => {
  res.render("users/register", {
    title: "Register",
  });
});

// @desc    Process Register form
// @route   POST /users/register
router.post("/register", ensureGuest, async (req, res) => {
  const { name, email, password, password2, phone } = req.body;
  let errors = [];

  // Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all required fields" });
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  // Check password length
  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("users/register", {
      title: "Register",
      errors,
      name,
      email,
      phone,
    });
  } else {
    try {
      // Check if email exists
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        errors.push({ msg: "Email is already registered" });
        res.render("users/register", {
          title: "Register",
          errors,
          name,
          email,
          phone,
        });
      } else {
        // Create new user
        const newUser = new User({
          name,
          email,
          password,
          phone,
        });

        // Save user
        await newUser.save();
        req.session.success_msg = "You are now registered and can log in";
        res.redirect("/users/login");
      }
    } catch (err) {
      console.error(err);
      res.render("error/500");
    }
  }
});

// @desc    Show Login page
// @route   GET /users/login
router.get("/login", ensureGuest, (req, res) => {
  res.render("users/login", {
    title: "Login",
  });
});

// @desc    Process Login form
// @route   POST /users/login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("error", info.message);
      return res.redirect("/users/login");
    }
    req.logIn(user, (err) => {
      
      if (err) {
        return next(err);
      }
      console.log("req.logIn", err, user, info);
      return res.redirect("/dashboard");
    });
  })(req, res, next);
});

// @desc    Logout User
// @route   GET /users/logout
router.get("/logout", ensureAuthenticated, (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.success_msg = "You are logged out";
    res.redirect("/users/login");
  });
});

// @desc    Show Profile page
// @route   GET /users/profile
router.get("/profile", ensureAuthenticated, (req, res) => {
  res.render("users/profile", {
    title: "My Profile",
  });
});

// @desc    Update Profile
// @route   PUT /users/profile
router.put("/profile", ensureAuthenticated, async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    // Check if email is already taken by another user
    if (email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        req.session.error_msg = "That email is already in use";
        return res.redirect("/users/profile");
      }
    }

    // Update user
    await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone, address },
      { new: true, runValidators: true }
    );

    req.session.success_msg = "Profile updated successfully";
    res.redirect("/users/profile");
  } catch (err) {
    console.error(err);
    req.session.error_msg = "Error updating profile";
    res.redirect("/users/profile");
  }
});

module.exports = router;
