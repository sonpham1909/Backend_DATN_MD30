var express = require('express');
const middlewareController = require('../controller/middlewareController');
const ReviewController = require('../controller/reviewController');
var router = express.Router();

// Tạo đánh giá
router.post(
    "/create_review",
    middlewareController.verifyToken, // Xác minh người dùng
    ReviewController.create_review // Hàm xử lý tạo đánh giá
);

// Lấy tất cả đánh giá
router.get('/', middlewareController.verifyToken, ReviewController.getAllReviews);

// Cập nhật đánh giá
router.put(
    '/:id/update_review',
    middlewareController.verifyToken, // Xác minh người dùng
    ReviewController.updateReview // Hàm xử lý cập nhật đánh giá
);

// Xóa đánh giá
router.delete(
    '/:id/delete_review',
    middlewareController.verifyToken, // Xác minh người dùng
    ReviewController.deleteReview // Hàm xử lý xóa đánh giá
);

// Tìm kiếm đánh giá
router.get('/search', middlewareController.verifyToken, ReviewController.searchReviews);

module.exports = router;
