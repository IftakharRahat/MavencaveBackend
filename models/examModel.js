const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,
  sections: [
    {
      key: String,
      title: String,
      durationMinutes: Number,
      instructions: String
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);