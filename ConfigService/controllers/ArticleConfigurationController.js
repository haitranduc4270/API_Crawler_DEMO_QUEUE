const ArticleConfiguration = require("../models/ArticleConfiguration");

const axios = require('axios').default

class ArticleConfigurationController {

  async getArticleConfigurations (req, res, next) {
    try {
      const articleConfigurations = await ArticleConfiguration.find();
      res.status(200).json(articleConfigurations);

    } catch (err) {
      return next(err);
    }
  }

  
  async getArticleConfiguration (req, res, next) {
    try {
      const { website, category } = req.body;

      const articleConfigurations = await ArticleConfiguration.find({ website, category });
      res.status(200).json(articleConfigurations);
    } catch (err) {
      return next(err);
    }
  }

 
}
module.exports = new ArticleConfigurationController();