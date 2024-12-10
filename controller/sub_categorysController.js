const SubCategory = require("../models/Sub_categorys"); // Chỉ giữ lại SubCategory model

const SubCategoryController = {
    // Thêm sub_category
    create_sub_category: async (req, res) => {
        try {
            const { id_category, name } = req.body;
            if (!id_category || !name) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            const newSubCategory = new SubCategory({
                name: req.body.name,
                image: req.imageUrls ? req.imageUrls[0] : null, // Nếu có ảnh, lấy ảnh đầu tiên
                id_category: id_category
            });

            const savedSubCategory = await newSubCategory.save();
            res.status(201).json(savedSubCategory);
        } catch (error) {
            console.error('Error while adding sub-category:', error);
            res.status(500).json({ message: 'Error while adding sub-category', error: error.message });
        }
    },

    // Lấy tất cả sub_categorys
    getAllSubCategories: async (req, res) => {
        try {
            const subCategories = await SubCategory.find().populate('id_category');
            res.status(200).json(subCategories);
        } catch (error) {
            console.error("Error fetching sub-categories:", error);
            res.status(500).json({ message: 'Error fetching sub-categories', error: error.message });
        }
    },
        getSubcategoriesByCategory: async (req, res) => {
          try {
            console.log('Category ID:', req.params.id); // Log category ID
            const categoryId = req.params.id;
            const subCategories = await SubCategory.find({ id_category: categoryId });
            console.log('Subcategories found:', subCategories); // Log kết quả
      
            if (subCategories.length === 0) {
              return res.status(404).json({ message: 'No sub-categories found for this category' });
            }
      
            res.status(200).json(subCategories);
          } catch (error) {
            console.error('Error fetching sub-categories:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
          }
        },
            
    // Cập nhật sub_category
    updateSubCategory: async (req, res) => {
        const subCategoryId = req.params.id; 
        const updatedData = {};

        try {
            const subCategory = await SubCategory.findById(subCategoryId);
            if (!subCategory) {
                return res.status(404).json({ message: 'Sub-category not found' });
            }

            // Cập nhật các trường
            updatedData.name = req.body.name || subCategory.name;

            // Cập nhật hình ảnh nếu có
            if (req.imageUrls && req.imageUrls.length > 0) {
                updatedData.image = req.imageUrls[0]; // Lấy URL hình ảnh đầu tiên
            }

            // Cập nhật sub_categoryObject.assign(subCategory, updatedData);
            const updatedSubCategory = await subCategory.save();
            res.status(200).json({ message: 'Sub-category updated successfully', subCategory: updatedSubCategory });
        } catch (error) {
            console.error("Error updating sub-category:", error);
            res.status(500).json({ message: 'Error updating sub-category', error: error.message });
        }
    },

    // Xóa sub_category
    deleteSubCategory: async (req, res) => {
        const subCategoryId = req.params.id;

        try {
            const deletedSubCategory = await SubCategory.findByIdAndDelete(subCategoryId);
            if (!deletedSubCategory) {
                return res.status(404).json({ message: 'Sub-category not found' });
            }

            res.status(200).json({ message: 'Sub-category deleted successfully', subCategoryId: deletedSubCategory._id });
        } catch (error) {
            console.error("Error deleting sub-category:", error);
            res.status(500).json({ message: 'Error deleting sub-category', error: error.message });
        }
    },
    getSubcategoriesByCategory: async (req, res) => {
        try {
            const categoryId = req.params.id;
            const subCategories = await SubCategory.find({ id_category: categoryId }).populate('id_category');

            if (subCategories.length === 0) {
                return res.status(404).json({ message: 'No sub-categories found for this category' });
            }

            res.status(200).json(subCategories);
        } catch (error) {
            console.error('Error fetching sub-categories:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    getSubcategoriesByCategory: async (req, res) => {
        try {
            const categoryId = req.params.id;
            const subCategories = await SubCategory.find({ id_category: categoryId }).populate('id_category');

            if (subCategories.length === 0) {
                return res.status(404).json({ message: 'No sub-categories found for this category' });
            }

            res.status(200).json(subCategories);
        } catch (error) {
            console.error('Error fetching sub-categories:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

}

module.exports = SubCategoryController;