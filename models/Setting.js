const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  phone: String,
  email: String,
  hours: String,
  address: String,
  facebook: String,
  instagram: String,
  wechat: String,
  bannerUrl: String
});

module.exports = mongoose.model('Setting', SettingSchema);


