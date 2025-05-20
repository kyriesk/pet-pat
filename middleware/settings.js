const Setting = require('../models/Setting');

// Middleware to add settings to all routes
const settingsMiddleware = async (req, res, next) => {
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
    
    res.locals.settings = settings;
    next();
  } catch (err) {
    console.error('Settings Middleware Error:', err);
    next();
  }
};

module.exports = settingsMiddleware; 