var express = require('express');
const middlewareController = require('../controller/middlewareController');
const CategoryController = require('../controller/categorycontroller');
const { uploadphoto, resizeAndUploadImage } = require('../controller/imageUploadMiddleware');
var router = express.Router();


// Tạo danh mục
router.post(
    "/create_category",

    uploadphoto.array('imgcategory', 1), // Middleware để tải lên hình ảnh
    resizeAndUploadImage, // Middleware để xử lý và lưu trữ hình ảnh
    CategoryController.create_category // Hàm xử lý tạo danh mục
);

// Lấy tất cả danh mục
router.get('/', middlewareController.verifyToken, CategoryController.getAllcategory);

// Cập nhật danh mục
router.put(
    '/:id/update_category',
  
    uploadphoto.array('imgcategory', 1), // Middleware để tải lên hình ảnh khi cập nhật
    resizeAndUploadImage, // Middleware để xử lý và lưu trữ hình ảnh
    CategoryController.updateCategory // Hàm xử lý cập nhật danh mục
);

// Xóa danh mục
router.delete(
    '/:id/delete_category',
    CategoryController.deleteCategory // Hàm xử lý xóa danh mục
);

// Tìm kiếm danh mục
router.get('/search', middlewareController.verifyToken, CategoryController.searchCategory);

router.get('/:id/subcategories',middlewareController.verifyToken, CategoryController.getSubcategoriesByCategory); // Bỏ middleware

router.get('/subcategories/:subCategoryId/products',middlewareController.verifyToken, CategoryController.getProductsBySubCategory);

module.exports = router;
