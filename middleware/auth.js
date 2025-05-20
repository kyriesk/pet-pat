// Protects routes that require authentication
const PATHS = require('../config/paths');

const redirectPaths = {
  login: PATHS.AUTH.LOGIN,
  dashboard: PATHS.DASHBOARD
};

module.exports = {
  // Check if user is logged in
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error", "Please log in to access this resource");
    res.redirect(redirectPaths.login);
  },

  // Check if user is admin
  ensureAdmin: function (req, res, next) {
    if (req.isAuthenticated() && req.user && req.user.isAdmin) {
      return next();
    }
    req.flash("error", "Access denied. Admin privileges required.");
    res.redirect(redirectPaths.dashboard);
  },

  // Check if user is not logged in (for guest pages)book.ejs
  ensureGuest: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect(redirectPaths.dashboard);
  },

  // For optionally showing content to authenticated users
  forwardAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect(redirectPaths.dashboard);
  },

  // check roles
  ensureRole: function (role) {
    return function (req, res, next) {
      if (
        req.isAuthenticated() &&
        req.user &&
        req.user.role?.toLowerCase() === role.toLowerCase()
      ) {
        return next();
      }
      req.flash("error", `Access denied. ${role} role required.`);
      res.redirect(redirectPaths.dashboard);
    };
  }
};
