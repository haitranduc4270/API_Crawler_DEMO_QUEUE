const mongoose = require('mongoose');

const LinkConfigSchema = new mongoose.Schema(
{
    website: { id: Number, name: String },
    category: { id: Number, name: String },
    
    crawlType: String,

    rss: [
        {
            _id: false,
            url: String,
            configuration: {
                itemSelector: String,
                linkSelector: String,
                publicDateSelector: String,
                titleSelector: String,
                sapoSelector: String,
            },
            version: { type: Number, default: 2 },
        },
    ],
    html: [
        {
            _id: false,
            url: String,
            contentRedundancySelectors: [String],
            blocksConfiguration: [
                {
                    _id: false,
                    blockSelector: String,
                    configuration: {
                        itemSelector: String,
                        linkSelector: String,
                        publicDateSelector: String,
                        titleSelector: String,
                        redundancySelectors: [String],
                    },
                },
            ],
        },
    ],

    
    schedules: [String],
    
    RSSDemoLink: String,
    HTMLDemoLink: String,

    status: { type: String, default: '01' },
},
    {
        timestamps: true,
        versionKey: false,
    },
);

module.exports = mongoose.model('LinkConfig', LinkConfigSchema);
