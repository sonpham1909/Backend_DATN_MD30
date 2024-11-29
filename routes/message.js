// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const MessageController = require('../controller/MessageController');

// Các route cho Message
router.post('/messages', MessageController.createMessage);  // Tạo tin nhắn mới
router.get('/messages', MessageController.getAllMessages);  // Lấy tất cả tin nhắn
router.get('/messages/:id', MessageController.getMessageById);  // Lấy tin nhắn theo ID
router.put('/messages/:id', MessageController.updateMessage);  // Sửa tin nhắn
router.delete('/messages/:id', MessageController.deleteMessage);  // Xóa tin nhắn

module.exports = router;
