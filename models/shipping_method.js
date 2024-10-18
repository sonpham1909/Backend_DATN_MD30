const mongoose = require('mongoose');

const shippingMethodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Tên phương thức giao hàng
  },
  cost: {
    type: Number,
    required: true, // Chi phí giao hàng
  },
  estimatedDeliveryTime: {
    type: String, // Thời gian dự kiến giao hàng (ví dụ: "3-5 ngày làm việc")
  },
  description: {
    type: String, // Mô tả về phương thức giao hàng (tùy chọn)
  },
  isActive: {
    type: Boolean,
    default: true, // Xác định xem phương thức này có đang hoạt động không
  },
}, { timestamps: true });

module.exports = mongoose.model('ShippingMethod', shippingMethodSchema);
