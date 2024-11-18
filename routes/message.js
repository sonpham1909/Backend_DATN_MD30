const express = require('express');
const router = express.Router();
const MessageController = require('../controller/MessageController');

// Định nghĩa các route
router.post('/messages', MessageController.createMessage); // Tạo tin nhắn mới
router.post('/replies', MessageController.createReply);    // Tạo phản hồi
router.get('/messages', MessageController.getAllMessagesWithReplies); // Lấy tất cả tin nhắn và phản hồi
router.delete('/messages/:id', MessageController.deleteMessage); // Xóa tin nhắn
module.exports = router;
