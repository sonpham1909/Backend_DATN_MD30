const ProductSubCategory = require("../models/Product_sub_categories"); // Import mô hình ProductSubCategory

const ProductSubCategoryController = {
    // Thêm danh mục con cho sản phẩm
    createProductSubCategory: async (req, res) => {
        try {
            const { sub_categories_id, product_id } = req.body;

            const newProductSubCategory = new ProductSubCategory({
                sub_categories_id,
                product_id,
            });

            const savedProductSubCategory = await newProductSubCategory.save();
            res.status(201).json(savedProductSubCategory);
        } catch (error) {
            console.error('Error while adding product sub-category:', error);
            res.status(500).json({ message: 'Error while adding product sub-category', error: error.message });
        }
    },

    // Lấy tất cả danh mục con sản phẩm
    getAllProductSubCategories: async (req, res) => {
        try {
            const productSubCategories = await ProductSubCategory.find().populate('sub_categories_id product_id');
            res.status(200).json(productSubCategories);
        } catch (error) {
            console.error("Error fetching product sub-categories:", error);
            res.status(500).json({ message: 'Error fetching product sub-categories', error: error.message });
        }
    },

    // Cập nhật danh mục con sản phẩm
    updateProductSubCategory: async (req, res) => {
        const subCategoryId = req.params.id;

        try {
            const productSubCategory = await ProductSubCategory.findById(subCategoryId);
            if (!productSubCategory) {
                return res.status(404).json({ message: 'Product sub-category not found' });
            }

            // Cập nhật các trường
            productSubCategory.sub_categories_id = req.body.sub_categories_id || productSubCategory.sub_categories_id;
            productSubCategory.product_id = req.body.product_id || productSubCategory.product_id;

            const updatedProductSubCategory = await productSubCategory.save();
            res.status(200).json({ message: 'Product sub-category updated successfully', productSubCategory: updatedProductSubCategory });
        } catch (error) {
            console.error("Error updating product sub-category:", error);
            res.status(500).json({ message: 'Error updating product sub-category', error: error.message });
        }
    },

    // Xóa danh mục con sản phẩm
    deleteProductSubCategory: async (req, res) => {
        const subCategoryId = req.params.id;

        try {
            const deletedProductSubCategory = await ProductSubCategory.findByIdAndDelete(subCategoryId);
            if (!deletedProductSubCategory) {
                return res.status(404).json({ message: 'Product sub-category not found' });
            }

            res.status(200).json({ message: 'Product sub-category deleted successfully', subCategoryId: deletedProductSubCategory._id });
        } catch (error) {
            console.error("Error deleting product sub-category:", error);
            res.status(500).json({ message: 'Error deleting product sub-category', error: error.message });
        }
    },

    // Tìm kiếm danh mục con sản phẩm
    searchProductSubCategory: async (req, res) => {
        try {
            const { keyword } = req.query;
            const regex = new RegExp(keyword, 'i');
            const productSubCategories = await ProductSubCategory.find({ $or: [{ sub_categories_id: regex }, { product_id: regex }] }).populate('sub_categories_id product_id');
            res.status(200).json(productSubCategories);
        } catch (error) {
            console.error("Error searching product sub-categories:", error);
            res.status(500).json({ message: 'Error searching product sub-categories', error: error.message });
        }
    }
}

module.exports = ProductSubCategoryController;
