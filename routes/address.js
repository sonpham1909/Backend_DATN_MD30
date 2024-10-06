var express = require('express');
const middlewareController = require('../controller/middlewareController');
const AddressController = require('../controller/AddressController'); // Import AddressController
var router = express.Router();

// Tạo địa chỉ giao hàng
router.post(
    "/create_address",
    middlewareController.verifyToken,
    AddressController.createAddress // Hàm xử lý tạo địa chỉ
);

// Lấy tất cả địa chỉ
router.get('/', middlewareController.verifyToken, AddressController.getAllAddresses);

// Cập nhật địa chỉ
router.put(
    '/:id/update_address',
    middlewareController.verifyToken,
    AddressController.updateAddress // Hàm xử lý cập nhật địa chỉ
);

// Xóa địa chỉ
router.delete(
    '/:id/delete_address',
    middlewareController.verifyToken,
    AddressController.deleteAddress // Hàm xử lý xóa địa chỉ
);

module.exports = router;
