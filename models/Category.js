const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    namecategory: { 
        type: String,
        required: true,
        unique: true
    },
    description: { 
        type: String,
        required: true,
    },
    imgcategory: {
        type: String, // Đường dẫn ảnh
    },
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
