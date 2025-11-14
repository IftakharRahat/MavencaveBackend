const mongoose = require('mongoose');

const eventBookingSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
}, { timestamps: true });

const EventBooking = mongoose.model('EventBooking', eventBookingSchema);
module.exports = EventBooking;