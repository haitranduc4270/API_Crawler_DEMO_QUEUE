const Website = require("../models/Website");

class WebsiteController {

    async getWebsites (req, res, next) {
      try {
        const websites = await Website.find();
        res.status(200).json(websites);
      } catch (err) {
        return next(err);
      }
    }
    

}
module.exports = new WebsiteController();