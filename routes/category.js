var express = require('express');
const middlewareController = require('../controller/middlewareController');
const CategoryController = require('../controller/Categorycontroller');
var router = express.Router();

// Tạo danh mục
router.post("/create_category",middlewareController.verifyToken,middlewareController.verifyAdminToken,CategoryController.create_category);

// Lấy tất cả danh mục
router.get('/',middlewareController.verifyToken,CategoryController.getAllcategory);

// Cập nhật danh mục
router.put('/:id/update_category',middlewareController.verifyToken,middlewareController.verifyAdminToken,CategoryController.updateCategory);

// Xóa danh mục
router.delete('/:id/delete_category',middlewareController.verifyToken,middlewareController.verifyAdminToken,CategoryController.deleteCategory);
// tim kiem
router.get('/search',middlewareController.verifyToken,CategoryController.searchCategory);

module.exports = router;
//cong cong cong