const express = require('express');
const WebsiteController = require('../controllers/WebsiteController');

const router = express.Router();

router.get('/', WebsiteController.getWebsites);

module.exports = router;