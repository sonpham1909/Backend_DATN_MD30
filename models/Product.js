// models/Product.js

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  material: {
    type: String,
    required: true

  },
  price: {
    type: Number,
    require: true
  },
  description: {
    type: String,
  },
  imageUrls: { // Thay đổi thành mảng để lưu nhiều URL
    type: [String], // Lưu danh sách URL dưới dạng mảng các chuỗi
    required: true
  },
  normalized_name: String,
}, { timestamps: true });

function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

productSchema.pre('save', function(next) {
  this.normalized_name = removeAccents(this.name);
  next();
});

module.exports = mongoose.model('Product', productSchema);
