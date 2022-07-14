const { response } = require('express');
const express = require('express');
const LinkConfigurationController = require('../controllers/LinkConfigurationController');

const router = express.Router();

router.get('/', LinkConfigurationController.getLinkConfigurations)

module.exports = router;