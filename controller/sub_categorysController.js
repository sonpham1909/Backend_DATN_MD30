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
// Cập nhật sub_category
updateSubCategory: async (req, res) => {
    const subCategoryId = req.params.id;

    try {
        // Kiểm tra xem sub-category có tồn tại không
        const subCategory = await SubCategory.findById(subCategoryId);
        if (!subCategory) {
            return res.status(404).json({ message: 'Sub-category not found' });
        }

        // Chuẩn bị dữ liệu cập nhật
        const updatedData = {
            name: req.body.name || subCategory.name, // Nếu không có tên mới, giữ tên cũ
        };

        // Cập nhật hình ảnh nếu có
        if (req.imageUrls && req.imageUrls.length > 0) {
            updatedData.image = req.imageUrls[0]; // Lấy URL hình ảnh đầu tiên
        }

        // Thực hiện cập nhật
        const updatedSubCategory = await SubCategory.findByIdAndUpdate(
            subCategoryId,
            updatedData,
            { new: true } // Tùy chọn này trả về document đã được cập nhật
        );

        res.status(200).json({
            message: 'Sub-category updated successfully',
            subCategory: updatedSubCategory,
        });
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
    searchSubCategories: async (req, res) => {
        try {
            const searchQuery = req.query.name || '';  // Lấy từ query parameter, mặc định là chuỗi rỗng

            // Tìm kiếm subcategories theo tên, có thể thay đổi nếu muốn tìm kiếm thêm các trường khác
            const subCategories = await SubCategory.find({
                name: { $regex: searchQuery, $options: 'i' } // Tìm kiếm không phân biệt chữ hoa hay thường
            }).populate('id_category');

            if (subCategories.length === 0) {
                return res.status(404).json({ message: 'No sub-categories found matching the search criteria' });
            }

            res.status(200).json(subCategories);
        } catch (error) {
            console.error('Error searching sub-categories:', error);
            res.status(500).json({ message: 'Error searching sub-categories', error: error.message });
        }
    }
}

module.exports = SubCategoryController;