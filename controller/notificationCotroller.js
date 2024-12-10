const Notification = require("../models/Notification");
const NotificationUser = require("../models/NotificationUser")


const notificationCotroller = {
    getAllNotifi: async(req, res) =>{
        try {
            const notifi = await NotificationUser.find();
            res.status(200).json(notifi);
        } catch (error) {
            console.error('Get all notifi error: ',error);
            res.status(500).json({ message: 'Error get notifi user status', error: error.message });
            
        }
    },
    sendPersonalNotification: async (userId, title, message) => {
        try {
            // Tạo thông báo trong bảng Notification
            const notification = new Notification({
                title,
                message,
                type: 'personal',
                
            });
            await notification.save();
    
            // Tạo bản ghi thông báo cho người dùng cụ thể trong Notification_User
            const notificationUser = new NotificationUser({
                notification_id: notification._id,
                user_id: userId,
                status: 'unread',
            });
            await notificationUser.save();
    
            console.log('Thông báo cá nhân đã được gửi.');
        } catch (error) {
            console.error('Lỗi khi gửi thông báo cá nhân:', error);
        }
    }
}

module.exports = notificationCotroller;