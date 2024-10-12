const mongoose = require('mongoose');

const ProductSubCategorySchema = new mongoose.Schema({
    sub_categories_id: { 
        type: mongoose.Schema.Types.ObjectId, // Sử dụng ObjectId để liên kết với bảng subcategories
        required: true,
        ref: 'SubCategory' // Tham chiếu tới bảng SubCategory nếu bạn có schema đó
    },
    product_id: { 
        type: mongoose.Schema.Types.ObjectId, // Sử dụng ObjectId để liên kết với bảng products
        required: true,
        ref: 'Product' // Tham chiếu tới bảng Product nếu bạn có schema đó
    },
}, { timestamps: true });

module.exports = mongoose.model('ProductSubCategory', ProductSubCategorySchema);
