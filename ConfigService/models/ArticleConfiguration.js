const mongoose = require('mongoose');


const ArticleConfigSchema = mongoose.Schema(
    {
      website: { id: Number, name: String },
      category: { id: Number, name: String },

      articleDemoLink: String,

      article: {
        sapoSelector: String,
        sapoRedundancySelectors: [String],
        titleSelector: String,
        titleRedundancySelectors: [String],
        thumbnailSelector: String,
        thumbnailRedundancySelectors: [String],
        tagsSelector: String,
        tagsRedundancySelectors: [String],
        contentSelector: String,
        contentRedundancySelectors: [String],
        textRedundancySelectors: [String],
      },
      
      status: { type: String, default: '01' },
    },
    {
      timestamps: true,
      versionKey: false,
    },
);

module.exports = mongoose.model('ArticleConfig', ArticleConfigSchema);

