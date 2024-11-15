const { log } = require("debug/src/browser");
const Product = require("../models/Product");
const Variant = require("../models/Variants");
const ProductSubCategory = require("../models/Product_sub_categories");
const variantsController = {
  // Endpoint để lấy tất cả màu sắc và kích cỡ khả dụng cho mục đích lọc
  GetColorsAndSizesBySubCategoryId: async (req, res) => {
    try {
      const { subCategoryId } = req.params;
      const productSubCategories = await ProductSubCategory.find({ sub_categories_id: subCategoryId });
      const productIds = productSubCategories.map(item => item.product_id);
      
      // Lấy danh sách các biến thể của sản phẩm thuộc danh mục con
      const variants = await Variant.find({ product_id: { $in: productIds } });
  
      // Lấy các màu sắc và kích cỡ duy nhất từ danh sách biến thể
      const colors = [...new Set(variants.map(variant => variant.color_code))];
      const sizes = [...new Set(variants.flatMap(variant => variant.sizes.map(size => size.size)))];
  
      res.status(200).json({ colors, sizes });
    } catch (error) {
      console.error('Error fetching variants by subcategory:', error);
      res.status(500).json({ message: 'Error fetching variants by subcategory', error });
    }
  },
  
  getAllVariants: async (req, res) => {
    try {
      const variants = await Variant.find();
      res.status(200).json(variants);
    } catch (error) {
      res.status(500).json({ message: "Lỗi hệ thống", error: err.message });
    }
  },
  createVariant: async (req, res) => {
    try {
      // Kiểm tra dữ liệu đầu vào
      const { product_id, size, color, color_code, price, stock } = req.body;

      // Kiểm tra xem có hình ảnh nào được upload không
      if (!req.imageUrls || req.imageUrls.length === 0) {
        console.log("No images uploaded");
        return res.status(400).json({ message: "No images uploaded" });
      }

      // Kiểm tra sự tồn tại của sản phẩm
      const product = await Product.findById(product_id);

      if (!product) {
        console.log("Product not found");
        return res.status(400).json({ message: "Product not found" });
      }

      // Sử dụng giá mặc định từ product nếu không có giá trong yêu cầu
      const variantPrice = price || product.price;

      // Tạo biến thể mới
      const newVariant = new Variant({
        product_id,
        size,
        color,
        color_code,
        image_variant: req.imageUrls[0],
        price: variantPrice, // Sử dụng giá đã kiểm tra
        stock,
      });

      // Lưu biến thể vào database
      await newVariant.save();

      res
        .status(201)
        .json({ message: "Variant created successfully", variant: newVariant });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
  createVariantVer2: async (req, res) => {
    try {
      // Kiểm tra dữ liệu đầu vào
      const { product_id, color, image, sizes, color_code } = req.body;
      console.log({
        product_id,
        color,
        color_code,
        sizes,
        image: req.imageUrls,
      });

      if (!req.imageUrls || req.imageUrls.length === 0) {
        console.log("No images uploaded");
        return res.status(400).json({ message: "No images uploaded" });
      }
      const parsedSizes = sizes.map((size) => {
        try {
          return JSON.parse(size); // Chuyển đổi từng phần tử về đối tượng
        } catch (error) {
          console.error("Error parsing size:", size);
          throw new Error("Invalid size format"); // Ném lỗi nếu không hợp lệ
        }
      });

      // Kiểm tra các biến thể có đúng định dạng không
      if (
        !product_id ||
        !color ||
        !color_code ||
        !sizes ||
        !Array.isArray(parsedSizes)
      ) {
        return res
          .status(400)
          .json({ message: "Vui lòng cung cấp đầy đủ thông tin" });
      }
      // Kiểm tra xem sản phẩm có tồn tại không
      const product = await Product.findById(product_id);
      if (!product) {
        return res.status(404).json({ message: "Sản phẩm không tồn tại" });
      }

      // Tạo sản phẩm mới
      const newVariant = new Variant({
        product_id,
        color,
        color_code,
        image: req.imageUrls[0],
        sizes: parsedSizes,
      });

      // Lưu biến thể mới vào cơ sở dữ liệu
      await newVariant.save();

      return res
        .status(201)
        .json({ message: "Biến thể sản phẩm được tạo thành công", newVariant });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Đã xảy ra lỗi khi tạo biến thể sản phẩm" });
    }
  },
  getVariantsByProductId: async (req, res) => {
    try {
      const { productId } = req.params;

      // Tìm sản phẩm theo ID
      const product = await Product.findById(productId);
      if (!product) {
        console.log("Product not found");
        return res.status(400).json({ message: "Product not found" }); // Dừng hàm ở đây nếu không tìm thấy sản phẩm
      }

      // Tìm các biến thể dựa trên ID sản phẩm
      const variants = await Variant.find({ product_id: productId });
      res.status(200).json(variants);
    } catch (error) {
      console.log("Lỗi: ", error);
      res.status(500).json({ message: "Lỗi hệ thống", error });
    }
  },


  // variantController.js

 updateVariantQuantity: async (req, res) => {
  try {
    const { product_id } = req.params;
    const { size, color, quantity } = req.body;

    // Find the variant based on product_id, color, and size
    const variant = await Variant.findOne({
      product_id,
      color,
      'sizes.size': size,
    });

    if (!variant) {
      return res.status(404).json({ message: 'Variant not found' });
    }

    // Update the quantity for the specific size
    const sizeIndex = variant.sizes.findIndex(s => s.size === size);
    if (sizeIndex !== -1) {
      variant.sizes[sizeIndex].quantity += quantity;
    }

    await variant.save();

    res.status(200).json({ message: 'Variant quantity updated', variant });
  } catch (error) {
    console.error('Error updating variant quantity:', error);
    res.status(500).json({ message: 'Failed to update variant quantity', error: error.message });
  }
 }

// Endpoint to update variant quantity


};

module.exports = variantsController;
