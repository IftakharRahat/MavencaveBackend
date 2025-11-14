const asyncHandler = require('express-async-handler');
const Blog = require('../models/blogModel');
const AboutUs = require('../models/aboutUsModel');
const Event = require('../models/eventModel');

const getAdminPanelData = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({});
  const aboutUs = await AboutUs.find({});
  const events = await Event.find({});
  res.json({ blogs, aboutUs, events });
});

module.exports = { getAdminPanelData };