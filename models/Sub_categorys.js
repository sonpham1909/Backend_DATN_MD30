
const mongoose = require('mongoose');

const SubCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String, // Đường dẫn ảnh
    },
    id_category: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model('SubCategory', SubCategorySchema);
