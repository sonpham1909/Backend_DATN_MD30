const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 25,
        unique: true
    },
    email: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 50,
        unique: true

    },
    password: {
        type: String,
        required: true,
        minlength: 8,

    },

    phone_number: {
        type: String,
        required: true, // Nếu bạn muốn bắt buộc
        minlength: 10,  // Điều chỉnh theo định dạng số điện thoại của bạn
        maxlength: 15   // Điều chỉnh theo định dạng số điện thoại của bạn
    },
    full_name: {
        type: String,
        required: true, // Nếu bạn muốn bắt buộc
        minlength: 1,    // Đảm bảo rằng người dùng không để trống
        maxlength: 100   // Đặt giới hạn tối đa cho tên
    },
    avatar: {
        type: String,
        default: 'https://res.cloudinary.com/dxq83pae3/image/upload/v1727705159/avatar-default-icon_fg6ydl.png', // URL hình ảnh mặc định
    },
    refreshToken: {
        type: String
    },

    block: {
        type: Boolean,
        default: false
    },
    isConnected: {
        type: Boolean,
        default: false,
    },
    socketId: {
        type: String,
    },

    // 🚀 Hỗ trợ tính năng reset mật khẩu
    otp: {
        type: String  // OTP ngẫu nhiên gửi về email
    },
    otpExpiresAt: {
        type: Date   // Thời gian OTP hết hạn
    }, otpRequestedAt: {
        type: Date,
    },

}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);
