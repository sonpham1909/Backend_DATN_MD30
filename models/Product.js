// models/Product.js

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  
  variants: [
    {
      size: {
        type: String, // Kích cỡ
        required: true,
      },
      color: {
        type: String, // Màu sắc
        required: true,
      },
      quantity: {
        type: Number, // Số lượng sản phẩm cho từng biến thể
        required: true,
      },
      price: {
        type: Number, // Giá của từng biến thể, nếu khác nhau
        required: true,
      },
    },
  ],
  material:{
    type: String,
    required:true

  },
  description: {
    type: String,
  },
  imageUrls: { // Thay đổi thành mảng để lưu nhiều URL
    type: [String], // Lưu danh sách URL dưới dạng mảng các chuỗi
    required: true
}
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
