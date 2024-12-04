var express = require('express');
const middlewareController = require('../controller/middlewareController');
const PaymentMethodController = require('../controller/payment_methodController'); // Sửa tên controller
var router = express.Router();

// Tạo phương thức thanh toán
router.post(
    "/create_payment_method",
    PaymentMethodController.createPaymentMethod // Hàm xử lý tạo phương thức thanh toán
);

// Lấy tất cả phương thức thanh toán
router.get('/',  PaymentMethodController.getAllPaymentMethods);

// Cập nhật phương thức thanh toán
router.put(
    '/:id/update_payment_method',

    PaymentMethodController.updatePaymentMethod // Hàm xử lý cập nhật phương thức thanh toán
);

// Xóa phương thức thanh toán
router.delete(
    '/:id/delete_payment_method',
    PaymentMethodController.deletePaymentMethod // Hàm xử lý xóa phương thức thanh toán
);

// Tìm kiếm phương thức thanh toán
router.get('/search', middlewareController.verifyToken, PaymentMethodController.searchPaymentMethod);

module.exports = router;
