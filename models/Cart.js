const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, // Sửa "require" thành "required"
    },
    status: {
        type: String,
        default: 'isActive',
        enum: ['isActive', 'ordered'], // Thêm enum để giới hạn giá trị
    }
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);
