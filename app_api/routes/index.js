const express = require('express');
const router = express.Router();
const configOptionsRoutes = require("./configOptionsRoutes");
const assistantsRoutes = require("./assistantsRoutes");
const completionsRoutes = require("./completionsRoutes");
const promptsRoutes = require("./promptsRoutes");
const filesRoutes = require("./filesRoutes");
const testsRoutes = require("./testsRoutes");

router.use(configOptionsRoutes);
router.use(assistantsRoutes);
router.use(completionsRoutes);
router.use(promptsRoutes);
router.use(filesRoutes);
router.use(testsRoutes);

module.exports = router;