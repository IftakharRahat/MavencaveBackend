// /models/adBannerModel.js
const mongoose = require('mongoose');

const adBannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true }, // URL to the image
  link: { type: String, required: true },  // URL the banner links to
  details: { type: String },
}, { timestamps: true });

const AdBanner = mongoose.model('AdBanner', adBannerSchema);
module.exports = AdBanner;