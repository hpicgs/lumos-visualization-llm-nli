const express = require('express');
const router = express.Router();
const ctrlChat = require('../controllers/chat')
const ctrlConfig = require('../controllers/configoptions')
const ctrlDialog = require('../controllers/dialogues')
const ctrlFile = require('../controllers/files')
const ctrlLLMs = require('../controllers/llm')
const ctrlMessages = require('../controllers/messages')
const ctrlPrompts = require('../controllers/prompts')
const ctrlTests = require('../controllers/tests')
const { upload } = require('../util/multer')

// config options
router
  .route('/configoptions/llm')
  .get(ctrlConfig.llmOptions)

// llms
router
  .route('/llms')
  .get(ctrlLLMs.llmReadAll)
  .post(ctrlLLMs.llmCreateOne)

router
  .route('/llms/:llmId')
  .get(ctrlLLMs.llmReadOne)
  .delete(ctrlLLMs.llmDeleteOne)

// llm dialogues
router
  .route('/llms/:llmId/dialogues')
  .get(ctrlDialog.dialogReadAll)
  .post(ctrlDialog.dialogCreateOne)

router
  .route('/llms/:llmId/dialogues/:dialogId')
  .options(ctrlDialog.dialogInfo)
  .get(ctrlDialog.dialogReadOne)
  .delete(ctrlDialog.dialogDeleteOne)

// llm dialog messages
router
  .route('/llms/:llmId/dialogues/:dialogId/messages')
  .post(ctrlMessages.messageCreateOne)

// chat completions
router
  .route('/chats')
  .post(ctrlChat.chatCreateOne)

// prompts
router
  .route('/prompts')
  .get(ctrlPrompts.promptReadAll)
  .post(ctrlPrompts.promptCreateOne)

router
  .route('/prompts/:promptId')
  .get(ctrlPrompts.promptReadOne)
  .delete(ctrlPrompts.promptDeleteOne)

// files
router
  .route('/files')
  .get(ctrlFile.fileReadAll)
  .post(upload.single('dataFile'), ctrlFile.fileCreateOne)

router
  .route('/files/:fileId')
  .get(ctrlFile.fileReadOne)
  .delete(ctrlFile.fileDeleteOne)

// tests
router
  .route('/tests/meta')
  .get(ctrlTests.testsMetaInformation)

router
  .route('/tests')
  .get(ctrlTests.testsReadAll)
  .post(ctrlTests.testsCreateOne)

router
  .route('/tests/:testId')
  .get(ctrlTests.testsReadOne)
  .put(ctrlTests.testsUpdateOne)
  .delete(ctrlTests.testsDeleteOne)

module.exports = router;