const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  answer: mongoose.Schema.Types.Mixed,
  marksObtained: { type: Number, default: 0 },
  graded: { type: Boolean, default: false },
  gradedBy: { type: String }, // 'auto', userId, or 'ai'
}, { timestamps: true });

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  mode: { type: String, enum: ['practice','exam'], default: 'exam' },
  startedAt: Date,
  finishedAt: Date,
  status: { type: String, enum: ['ongoing','submitted','graded'], default: 'ongoing' },
  answers: [answerSchema],
  totalMarks: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);