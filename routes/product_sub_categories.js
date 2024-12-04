var express = require('express');
const middlewareController = require('../controller/middlewareController');
const ProductSubCategoryController = require('../controller/product_sub_categoriesController'); // Đổi tên cho phù hợp
const router = express.Router();

// Tạo danh mục con cho sản phẩm
router.post(
    "/create_product_sub_category",
    ProductSubCategoryController.createProductSubCategory // Hàm xử lý tạo danh mục con sản phẩm
);

// Lấy tất cả danh mục con sản phẩm
router.get('/', middlewareController.verifyToken, ProductSubCategoryController.getAllProductSubCategories);

// Cập nhật danh mục con sản phẩm
router.put(
    '/:id/update_product_sub_category',
    ProductSubCategoryController.updateProductSubCategory // Hàm xử lý cập nhật danh mục con sản phẩm
);

// Xóa danh mục con sản phẩm
router.delete(
    '/:id/delete_product_sub_category',
    ProductSubCategoryController.deleteProductSubCategory // Hàm xử lý xóa danh mục con sản phẩm
);

// Tìm kiếm danh mục con sản phẩm
router.get('/search', middlewareController.verifyToken, ProductSubCategoryController.searchProductSubCategory);

module.exports = router;
