const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const Service = require('../models/Service');
const Gallery = require('../models/Gallery');
const Setting = require('../models/Setting');

// GET /admin
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort({ order: 1, createdAt: -1 });
    const gallery = await Gallery.find();
    let settings = await Setting.findOne();

    if (!settings) {
      settings = await Setting.create({
        phone: '',
        email: '',
        hours: '',
        bannerUrl: ''
      });
    }

    res.render('admin', {
      services: services || [],
      gallery: gallery || [],
      settings
    });
  } catch (err) {
    console.error('Admin Page Error:', err);
    res.render('error/500');
  }
});

// POST /admin/services/add
router.post('/services/add', async (req, res) => {
  try {
    const { name, description, price, duration, category, order, isActive } = req.body;
    await Service.create({
      name,
      description,
      price,
      duration,
      category,
      order: order || 0,
      isActive: isActive === 'on'
    });
    req.flash('success', 'Service added successfully');
  } catch (err) {
    console.error('Add Service Error:', err);
    req.flash('error', 'Error adding service');
  }
  res.redirect('/admin');
});

// GET /admin/services/edit/:id
router.get('/services/edit/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    res.render('services/edit', { 
      title: `Edit ${service.name}`,
      service 
    });
  } catch (err) {
    console.error('Edit Service Error:', err);
    req.flash('error', 'Error loading service');
    res.redirect('/admin');
  }
});

// POST /admin/services/edit/:id
router.post('/services/edit/:id', async (req, res) => {
  try {
    const { name, description, price, duration, category, order, isActive } = req.body;
    await Service.findByIdAndUpdate(req.params.id, {
      name,
      description,
      price,
      duration,
      category,
      order: order || 0,
      isActive: isActive === 'on'
    });
    req.flash('success', 'Service updated successfully');
  } catch (err) {
    console.error('Update Service Error:', err);
    req.flash('error', 'Error updating service');
  }
  res.redirect('/admin');
});

// POST /admin/services/delete/:id
router.post('/services/delete/:id', async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    req.flash('success', 'Service deleted successfully');
  } catch (err) {
    console.error('Delete Service Error:', err);
    req.flash('error', 'Error deleting service');
  }
  res.redirect('/admin');
});

// POST /admin/gallery/upload
router.post('/gallery/upload', upload.array('media'), async (req, res) => {
  try {
    const { titles, descriptions, categories } = req.body;
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const type = file.mimetype.startsWith('video') ? 'video' : 'image';
      
      await Gallery.create({
        url: '/uploads/' + file.filename,
        type,
        title: titles?.[i] || '',
        description: descriptions?.[i] || '',
        category: categories?.[i] || 'general',
        order: i
      });
    }
    
    req.flash('success', 'Media uploaded successfully');
  } catch (err) {
    console.error('Upload Error:', err);
    req.flash('error', 'Error uploading media');
  }
  res.redirect('/admin');
});

// POST /admin/gallery/update/:id
router.post('/gallery/update/:id', async (req, res) => {
  try {
    const { title, description, category, order, isActive } = req.body;
    await Gallery.findByIdAndUpdate(req.params.id, {
      title,
      description,
      category,
      order,
      isActive: isActive === 'on'
    });
    req.flash('success', 'Gallery item updated successfully');
  } catch (err) {
    console.error('Update Error:', err);
    req.flash('error', 'Error updating gallery item');
  }
  res.redirect('/admin');
});

// POST /admin/gallery/delete/:id
router.post('/gallery/delete/:id', async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    req.flash('success', 'Gallery item deleted successfully');
  } catch (err) {
    console.error('Delete Error:', err);
    req.flash('error', 'Error deleting gallery item');
  }
  res.redirect('/admin');
});

// POST /admin/settings
router.post('/settings', upload.single('banner'), async (req, res) => {
  try {
    const { 
      phone, 
      email, 
      hours, 
      address
    } = req.body;

    const updateData = { 
      phone, 
      email, 
      hours, 
      address
    };

    if (req.file) {
      updateData.bannerUrl = '/uploads/' + req.file.filename;
    }

    await Setting.findOneAndUpdate({}, updateData, { 
      upsert: true,
      new: true,
      runValidators: true
    });

    req.flash('success', 'Settings updated successfully');
  } catch (err) {
    console.error('Settings Update Error:', err);
    req.flash('error', 'Error updating settings');
  }
  res.redirect('/admin');
});

module.exports = router;

