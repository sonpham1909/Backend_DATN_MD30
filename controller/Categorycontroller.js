const Category = require("../models/Category");

const CategoryController = {
    // Thêm danh mục
    create_category: async (req, res) => {
        try {
            const newCategory = new Category({
                namecategory: req.body.namecategory,
                description: req.body.description
            });
            const savedCategory = await newCategory.save();
            res.status(201).json(savedCategory); // Sử dụng mã trạng thái 201 cho việc tạo mới
        } catch (error) {
            console.error('Error while adding category:', error);
            res.status(500).json({ message: 'Error while adding category', error: error.message });
        }
    },

    // Lấy tất cả danh mục
    getAllcategory: async (req, res) => {
        try {
            const categories = await Category.find();
            res.status(200).json(categories);
        } catch (error) {
            console.error("Error fetching categories:", error);
            res.status(500).json({ message: 'Error fetching categories', error: error.message });
        }
    },

    // Cập nhật danh mục
    updateCategory: async (req, res) => {
        const categoryId = req.params.id; // Lấy ID từ params
        const updatedData = req.body; // Lấy dữ liệu cập nhật từ body

        try {
            const category = await Category.findById(categoryId);
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }

            // Cập nhật các trường
            category.namecategory = updatedData.namecategory || category.namecategory;
            category.description = updatedData.description || category.description;

            // Lưu lại thay đổi
            const updatedCategory = await category.save();
            res.status(200).json({ message: 'Category updated successfully', category: updatedCategory });
        } catch (error) {
            console.error("Internal Server Error:", error);
            res.status(500).json({ message: 'Error updating category', error: error.message });
        }
    },

    // Xóa danh mục
    deleteCategory: async (req, res) => {
        const categoryId = req.params.id;

        try {
            const deletedCategory = await Category.findByIdAndDelete(categoryId);
            if (!deletedCategory) {
                return res.status(404).json({ message: 'Category not found' });
            }

            res.status(200).json({ message: 'Category deleted successfully', categoryId: deletedCategory });
        } catch (error) {
            console.error("Error deleting category:", error);
            res.status(500).json({ message: 'Error deleting category', error: error.message });
        }
    },
    searchCategory: async (req, res) => {
        try {
            const { keyword } = req.query;
            const regex = new RegExp(keyword, 'i'); // Tìm kiếm không phân biệt hoa thường
            const categories = await Category.find({ $or: [{ namecategory: regex }, { description: regex }] });
            res.json(categories);
        } catch (error) {
            console.error("Error searching categories:", error);
            res.status(500).json({ message: 'Lỗi khi tìm kiếm danh mục', error: error.message });
        }
    }
    
}

module.exports = CategoryController;
