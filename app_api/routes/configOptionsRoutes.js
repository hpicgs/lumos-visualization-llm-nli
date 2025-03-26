const express = require('express');
const router = express.Router();
const ctrlConfig = require('../controllers/configoptions');

router
    .route('/configoptions/llm')
    .get(ctrlConfig.llmOptions);

module.exports = router;