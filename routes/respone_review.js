var express = require('express');
const middlewareController = require('../controller/middlewareController');
const ResponseReviewController = require('../controller/respone_reviewController'); // Đã đổi tên controller
var router = express.Router();

// Tạo phản hồi
router.post(
    "/create_response",
    middlewareController.verifyToken, // Xác minh người dùng
    ResponseReviewController.create_response // Hàm xử lý tạo phản hồi
);

// Lấy tất cả phản hồi
router.get('/', middlewareController.verifyToken, ResponseReviewController.getAllResponses);

// Cập nhật phản hồi
router.put(
    '/:id/update_response',
    middlewareController.verifyToken, // Xác minh người dùng
    ResponseReviewController.updateResponse // Hàm xử lý cập nhật phản hồi
);

// Xóa phản hồi
router.delete(
    '/:id/delete_response',
    middlewareController.verifyToken, // Xác minh người dùng
    ResponseReviewController.deleteResponse // Hàm xử lý xóa phản hồi
);

// Tìm kiếm phản hồi
router.get('/search', middlewareController.verifyToken, ResponseReviewController.searchResponses);

module.exports = router;
