const asyncHandler = require('express-async-handler');
const fetch = require('node-fetch');
const ChatSession = require('../models/chatModel');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const ensureApiKey = () => {
  const { GEMINI_API_KEY } = process.env;
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured.');
  }
  return GEMINI_API_KEY;
};

const buildGeminiPayload = (messages, latestPrompt) => {
  const historyContent = messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }));

  return {
    contents: [
      ...historyContent,
      { role: 'user', parts: [{ text: latestPrompt }] },
    ],
  };
};

const generateTitleFromPrompt = (prompt) => {
  if (!prompt) {
    return 'New chat';
  }
  const cleaned = prompt.trim().replace(/\s+/g, ' ');
  if (!cleaned) {
    return 'New chat';
  }
  const words = cleaned.split(' ').slice(0, 6).join(' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (statusCode, errorMessage) => {
  // Retry on rate limits, overloaded, and server errors
  if (statusCode === 429 || statusCode === 503 || statusCode === 500) {
    return true;
  }
  // Retry on specific error messages
  const retryableMessages = [
    'overloaded',
    'rate limit',
    'quota',
    'too many requests',
    'service unavailable',
    'internal error',
  ];
  const lowerMessage = (errorMessage || '').toLowerCase();
  return retryableMessages.some((msg) => lowerMessage.includes(msg));
};

const callGeminiAPI = async (apiUrl, payload, retries = 3) => {
  let lastError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const apiRes = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!apiRes.ok) {
        const errorBody = await apiRes.json();
        const errorMessage = errorBody?.error?.message || 'Failed to get a response from the AI model.';
        const statusCode = apiRes.status;

        // Check if we should retry
        if (attempt < retries && isRetryableError(statusCode, errorMessage)) {
          const backoffDelay = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.log(
            `Gemini API error (attempt ${attempt + 1}/${retries + 1}): ${errorMessage}. Retrying in ${backoffDelay}ms...`
          );
          await sleep(backoffDelay);
          const err = new Error(errorMessage);
          err.statusCode = statusCode;
          lastError = err;
          continue;
        }

        // Not retryable or out of retries
        const err = new Error(errorMessage);
        err.statusCode = statusCode;
        throw err;
      }

      // Success
      return await apiRes.json();
    } catch (error) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      const statusCode = error?.statusCode || 500;
      
      // If it's not a retryable error or we're out of retries, throw immediately
      if (attempt >= retries || !isRetryableError(statusCode, errorMessage)) {
        // Ensure it's an Error object
        if (error instanceof Error) {
          throw error;
        }
        const err = new Error(errorMessage);
        err.statusCode = statusCode;
        throw err;
      }

      // Store for potential final throw
      const err = new Error(errorMessage);
      err.statusCode = statusCode;
      lastError = err;

      // Wait before retrying
      const backoffDelay = Math.pow(2, attempt) * 1000;
      console.log(
        `Gemini API error (attempt ${attempt + 1}/${retries + 1}): ${errorMessage}. Retrying in ${backoffDelay}ms...`
      );
      await sleep(backoffDelay);
    }
  }

  // If we exhausted all retries, throw the last error
  if (lastError) {
    throw lastError;
  }
  throw new Error('Failed to get a response from the AI model after multiple attempts.');
};

// @desc    Create a chat session
// @route   POST /api/v1/chat/sessions
// @access  Private
const createChatSession = asyncHandler(async (req, res) => {
  const title = req.body.title?.trim() || 'New chat';
  const session = await ChatSession.create({
    user: req.user._id,
    title,
    messages: [],
  });

  res.status(201).json(session);
});

// @desc    List chat sessions for the authenticated user
// @route   GET /api/v1/chat/sessions
// @access  Private
const getChatSessions = asyncHandler(async (req, res) => {
  const sessions = await ChatSession.find({ user: req.user._id })
    .sort({ updatedAt: -1 })
    .select('title createdAt updatedAt');

  res.json(sessions);
});

// @desc    Get a specific chat session with messages
// @route   GET /api/v1/chat/sessions/:id
// @access  Private
const getChatSessionById = asyncHandler(async (req, res) => {
  const session = await ChatSession.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!session) {
    res.status(404);
    throw new Error('Chat session not found.');
  }

  res.json(session);
});

// @desc    Update chat session title
// @route   PATCH /api/v1/chat/sessions/:id
// @access  Private
const updateChatSessionTitle = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const trimmedTitle = title?.trim();
  if (!trimmedTitle) {
    res.status(400);
    throw new Error('A title is required.');
  }

  const session = await ChatSession.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { title: trimmedTitle },
    { new: true }
  );

  if (!session) {
    res.status(404);
    throw new Error('Chat session not found.');
  }

  res.json(session);
});

// @desc    Delete chat session
// @route   DELETE /api/v1/chat/sessions/:id
// @access  Private
const deleteChatSession = asyncHandler(async (req, res) => {
  const session = await ChatSession.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!session) {
    res.status(404);
    throw new Error('Chat session not found.');
  }

  res.json({ message: 'Chat session deleted.' });
});

// @desc    Send a message within a chat session
// @route   POST /api/v1/chat/sessions/:id/messages
// @access  Private
const sendChatMessage = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || !prompt.trim()) {
    res.status(400);
    throw new Error('Prompt is required.');
  }

  const session = await ChatSession.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!session) {
    res.status(404);
    throw new Error('Chat session not found.');
  }

  const API_KEY = ensureApiKey();
  // Use v1beta for newer models (gemini-1.5-flash, gemini-2.5-flash), v1 for older models
  const apiVersion = (GEMINI_MODEL.includes('1.5') || GEMINI_MODEL.includes('2.5')) ? 'v1beta' : 'v1';
  const API_URL = `https://generativelanguage.googleapis.com/${apiVersion}/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;

  try {
    const payload = buildGeminiPayload(session.messages, prompt);
    // Use retry logic with exponential backoff
    const data = await callGeminiAPI(API_URL, payload, 3);
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response.";

    session.messages.push({ role: 'user', content: prompt });
    session.messages.push({ role: 'assistant', content: reply });

    if (session.title === 'New chat') {
      session.title = generateTitleFromPrompt(prompt);
    }

    await session.save();

    res.status(200).json({
      reply,
      session: {
        _id: session._id,
        title: session.title,
        messages: session.messages,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    const statusCode = error?.statusCode || 500;
    const errorMessage = error?.message || 'An internal server error occurred while processing your chat.';
    
    if (res.statusCode === 200) {
      res.status(statusCode);
    }
    throw new Error(errorMessage);
  }
});

module.exports = {
  createChatSession,
  getChatSessions,
  getChatSessionById,
  updateChatSessionTitle,
  deleteChatSession,
  sendChatMessage,
};