const express = require('express');
const router = express.Router();
const ctrlTests = require('../controllers/tests');

/**
 * @swagger
 * /tests/meta:
 *   get:
 *     summary: Returns meta information about tests collection
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 collection:
 *                   type: array
 *                   items:
 *                     type: string
 *                 visualization:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get('/tests/meta', ctrlTests.testsMetaInformation);

/**
 * @swagger
 * /tests:
 *   get:
 *     summary: Returns a list of tests
 *     parameters:
 *       - in: query
 *         name: collection
 *         description: Filter tests on collection
 *         schema:
 *           type: string
 *       - in: query
 *         name: visualization
 *         description: Filter tests on visualization type
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         description: Filter tests on specific status
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
 *                 $ref: '#/components/schemas/Test'
 */
router.get('/tests', ctrlTests.testsReadAll);

/**
 * @swagger
 * /tests:
 *   post:
 *     summary: Add a new test
 *     description: TODO test behavior
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Test'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Test'
 */
router.post('/tests', ctrlTests.testsCreateOne);

/**
 * @swagger
 * /tests/{testId}:
 *   get:
 *     summary: Gets a test by Id
 *     parameters:
 *       - in: path
 *         name: testId
 *         description: Test ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Test'
 */
router.get('/tests/:testId', ctrlTests.testsReadOne);

/**
 * @swagger
 * /tests/{testId}:
 *   put:
 *     summary: Update existing test
 *     description: TODO test behavior
 *     parameters:
 *       - name: testId
 *         in: path
 *         description: Test ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Test'
 *     responses:
 *       201:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Test'
 */
router.put('/tests/:testId', ctrlTests.testsUpdateOne);

/**
 * @swagger
 * /tests/{testId}:
 *   delete:
 *     summary: Delete a test by Id
 *     parameters:
 *       - name: testId
 *         in: path
 *         description: Test ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: The test was deleted successfully
 */
router.delete('/tests/:testId', ctrlTests.testsDeleteOne);

module.exports = router;