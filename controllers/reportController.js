// /controllers/reportController.js
const asyncHandler = require('express-async-handler');
const Session = require('../models/sessionModel');
const Result = require('../models/resultModel');

const sessionReport = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.sessionId)
      .populate('answers.question')
      .populate('exam');
      
  if(!session) {
      res.status(404);
      throw new Error('Session not found');
  }

  if(session.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Forbidden');
  }

  const report = {
    sessionId: session._id,
    exam: session.exam,
    totalScore: session.score,
    totalMax: session.totalMarks,
    sections: {}
  };

  for(const a of session.answers) {
    const q = a.question;
    const sec = q.sectionKey || 'general';
    if(!report.sections[sec]) report.sections[sec] = { obtained: 0, max: 0, attempts: 0 };
    report.sections[sec].obtained += a.marksObtained || 0;
    report.sections[sec].max += (q.marks || 0);
    report.sections[sec].attempts += 1;
  }

  res.json(report);
});

const userTrend = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if(req.user._id.toString() !== userId && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Forbidden');
  }
  const results = await Result.find({ user: userId }).sort({ createdAt: 1 }).limit(50);
  res.json(results);
});

module.exports = { sessionReport, userTrend };