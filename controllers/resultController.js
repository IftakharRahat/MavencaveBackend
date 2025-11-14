// /controllers/resultController.js
const asyncHandler = require('express-async-handler');
const Result = require('../models/resultModel');
const Session = require('../models/sessionModel');

const getResult = asyncHandler(async (req, res) => {
  const result = await Result.findOne({ session: req.params.sessionId }).populate('session');
  if(!result) {
      res.status(404);
      throw new Error('Result not found');
  }

  if(result.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Forbidden');
  }
  res.json(result);
});

const getUserResults = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if(req.user._id.toString() !== userId && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Forbidden');
  }
  const results = await Result.find({ user: userId }).sort({ createdAt: -1 });
  res.json(results);
});

const gradeWriting = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { scores } = req.body;
  const session = await Session.findById(sessionId);
  if(!session) {
      res.status(404);
      throw new Error('Session not found');
  }

  for(const sc of scores) {
    const ans = session.answers.id(sc._id);
    if(ans) {
      ans.marksObtained = sc.marks;
      ans.graded = true;
      ans.gradedBy = req.user._id.toString();
    }
  }

  session.score = session.answers.reduce((s, a) => s + (a.marksObtained || 0), 0);
  session.status = 'graded';
  await session.save();

  const result = await Result.findOneAndUpdate(
      { session: session._id },
      { totalScore: session.score },
      { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  
  res.json({ session, result, message: 'Writing graded' });
});

module.exports = { getResult, getUserResults, gradeWriting };