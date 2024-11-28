const Category = require("../models/Category");
const SubCategory = require("../models/Sub_categorys");
const ProductSubCategory = require("../models/Product_sub_categories");
const Product = require("../models/Product");
const CategoryController = {
  // Thêm danh mục
  create_category: async (req, res) => {
    try {
      if (!req.imageUrls || req.imageUrls.length === 0) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      const newCategory = new Category({
        namecategory: req.body.namecategory,
        description: req.body.description,
        imgcategory: req.imageUrls[0], // Lấy URL hình ảnh đầu tiên
      });
      const savedCategory = await newCategory.save();
      res.status(201).json(savedCategory);
    } catch (error) {
      console.error("Error while adding category:", error);
      res
        .status(500)
        .json({ message: "Error while adding category", error: error.message });
    }
  },
  getSubcategoriesByCategory: async (req, res) => {
    try {
      const categoryId = req.params.id;
      console.log("Category ID:", categoryId); // Log giá trị categoryId
      const subCategories = await SubCategory.find({ id_category: categoryId });
      console.log("Subcategories:", subCategories); // Log kết quả subCategories

      if (!subCategories || subCategories.length === 0) {
        return res
          .status(404)
          .json({ message: "No sub-categories found for this category" });
      }

      res.status(200).json(subCategories);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  getProductsBySubCategory: async (req, res) => {
    try {
      const subCategoryId = req.params.subCategoryId;

      // Tìm sản phẩm theo danh mục con
      const productSubCategories = await ProductSubCategory.find({
        sub_categories_id: subCategoryId,
      });
      const productIds = productSubCategories.map((psc) => psc.product_id);

      const products = await Product.find({ _id: { $in: productIds } });

      if (products.length === 0) {
        return res
          .status(404)
          .json({ message: "No products found for this sub-category" });
      }

      res.status(200).json(products);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching products", error: error.message });
    }
  },

  // Lấy tất cả danh mục
  getAllcategory: async (req, res) => {
    try {
      const categories = await Category.find();
      res.status(200).json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res
        .status(500)
        .json({ message: "Error fetching categories", error: error.message });
    }
  },

  // Cập nhật danh mục
  updateCategory: async (req, res) => {
    const categoryId = req.params.id;
    const updatedData = {};

    try {const category = await Category.findById(categoryId);
        if (!category) {
          return res.status(404).json({ message: "Category not found" });
        }
  
        // Cập nhật các trường
        updatedData.namecategory = req.body.namecategory || category.namecategory;
        updatedData.description = req.body.description || category.description;
  
        // Cập nhật hình ảnh nếu có
        if (req.imageUrls && req.imageUrls.length > 0) {
          updatedData.imgcategory = req.imageUrls[0]; // Lấy URL hình ảnh đầu tiên
        }
  
        // Cập nhật danh mục
        Object.assign(category, updatedData);
        const updatedCategory = await category.save();
        res.status(200).json({
          message: "Category updated successfully",
          category: updatedCategory,
        });
      } catch (error) {
        console.error("Error updating category:", error);
        res
          .status(500)
          .json({ message: "Error updating category", error: error.message });
      }
    },
  
    // Xóa danh mục
    deleteCategory: async (req, res) => {
      const categoryId = req.params.id;
  
      try {
        const deletedCategory = await Category.findByIdAndDelete(categoryId);
        if (!deletedCategory) {
          return res.status(404).json({ message: "Category not found" });
        }
  
        res.status(200).json({
          message: "Category deleted successfully",
          categoryId: deletedCategory._id,
        });
      } catch (error) {
        console.error("Error deleting category:", error);
        res
          .status(500)
          .json({ message: "Error deleting category", error: error.message });
      }
    },
  
    // Tìm kiếm danh mục
    searchCategory: async (req, res) => {
      try {
        const { keyword } = req.query;
        const regex = new RegExp(keyword, "i");
        const categories = await Category.find({
          $or: [{ namecategory: regex }, { description: regex }],
        });
        res.status(200).json(categories);
      } catch (error) {
        console.error("Error searching categories:", error);
        res
          .status(500)
          .json({ message: "Error searching categories", error: error.message });
      }
    },
  };
  
  module.exports = CategoryController;