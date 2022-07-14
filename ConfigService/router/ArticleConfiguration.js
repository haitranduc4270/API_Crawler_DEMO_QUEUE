const express = require('express');
const ArticleConfigController = require('../controllers/ArticleConfigurationController');

const router = express.Router();

router.get('/all', ArticleConfigController.getArticleConfigurations);
router.post('/', ArticleConfigController.getArticleConfiguration);

module.exports = router;