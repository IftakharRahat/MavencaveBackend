const asyncHandler = require('express-async-handler');
const Event = require('../models/eventModel');

const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, time, location, image } = req.body;
  const event = await Event.create({ title, description, date, time, location, image });
  res.status(201).json(event);
});

const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({});
  res.json(events);
});

const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (event) {
    res.json(event);
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

const updateEvent = asyncHandler(async (req, res) => {
  const { title, description, date, time, location, image } = req.body;
  const event = await Event.findById(req.params.id);

  if (event) {
    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.time = time || event.time;
    event.location = location || event.location;
    event.image = image || event.image;
    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (event) {
    res.json({ message: 'Event removed' });
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

module.exports = { createEvent, getEvents, getEventById, updateEvent, deleteEvent };