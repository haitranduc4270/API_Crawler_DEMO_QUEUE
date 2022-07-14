const LinkConfiguration = require("../models/LinkConfiguration");
const axios = require ('axios');
class LinkConfigurationController {
  

  async getLinkConfigurations (req, res, next) {
    const delay = t => new Promise(resolve => setTimeout(resolve, t));
    try {
      const linkConfiguration = await LinkConfiguration.find();
      res.status(200).json(linkConfiguration);

    } catch (err) {
      return next(err);
    }
  }

  
}
module.exports = new LinkConfigurationController();