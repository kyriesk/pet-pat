const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  url: String,
  type: { type: String, enum: ['image', 'video'] },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  order: { type: Number, default: 0 },  // Control display order
  isActive: { type: Boolean, default: true },  // Control visibility
  category: { type: String, default: 'general' },  // Category for grouping
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gallery', GallerySchema);

