const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema(
    {
        _id: Number,
        name: String,
        
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

module.exports = mongoose.model('Category', CategorySchema);

