const express = require('express');
const router = express.Router();
const ctrlFile = require('../controllers/files');
const { upload } = require('../util/multer');

/**
 * @swagger
 * /files:
 *   get:
 *     summary: Returns a list of files
 *     description: TODO file upload & sync behavior
 *     parameters:
 *       - in: query
 *         name: name
 *         description: Filter files on name
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of available files
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/File'
 */
router.get('/files', ctrlFile.fileReadAll);

/**
 * @swagger
 * /files:
 *   post:
 *     summary: Upload a new file
 *     description: TODO file behavior
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               dataFile:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *               description:
 *                 type: string
 *                 description: A description of the file
 *     responses:
 *       201:
 *         description: File created, returning file metadata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/File'
 */
router.post('/files', upload.single('dataFile'), ctrlFile.fileCreateOne);

/**
 * @swagger
 * /files/{fileId}:
 *   get:
 *     summary: Gets the file content by Id
 *     parameters:
 *       - name: fileId
 *         in: path
 *         description: File ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The requested file
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *           application/json:
 *             schema:
 *               type: object
 *           text/csv:
 *             schema:
 *               type: string
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/files/:fileId', ctrlFile.fileReadOne);

/**
 * @swagger
 * /files/{fileId}:
 *   delete:
 *     summary: Delete a file by Id
 *     description: TODO deletion sync behavior
 *     parameters:
 *       - name: fileId
 *         in: path
 *         description: File ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: The file was deleted successfully
 */
router.delete('/files/:fileId', ctrlFile.fileDeleteOne);

module.exports = router;