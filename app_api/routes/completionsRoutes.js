const express = require('express');
const router = express.Router();
const ctrlChat = require('../controllers/chat');

/**
 * @swagger
 * /chats:
 *   post:
 *     summary: Ask a question
 *     description: TODO chat behavior
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               model:
 *                 type: string
 *                 description: The OpenAI model to use
 *               content:
 *                 type: string
 *                 description: The user message content
 *     responses:
 *       200:
 *         description: A list of llm answers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   content:
 *                     type: string
 *                     description: The user message content
 *                   nli:
 *                     type: object
 *                     description: The parsed control output
 */
router.post('/chats', ctrlChat.chatCreateOne);

module.exports = router;