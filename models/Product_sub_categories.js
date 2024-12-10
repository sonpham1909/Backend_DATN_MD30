const mongoose = require('mongoose');

const ProductSubCategorySchema = new mongoose.Schema({
    sub_categories_id: { 
        type: String,
    },
    product_id: { 
        type: String, 
        unique: true, // Thêm ràng buộc unique
        required: true
    },
}, { timestamps: true });

module.exports = mongoose.model('ProductSubCategory', ProductSubCategorySchema);
