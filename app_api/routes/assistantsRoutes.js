const express = require('express');
const router = express.Router();
const ctrlDialog = require('../controllers/dialogues')
const ctrlLLMs = require('../controllers/llm')
const ctrlMessages = require('../controllers/messages')

/**
 * @swagger
 * /llms:
 *   get:
 *     summary: Returns a list of LLMs
 *     responses:
 *       200:
 *         description: List of available llms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LLM'
 */
router.get('/llms', ctrlLLMs.llmReadAll);

/**
 * @swagger
 * /llms:
 *   post:
 *     summary: Add a new LLM
 *     description: TODO llm behavior
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LLM'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LLM'
 */
router.post('/llms', ctrlLLMs.llmCreateOne);

/**
 * @swagger
 * /llms/{llmId}:
 *   get:
 *     summary: Gets a LLM by Id
 *     parameters:
 *       - in: path
 *         name: llmId
 *         description: LLM ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LLM'
 */
router.get('/llms/:llmId', ctrlLLMs.llmReadOne);

/**
 * @swagger
 * /llms/{llmId}:
 *   delete:
 *     summary: Delete a LLM by Id
 *     parameters:
 *       - name: llmId
 *         in: path
 *         description: LLM ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: The LLM was deleted successfully
 */
router.delete('/llms/:llmId', ctrlLLMs.llmDeleteOne);

// llm dialogues

/**
 * @swagger
 * /llms/{llmId}/dialogues:
 *   get:
 *     summary: Returns a list of dialogues of a LLM
 *     parameters:
 *       - name: llmId
 *         in: path
 *         description: LLM ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Dialog'
 */
router.get('/llms/:llmId/dialogues', ctrlDialog.dialogReadAll)

/**
 * @swagger
 * /llms/{llmId}/dialogues:
 *   post:
 *     summary: Add a new dialog to a LLM
 *     description: TODO dialog behavior
 *     parameters:
 *       - name: llmId
 *         in: path
 *         description: LLM ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Dialog'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dialog'
 */
router.post('/llms/:llmId/dialogues', ctrlDialog.dialogCreateOne)

// TODO
router.options('/llms/:llmId/dialogues/:dialogId', ctrlDialog.dialogInfo)

/**
 * @swagger
 * /llms/{llmId}/dialogues/{dialogId}:
 *   get:
 *     summary: Gets a LLM Dialog by Id
 *     parameters:
 *       - name: llmId
 *         in: path
 *         description: LLM ID
 *         required: true
 *         schema:
 *           type: string
 *       - name: dialogId
 *         in: path
 *         description: Dialog ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dialog'
 */
router.get('/llms/:llmId/dialogues/:dialogId', ctrlDialog.dialogReadOne)

/**
 * @swagger
 * /llms/{llmId}/dialogues/{dialogId}:
 *   delete:
 *     summary: Delete a LLM Dialog by Id
 *     parameters:
 *       - name: llmId
 *         in: path
 *         description: LLM ID
 *         required: true
 *         schema:
 *           type: string
 *       - name: dialogId
 *         in: path
 *         description: Dialog ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: The dialog was deleted successfully
 */
router.delete('/llms/:llmId/dialogues/:dialogId', ctrlDialog.dialogDeleteOne)

// llm dialog messages

/**
 * @swagger
 * /llms/{llmId}/dialogues/{dialogId}/messages:
 *   post:
 *     summary: Add a message to a LLM dialog
 *     description: TODO message behavior
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
router.post('/llms/:llmId/dialogues/:dialogId/messages', ctrlMessages.messageCreateOne)


router.get('/llms/:llmId/dialogues/:dialogId/messages', ctrlMessages.messageReadOne)

module.exports = router;