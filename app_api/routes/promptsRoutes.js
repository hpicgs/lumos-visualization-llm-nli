const express = require('express');
const router = express.Router();
const ctrlPrompts = require('../controllers/prompts');

/**
 * @swagger
 * /prompts:
 *   get:
 *     summary: Returns a list of prompts
 *     parameters:
 *       - in: query
 *         name: type
 *         description: Filter prompts on type
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
 *                 $ref: '#/components/schemas/Prompt'
 */
router.get("/prompts", ctrlPrompts.promptReadAll);

/**
 * @swagger
 * /prompts:
 *   post:
 *     summary: Add a new prompt
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Prompt'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prompt'
 */
router.post("/prompts", ctrlPrompts.promptCreateOne);

/**
 * @swagger
 * /prompts/{promptId}:
 *   get:
 *     summary: Gets a prompt by Id
 *     parameters:
 *       - in: path
 *         name: promptId
 *         description: Prompt ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prompt'
 */
router.get("/prompts/:promptId", ctrlPrompts.promptReadOne);

/**
 * @swagger
 * /prompts/{promptId}:
 *   delete:
 *     summary: Delete a prompt by Id
 *     parameters:
 *       - name: promptId
 *         in: path
 *         description: Prompt ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: The prompt was deleted successfully
 */
router.delete("/prompts/:promptId", ctrlPrompts.promptDeleteOne);

module.exports = router;