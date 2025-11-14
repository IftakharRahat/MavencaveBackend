const asyncHandler = require('express-async-handler');
const EventBooking = require('../models/eventBookingModel');

const createEventBooking = asyncHandler(async (req, res) => {
  const { eventId, userId, name, email } = req.body;
  const eventBooking = await EventBooking.create({ eventId, userId, name, email });
  res.status(201).json(eventBooking);
});

const getEventBookings = asyncHandler(async (req, res) => {
  const eventBookings = await EventBooking.find({ eventId: req.params.eventId });
  res.json(eventBookings);
});

module.exports = { createEventBooking, getEventBookings };