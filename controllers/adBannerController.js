// /controllers/adBannerController.js
const asyncHandler = require('express-async-handler');
const AdBanner = require('../models/adBannerModel');

const BANNER_LIMIT = 3;

// @desc    Create a new ad banner
// @route   POST /api/v1/banners
// @access  Private/ContentManager
const createAdBanner = asyncHandler(async (req, res) => {
  const { title, image, link, details } = req.body;

  const count = await AdBanner.countDocuments();
  if (count >= BANNER_LIMIT) {
    const oldestAd = await AdBanner.findOne().sort({ createdAt: 1 });
    if (oldestAd) {
      await AdBanner.deleteOne({ _id: oldestAd._id });
    }
  }

  const adBanner = await AdBanner.create({ title, image, link, details });
  res.status(201).json(adBanner);
});

// @desc    Get all ad banners
// @route   GET /api/v1/banners
// @access  Public
const getAdBanners = asyncHandler(async (req, res) => {
  const banners = await AdBanner.find({}).sort({ createdAt: -1 });
  res.json(banners);
});

// @desc    Update an ad banner
// @route   PUT /api/v1/banners/:id
// @access  Private/ContentManager
const updateAdBanner = asyncHandler(async (req, res) => {
  const { title, image, link, details } = req.body;
  const banner = await AdBanner.findById(req.params.id);

  if (banner) {
    banner.title = title || banner.title;
    banner.image = image || banner.image;
    banner.link = link || banner.link;
    banner.details = details || banner.details;
    const updatedBanner = await banner.save();
    res.json(updatedBanner);
  } else {
    res.status(404);
    throw new Error('Ad banner not found');
  }
});

// @desc    Delete an ad banner
// @route   DELETE /api/v1/banners/:id
// @access  Private/ContentManager
const deleteAdBanner = asyncHandler(async (req, res) => {
  const banner = await AdBanner.findById(req.params.id);
  if (banner) {
    await AdBanner.deleteOne({ _id: banner._id });
    res.json({ message: 'Ad banner removed' });
  } else {
    res.status(404);
    throw new Error('Ad banner not found');
  }
});

module.exports = { createAdBanner, getAdBanners, updateAdBanner, deleteAdBanner };