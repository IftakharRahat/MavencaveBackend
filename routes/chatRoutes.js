const express = require('express');
const router = express.Router();
const {
  createChatSession,
  getChatSessions,
  getChatSessionById,
  updateChatSessionTitle,
  deleteChatSession,
  sendChatMessage,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/sessions')
  .get(getChatSessions)
  .post(createChatSession);

router
  .route('/sessions/:id')
  .get(getChatSessionById)
  .patch(updateChatSessionTitle)
  .delete(deleteChatSession);

router.route('/sessions/:id/messages').post(sendChatMessage);

module.exports = router;