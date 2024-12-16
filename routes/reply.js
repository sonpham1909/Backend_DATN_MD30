// routes/replyRoutes.js
const express = require('express');
const router = express.Router();
const ReplyController = require('../controller/ReplyController');
const {
    uploadphoto,
    resizeAndUploadImage,
  } = require("../controller/imageUploadMiddleware");
const middlewareController = require('../controller/middlewareController');
// Các route cho Reply
router.post('/replies',uploadphoto.array('imageUrls',4),resizeAndUploadImage, ReplyController.createReply);  // Tạo phản hồi mới
router.get('/messages/:messageId/replies',middlewareController.verifyToken, ReplyController.getRepliesByMessage);  // Lấy tất cả phản hồi cho một tin nhắn
router.put('/replies/:id', ReplyController.updateReply);  // Sửa phản hồi
router.delete('/replies/:id', ReplyController.deleteReply);  // Xóa phản hồi

module.exports = router;
