const asyncHandler = require('express-async-handler');
const AboutUs = require('../models/aboutUsModel');

const createAboutUs = asyncHandler(async (req, res) => {
  const { title, content, image } = req.body;
  const aboutUs = await AboutUs.create({ title, content, image });
  res.status(201).json(aboutUs);
});

const getAboutUs = asyncHandler(async (req, res) => {
  const aboutUs = await AboutUs.find({});
  res.json(aboutUs);
});

const updateAboutUs = asyncHandler(async (req, res) => {
  const { title, content, image } = req.body;
  const aboutUs = await AboutUs.findById(req.params.id);

  if (aboutUs) {
    aboutUs.title = title || aboutUs.title;
    aboutUs.content = content || aboutUs.content;
    aboutUs.image = image || aboutUs.image;
    const updatedAboutUs = await aboutUs.save();
    res.json(updatedAboutUs);
  } else {
    res.status(404);
    throw new Error('About Us not found');
  }
});

module.exports = { createAboutUs, getAboutUs, updateAboutUs };