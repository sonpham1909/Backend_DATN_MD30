const mongoose = require('mongoose');

const notificationUserSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Liên kết với bảng User
        required: true,
    },
    notification_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification', // Liên kết với bảng Notification
        required: true,
    },
    status: {
        type: String,
        enum: ['unread', 'read', 'deleted'], // Các trạng thái có thể có của thông báo
        default: 'unread', // Mặc định là 'unread' khi tạo mới
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification_User', notificationUserSchema);
