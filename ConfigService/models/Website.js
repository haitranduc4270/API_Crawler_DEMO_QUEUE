const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema(
{
    _id: Number,
    name: String,
    logo: String,
    url: String,
    mobileUrl: String,
    official: { type: Boolean, default: true },
    hostnames: [String],
    appId: String,
},
    {
        timestamps: true,
        versionKey: false,
    },
);


module.exports = mongoose.model('Website', websiteSchema);
