var express = require('express');
const middlewareController = require('../controller/middlewareController');
const SubCategoryController = require('../controller/sub_categorysController'); // Thêm SubCategoryController
const { uploadphoto, resizeAndUploadImage } = require('../controller/imageUploadMiddleware');
var router = express.Router();

// Tạo sub_category
router.post(
    "/create_sub_category",

    uploadphoto.array('image', 1), // Middleware để tải lên hình ảnh cho sub_category
    resizeAndUploadImage, // Middleware để xử lý và lưu trữ hình ảnh
    SubCategoryController.create_sub_category // Hàm xử lý tạo sub_category
);

// Lấy tất cả sub_category
router.get('/', middlewareController.verifyToken, SubCategoryController.getAllSubCategories);

// Cập nhật sub_category
router.put(
    '/:id/update_sub_category',
   
    uploadphoto.array('image', 1), // Middleware để tải lên hình ảnh khi cập nhật sub_category
    resizeAndUploadImage, // Middleware để xử lý và lưu trữ hình ảnh
    SubCategoryController.updateSubCategory // Hàm xử lý cập nhật sub_category
);

// Xóa sub_category
router.delete(
    '/:id/delete_sub_category',

    SubCategoryController.deleteSubCategory // Hàm xử lý xóa sub_category
);
router.get('/search',  SubCategoryController.searchSubCategories);
module.exports = router;