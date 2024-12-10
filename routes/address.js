var express = require('express');
const middlewareController = require('../controller/middlewareController');
const AddressController = require('../controller/addressController'); // Import AddressController
var router = express.Router();

// Tạo địa chỉ giao hàng
router.post(
    "/create_address",
    middlewareController.verifyToken,
    AddressController.createAddress // Hàm xử lý tạo địa chỉ
);

// Lấy tất cả địa chỉ
router.get('/', middlewareController.verifyToken, AddressController.getAllAddresses);


//lấy địa chit theo người dùng
router.post('/get_address_by_user', AddressController.getAllAddressesByUserId);

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
router.get('/default', middlewareController.verifyToken, AddressController.getDefaultAddress);

//lấy danh sách địa chỉ người dùng phần app 
router.get('/list_address_user', middlewareController.verifyToken, AddressController.getAllAddressesByUserApp);
//cập nhật địa chỉ người dùng phần app
router.put('/:addressId/set-default', middlewareController.verifyToken, AddressController.updateDefaultAddressByApp);
//Xóa địa chỉ người dùng phía app
router.delete('/:addressId', middlewareController.verifyToken, AddressController.deleteAddressByApp);
//thêm địa chỉ người dùng phía app
router.post('/addressesApp', middlewareController.verifyToken, AddressController.addAddressByApp);


module.exports = router;
