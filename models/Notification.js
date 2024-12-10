const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['general', 'personal'], // Chỉ chấp nhận giá trị 'general' hoặc 'personal'
    },
    imgNotifi: {
        type: [String],
        default: [] // Đảm bảo luôn có giá trị mặc định là mảng rỗng
    },
    link: {
        type: String // Liên kết để chỉ định nội dung liên quan đến thông báo
    },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
