const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
  breakdown: Object, // e.g. { listening: {score, max}, writing: {...} }
  totalScore: Number,
  convertedBand: Object, // e.g. { type: 'IELTS', band: 7.0 }
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);