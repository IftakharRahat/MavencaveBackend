// /controllers/sessionController.js
const asyncHandler = require('express-async-handler');
const Session = require('../models/sessionModel');
const Question = require('../models/questionModel');
const Result = require('../models/resultModel');

const startSession = asyncHandler(async (req, res) => {
  const { examId, mode } = req.body;
  if(!examId) {
      res.status(400);
      throw new Error('examId is required');
  }
  const session = await Session.create({
    user: req.user._id,
    exam: examId,
    mode: mode || 'exam',
    startedAt: new Date(),
    status: 'ongoing'
  });
  res.status(201).json(session);
});

const getSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.sessionId)
    .populate('exam')
    .populate('answers.question');

  if(!session) {
      res.status(404);
      throw new Error('Session not found');
  }
  if(session.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Forbidden');
  }
  res.json(session);
});

const submitAnswer = asyncHandler(async (req, res) => {
  const { questionId, answer } = req.body;
  const session = await Session.findById(req.params.sessionId);

  if(!session) {
      res.status(404);
      throw new Error('Session not found');
  }
  if(session.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Forbidden');
  }
  if(session.status !== 'ongoing') {
      res.status(400);
      throw new Error('Session is not ongoing');
  }

  const question = await Question.findById(questionId);
  if(!question) {
      res.status(404);
      throw new Error('Question not found');
  }

  let marksObtained = 0;
  let graded = false;

  if(['mcq','tf','numeric','fill'].includes(question.type)) {
    graded = true;
    if(JSON.stringify(question.correctAnswer) === JSON.stringify(answer)) {
      marksObtained = question.marks || 1;
    }
  }

  session.answers.push({
    question: questionId,
    answer,
    marksObtained,
    graded,
    gradedBy: graded ? 'auto' : null
  });

  session.totalMarks += question.marks || 0;
  session.score += marksObtained;
  await session.save();
  res.json(session);
});

const finishSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.sessionId).populate('answers.question');
  if(!session) {
      res.status(404);
      throw new Error('Session not found');
  }
  if(session.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Forbidden');
  }
   if(session.status !== 'ongoing') {
      res.status(400);
      throw new Error('Session is not ongoing');
  }

  session.finishedAt = new Date();
  session.status = 'submitted';
  await session.save();

  const breakdown = {};
  for(const a of session.answers) {
    const q = a.question;
    const section = q.sectionKey || 'general';
    if(!breakdown[section]) breakdown[section] = { score: 0, max: 0 };
    breakdown[section].score += a.marksObtained || 0;
    breakdown[section].max += q.marks || 0;
  }

  const result = await Result.create({
    session: session._id,
    user: session.user,
    exam: session.exam,
    breakdown,
    totalScore: session.score
  });

  res.json({ session, result });
});

module.exports = { startSession, getSession, submitAnswer, finishSession };