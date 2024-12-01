const mongoose = require('mongoose');

const PaymentMethodSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true,
        unique: true
    },
    description: { 
        type: String,
        required: true,
    },
    is_active: {
        type: Boolean,
        default: true // Giá trị mặc định là true, nghĩa là phương thức thanh toán đang hoạt động
    },
    image: { // Thêm trường ảnh
        type: String, // Chứa URL của ảnh
        required: false // Trường ảnh không bắt buộc
    }
}, { timestamps: true });

module.exports = mongoose.model('PaymentMethod', PaymentMethodSchema);
