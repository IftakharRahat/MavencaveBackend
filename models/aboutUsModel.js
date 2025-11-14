const mongoose = require('mongoose');

const aboutUsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
}, { timestamps: true });

const AboutUs = mongoose.model('AboutUs', aboutUsSchema);
module.exports = AboutUs;