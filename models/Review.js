const mongoose = require('mongoose');
const { Schema } = mongoose;


const ReviewSchema = new Schema({
  product_id: { 
    type: Schema.Types.ObjectId, // Chuyển đổi từ String sang ObjectId
    ref: 'Product', // Tham chiếu đến bảng Product
    required: true 
  },
  user_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', // Tham chiếu đến bảng User để biết người dùng nào đã đánh giá
    // Sử dụng ObjectId cho user_id để tham chiếu đến bảng Users (nếu có)
    required: true 
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: { 
    type: String, 
    required: true 
  },
  color: { 
    type: String 
  },
  size: { 
    type: String 
  },
  img: {
    type: [String], // Thay đổi từ String thành mảng String
  },
  image_variant:{
    type:String,
    require:true
    
  }

}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
