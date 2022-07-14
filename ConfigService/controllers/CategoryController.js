const Category = require("../models/Category");

class CategoryController {

  async getCategories (req, res, next) {
    try {
      const categories = await Category.find();
      res.status(200).json(categories);
    } catch (err) {
      return next(err);
    }
  }

}
module.exports = new CategoryController();