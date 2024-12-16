const Notification = require("../models/Notification");
const NotificationUser = require("../models/NotificationUser");
const User = require("../models/User");


const notificationCotroller = {
    getAllNotifi: async (req, res) => {
        try {
            // Lấy tất cả thông báo có type là 'general'
            const notifi = await Notification.find({ type: 'general' });
            res.status(200).json(notifi);
        } catch (error) {
            console.error('Get all notifi error: ', error);
            res.status(500).json({ message: 'Error fetching general notifications', error: error.message });
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
    },
    sendGenaralNotifi: async (req, res) => {
        try {
            const { message, title, image, link } = req.body;

            if (!message || !title ) {
                return res.status(400).send({
                    error: 'Message content is required',
                });
            }

            if (!req.imageUrls || req.imageUrls.length === 0) {
                return res.status(400).json({ message: "No image uploaded" });
            }

            // Tạo thông báo trong bảng Notification
            const notifi = new Notification({
                title: title,
                message: message,
                type: "general",
                imgNotifi: req.imageUrls,
                link: link || '',
            
            });
            await notifi.save();

            // Lấy danh sách tất cả người dùng
            const users = await User.find(); // Giả sử bạn có model User
            if (users.length === 0) {
                return res.status(400).json({ message: "No users found" });
            }

            // Tạo thông báo cho từng người dùng trong NotificationUser
            const notificationUsers = users.map((user) => ({
                notification_id: notifi._id,
                user_id: user._id,
                status: 'unread',
            }));
            await NotificationUser.insertMany(notificationUsers);

            // Gửi thông báo qua socket
            const io = req.app.locals.io;
            await io.emit('pushnotification', {...notifi._doc,status:'unread'}); // Phát sự kiện tới client

            res.status(200).send({
                message: 'Notification sent to all users successfully',
            });
        } catch (error) {
            console.error('Error sending notification to all users: ', error);
            res.status(500).json({ message: 'Error sending notification', error: error.message });
        }
    },
    getUserNotifications: async (req, res) => {
        try {
            const { id } = req.user; // Lấy userId từ params hoặc token
    
            if (!id) {
                return res.status(400).json({ message: 'User ID is required' });
            }
    
            // Lấy danh sách NotificationUser theo userId, sắp xếp theo thời gian mới nhất
            const userNotifications = await NotificationUser.find({ user_id: id }).sort({ createdAt: -1 });
    
            if (userNotifications.length === 0) {
                return res.status(404).json({ message: 'No notifications found for this user' });
            }
    
            // Lấy chi tiết thông báo từ bảng Notification
            const notificationIds = userNotifications.map((notiUser) => notiUser.notification_id);
            const notifications = await Notification.find({ _id: { $in: notificationIds } });
    
            // Kết hợp thông báo với trạng thái từ NotificationUser
            const result = userNotifications.map((notiUser) => {
                const notification = notifications.find(
                    (noti) => noti._id.toString() === notiUser.notification_id.toString()
                );
                return {
                    ...notification._doc,
                    status: notiUser.status,
                    userNotificationId: notiUser._id,
                };
            });
    
            res.status(200).json(result);
        } catch (error) {
            console.error('Error getting user notifications: ', error);
            res.status(500).json({ message: 'Error getting notifications', error: error.message });
        }
    }
    
}

module.exports = notificationCotroller;