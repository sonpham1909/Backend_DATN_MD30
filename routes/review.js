var express = require('express');
const middlewareController = require('../controller/middlewareController');
const ReviewController = require('../controller/reviewController');
var router = express.Router();



router.get(
    "/reviews_ByUser",
    middlewareController.verifyToken,
    ReviewController.getUserReviews // Hàm xử lý lấy đánh giá của người dùng
);
// Tạo đánh giá
router.post(
    "/create_review",
    middlewareController.verifyToken, // Xác minh người dùng
    ReviewController.create_review // Hàm xử lý tạo đánh giá
);
// Route lấy danh sách đánh giá và phản hồi của sản phẩm theo product_id
router.get(
    '/product/:product_id/reviews_with_responses',
    middlewareController.verifyToken,
    ReviewController.getProductReviewsWithResponses // Hàm xử lý
);

// Lấy tất cả đánh giá của một người dùng theo user_id





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
