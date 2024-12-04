const ProductSubCategory = require('../models/Product_sub_categories'); // Đảm bảo import đúng model

const { log } = require("debug/src/browser");
const Category = require("../models/Category");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinaryConfig");
const removeAccents = require("remove-accents");
const Review = require("../models/Review");
const Variant = require('../models/Variants');
const { default: mongoose } = require('mongoose');


function removeDiacritics(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}


const productController = {
  getProductByIdApp: async (req, res) => {
    try {
      const productId = req.params.product_id;

      // Tìm kiếm sản phẩm theo id
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({
        message: "Error fetching product",
        error: error.message,
      });
    }
  },
  // ... Các hàm khác của ReviewController


    getProductsByVariants: async (req, res) => {
        try {
            const { sub_category_id, size, color_code, minPrice, maxPrice } = req.query;
            
            // Bước 1: Tìm sản phẩm theo danh mục con (`sub_category_id`)
            let products = [];
            if (sub_category_id) {
                // Tìm các sản phẩm thuộc danh mục con cụ thể
                const productSubCategories = await ProductSubCategory.find({ sub_categories_id: sub_category_id });
                const productIds = productSubCategories.map((psc) => psc.product_id);
                
                products = await Product.find({ _id: { $in: productIds } });
                if (products.length === 0) {
                    console.log("No products found for sub_category_id");
                    return res.status(200).json([]);  // Trả về mảng trống nếu không tìm thấy sản phẩm nào
                }
            } else {
                // Nếu không có `sub_category_id`, lấy tất cả sản phẩm
                products = await Product.find();
            }
    
            // Bước 2: Lọc sản phẩm dựa trên biến thể (`Variant`)
            let variantQuery = {};
            // Tạo điều kiện lọc biến thể dựa trên danh sách sản phẩm đã tìm thấy từ trước
            if (products.length > 0) {
                variantQuery.product_id = { $in: products.map((p) => p._id) };
            }
            
            if (color_code) {
                variantQuery.color_code = { $in: Array.isArray(color_code) ? color_code.map((c) => c.trim()) : [color_code.trim()] };
            }
            if (size) {
                variantQuery["sizes.size"] = { $in: Array.isArray(size) ? size : [size] };
            }
    
            console.log("Variant Query:", variantQuery);
    
            // Tìm các biến thể phù hợp với query
            const variants = await Variant.find(variantQuery);
            console.log("Variants found:", variants);
    
            if (!variants || variants.length === 0) {
                console.log("No variants found for given criteria");
                return res.status(200).json([]);  // Trả về mảng trống nếu không tìm thấy biến thể nào
            }
    
            // Lấy danh sách ID sản phẩm từ biến thể
            const variantProductIds = variants.map((v) => v.product_id);
    
            // Lọc sản phẩm từ danh sách ID sản phẩm đã tìm thấy từ biến thể
            products = await Product.find({ _id: { $in: variantProductIds } });
    
            if (products.length === 0) {
                console.log("No products match after filtering variants");
                return res.status(200).json([]);  // Trả về mảng trống nếu không tìm thấy sản phẩm nào sau khi lọc
            }
    
            // Bước 3: Lọc thêm dựa trên khoảng giá nếu có
            if (minPrice) {
                products = products.filter((p) => p.price >= parseFloat(minPrice));
            }
            if (maxPrice) {
                products = products.filter((p) => p.price <= parseFloat(maxPrice));
            }
    
            // Trả về danh sách sản phẩm đã được lọc
            res.status(200).json(products);
        } catch (error) {
            console.error("Error during getProductsByVariants:", error);
            res.status(500).json({ message: "Server error", error });
        }
    },
    
    
    
    
      
      
  // Hàm lấy sản phẩm phổ biến
  getPopularProducts: async (req, res) => {
    try {
      // Tìm tất cả các sản phẩm và sắp xếp theo tổng số lượng đánh giá giảm dần
      const popularProducts = await Product.aggregate([
        {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "product_id",
            as: "reviews",
          },
        },
        {
          $addFields: {
            totalReviews: { $size: "$reviews" },
            averageRating: {
              $cond: {
                if: { $gt: [{ $size: "$reviews" }, 0] },
                then: { $avg: "$reviews.rating" },
                else: 0,
              },
            },
          },
        },
        {
          $match: { totalReviews: { $gt: 0 } }, // Chỉ lấy sản phẩm có ít nhất một đánh giá
        },
        {
          $sort: { totalReviews: -1 }, // Sắp xếp giảm dần theo số lượng đánh giá
        },
        {
          $limit: 10, // Giả sử bạn muốn lấy 10 sản phẩm phổ biến nhất
        },
      ]);

      res.status(200).json(popularProducts);
    } catch (error) {
      console.error("Error while getting popular products:", error);
      res.status(500).json({ message: "Error while getting popular products" });
    }
  },

  //Lấy tổng bình luận đánh giá
  // Trong file productController.js
  getProductWithReviews: async (req, res) => {
    try {
      const productId = req.params.id;

      // Tìm sản phẩm theo ID
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Sản phẩm không tồn tại" });
      }

      // Tìm tất cả các đánh giá liên quan đến sản phẩm đó
      const reviews = await Review.find({ product_id: productId });

      // Tính tổng số đánh giá và điểm trung bình
      const totalReviews = reviews.length;
      const averageRating =
        totalReviews > 0
          ? reviews.reduce((acc, review) => acc + Number(review.rating), 0) /
            totalReviews
          : 0;

      // Trả về thông tin sản phẩm cùng với tổng số đánh giá và điểm trung bình
      res.status(200).json({
        product,
        reviews, // Trả thêm danh sách đánh giá để sử dụng trên giao diện nếu cần
        totalReviews,
        averageRating: parseFloat(averageRating.toFixed(2)), // Làm tròn đến 2 chữ số thập phân
      });
    } catch (err) {
      res.status(500).json({ message: "Lỗi hệ thống", error: err.message });
    }
  },

  // Hàm lấy 20 sản phẩm mới nhất
  getLatestProducts: async (req, res) => {
    try {
      // Tìm tất cả các sản phẩm mới nhất (giả định bạn có một trường createdAt hoặc similar để sắp xếp)
      const latestProducts = await Product.find()
        .sort({ createdAt: -1 })
        .limit(10); // Giả sử bạn muốn lấy 10 sản phẩm mới nhất
      res.status(200).json(latestProducts);
    } catch (error) {
      console.error("Error while getting latest products:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  //get all product
  get_all_product: async (req, res) => {
    try {
      const products = await Product.find();
  
      const productWithQuantity = await Promise.all(
        products.map(async (product) => {
          const variants = await Variant.find({ product_id: product._id });
  
          // Calculate total quantity by summing quantities in the sizes array of each variant
          const totalQuantity = variants.reduce((sum, variant) => {
            const sizeQuantity = variant.sizes.reduce((sizeSum, size) => sizeSum + size.quantity, 0);
            return sum + sizeQuantity;
          }, 0);
  
          return {
            ...product.toObject(),
            totalQuantity,
            
          };
        })
      );
  
      res.status(200).json(productWithQuantity);
    } catch (error) {
      console.error("Error while getting product:", error);
      res
        .status(500)
        .json({ message: "Error while getting product", error: error.message });
    }
  },
  
  // Thêm sản phẩm
  create_product: async (req, res) => {
    try {
      // Kiểm tra dữ liệu đầu vào
      const { name, price, material, description } = req.body;

      // Kiểm tra các biến thể có đúng định dạng không

      // Kiểm tra xem có hình ảnh nào được upload không
      if (!req.imageUrls || req.imageUrls.length === 0) {
        console.log("VNo images uploaded");
        return res.status(400).json({ message: "No images uploaded" });
      }

      // Tạo sản phẩm mới
      const newProduct = new Product({
        name,
        // Tham chiếu đến ID danh mục
        material,
        price,
        description,
        imageUrls: req.imageUrls, // Lưu trữ các URL hình ảnh
      });

      // Lưu sản phẩm vào cơ sở dữ liệu
      const savedProduct = await newProduct.save();
      res.status(201).json(savedProduct);
    } catch (error) {
      console.error("Error while adding product:", error);
      res
        .status(500)
        .json({ message: "Error while adding product", error: error.message });
    }
  },

  addVariant: async (req, res) => {
    const { productId, variant } = req.body; // productId là ID của sản phẩm, variant là thông tin biến thể mới

    try {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      product.variants.push(variant); // Thêm biến thể mới vào mảng variants
      await product.save(); // Lưu lại thay đổi
      res.status(200).json(product);
    } catch (error) {
      console.error("Error while adding variant:", error);
      res
        .status(500)
        .json({ message: "Error while adding variant", error: error.message });
    }
  },
 

  getProductById: async (req, res) => {
    const { id } = req.params;
  
    // Kiểm tra nếu `id` không phải là ObjectId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }
  
    try {
      const product = await Product.findById(id);
      if (!product) {
        console.log('Product not found');
        return res.status(404).json({ message: "Product not found" });
      }
  
      // Trả về toàn bộ thông tin sản phẩm, bao gồm cả danh sách biến thể
      res.status(200).json({
        ...product._doc, // Sao chép toàn bộ thông tin sản phẩm
        variants: product.variants, // Thêm danh sách biến thể vào phản hồi
      });
    } catch (error) {
      console.error("Error while getting product by ID:", error);
      res.status(500).json({
        message: "Error while getting product by ID",
        error: error.message,
      });
    }
  },
  
  deleteVariant: async (req, res) => {
    const { productId, variantId } = req.params;

    try {
      // Tìm sản phẩm theo productId
      const product = await Product.findById(productId);

      if (!product) {
        console.log("Sản phẩm không tồn tại");

        return res.status(404).json({ message: "Sản phẩm không tồn tại" });
      }

      // Tìm biến thể trong mảng variants và xóa nó
      const variantIndex = product.variants.findIndex(
        (variant) => variant._id.toString() === variantId
      );

      if (variantIndex === -1) {
        console.log("Biến thể ko tồn tại");
        return res.status(404).json({ message: "Biến thể không tồn tại" });
      }

      // Xóa biến thể
      product.variants.splice(variantIndex, 1);

      // Lưu sản phẩm đã được cập nhật
      await product.save();

      return res
        .status(200)
        .json({ message: "Biến thể đã được xóa thành công" });
    } catch (error) {
      console.error("Error deleting variant:", error);
      return res.status(500).json({ message: "Đã xảy ra lỗi" });
    }
  },
  updateProduct: async (req, res) => {
    const { id } = req.params; // ID sản phẩm từ tham số URL
    const updatedData = {};

    try {
      // Tìm sản phẩm theo ID
      const product = await Product.findById(id);
      if (!product) {
        console.log("Sản phẩm không tồn tại");
        return res.status(404).json({ message: "Sản phẩm không tồn tại" });
      }

      // Cập nhật các trường thông tin chỉ khi có giá trị mới
      if (req.body.name) {
        updatedData.name = req.body.name; // Cập nhật tên nếu có
      }

      if (req.body.material) {
        updatedData.material = req.body.material; // Cập nhật chất liệu nếu có
      }
      if (req.body.description) {
        updatedData.description = req.body.description; // Cập nhật mô tả nếu có
      }

      if (req.body.price) {
        updatedData.price = req.body.price; // Cập nhật mô tả nếu có
      }

      // Cập nhật hình ảnh nếu có

      if (req.imageUrls && req.imageUrls.length > 0) {
        updatedData.imageUrls = [
          ...(product.imageUrls || []),
          ...req.imageUrls,
        ]; // Kết hợp hình ảnh mới và cũ
      } else {
        updatedData.imageUrls = product.imageUrls; // Giữ lại hình ảnh cũ nếu không có hình ảnh mới
      }

      // Xử lý các hình ảnh muốn xóa
      // Xử lý các hình ảnh muốn xóa
      if (req.body.imagesToDelete) {
        const imagesToDelete = JSON.parse(req.body.imagesToDelete); // Lấy danh sách các hình ảnh muốn xóa

        // Lọc các hình ảnh không bị xóa
        updatedData.imageUrls = (
          updatedData.imageUrls ||
          product.imageUrls ||
          []
        ).filter((url) => !imagesToDelete.includes(url));

        // Xóa các hình ảnh không còn cần thiết trên Cloudinary
        for (const imageUrl of imagesToDelete) {
          console.log("imageUrl:", imageUrl); // Kiểm tra URL

          // Sử dụng biểu thức chính quy để lấy public ID từ URL
          const publicIdMatch = imageUrl.match(/\/([^\/]*)\.[^\/]*$/);
          const publicId = publicIdMatch ? publicIdMatch[1] : null; // public ID sẽ là nhóm thứ nhất nếu có match
          console.log("publicId:", publicId); // Kiểm tra public ID

          if (publicId) {
            // Kiểm tra nếu publicId có giá trị
            await cloudinary.uploader.destroy(publicId); // Gọi API xóa trên Cloudinary
          } else {
            console.error("publicId is undefined for imageUrl:", imageUrl);
          }
        }
      }

      // Chỉ cập nhật trường nếu nó có giá trị mới
      Object.assign(product, updatedData);
      const updatedProduct = await product.save(); // Lưu sản phẩm đã được cập nhật

      return res.status(200).json({
        message: "Sản phẩm đã được cập nhật thành công",
        product: updatedProduct,
      });
    } catch (error) {
      console.error("Error updating product:", error);
      return res.status(500).json({
        message: "Đã xảy ra lỗi khi cập nhật sản phẩm",
        error: error.message,
      });
    }
  },
  deleteProduct: async (req, res) => {
    const { id } = req.params; // ID của sản phẩm cần xóa
    try {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: "Sản phẩm không tồn tại" });
      }

      // Xóa hình ảnh sản phẩm từ Cloudinary trước khi xóa sản phẩm khỏi cơ sở dữ liệu
      if (product.imageUrls && product.imageUrls.length > 0) {
        for (const imageUrl of product.imageUrls) {
          // Lấy public ID từ URL hình ảnh
          const publicIdMatch = imageUrl.match(/\/([^\/]*)\.[^\/]*$/);
          const publicId = publicIdMatch ? publicIdMatch[1] : null;

          if (publicId) {
            await cloudinary.uploader.destroy(publicId); // Gọi API xóa trên Cloudinary
          }
        }
      }

      // Xóa sản phẩm khỏi cơ sở dữ liệu
      await product.deleteOne();
      await Product_sub_categories.deleteMany({ product_id: id });
      return res
        .status(200)
        .json({ message: "Sản phẩm đã được xóa thành công" });
    } catch (error) {
      console.error("Error deleting product:", error);
      return res.status(500).json({
        message: "Đã xảy ra lỗi khi xóa sản phẩm",
        error: error.message,
      });
    }
  },
  searchProduct: async (req, res) => {
    try {
      const { keyword } = req.query; // Lấy từ query params

      let query = {}; // Tạo query rỗng nếu không có từ khóa

      if (keyword) {
        const regex = new RegExp(keyword, "i"); // Tìm kiếm không phân biệt hoa thường
        query = {
          $or: [
            { name: { $regex: regex } },
            { description: { $regex: regex } },
          ],
        };
      }

      // Tìm sản phẩm theo keyword hoặc trả về tất cả sản phẩm
      const products = await Product.find(query);

      const productsWithTotalQuantity = products.map((product) => {
        // Kiểm tra biến thể có tồn tại và tính tổng số lượng
        const totalQuantity =
          product.variants?.reduce(
            (sum, variant) => sum + variant.quantity,
            0
          ) || 0;

        if (product.variants?.length > 0) {
          // Lấy tất cả giá của các biến thể
          const prices = product.variants.map((variant) => variant.price);

          // Tìm giá thấp nhất
          const lowestPrice = Math.min(...prices);

          return {
            ...product._doc, // Sao chép toàn bộ thông tin sản phẩm
            totalQuantity, // Thêm tổng số lượng vào sản phẩm
            lowestPrice, // Thêm giá thấp nhất
          };
        } else {
          return {
            ...product._doc, // Sao chép toàn bộ thông tin sản phẩm
            totalQuantity, // Thêm tổng số lượng
            lowestPrice: null, // Không có giá nếu không có biến thể
          };
        }
      });

      // Trả về danh sách sản phẩm kèm theo tổng số lượng và giá thấp nhất
      res.status(200).json(productsWithTotalQuantity);
    } catch (error) {
      console.log(error); // In lỗi ra console để xem chi tiết
      res
        .status(500)
        .json({ message: "Lỗi khi tìm kiếm sản phẩm", error: error.message });
    }
  },
  searchSimilarProducts: async (req, res) => {
    try {
      const { keyword } = req.query;

      if (!keyword) {
        return res.status(400).json({ message: "Keyword is required for search" });
      }

      // Bước 1: Chuẩn bị từ khóa để tìm kiếm không phân biệt hoa thường và sử dụng fuzzy search
      const normalizedKeyword = removeDiacritics(keyword.toLowerCase());
      const regex = new RegExp(`${normalizedKeyword.split(" ").join(".*")}`, "i");

      // Bước 2: Tìm kiếm sản phẩm với từ khóa chỉ trong tên sản phẩm đã chuẩn hóa
      const exactProducts = await Product.find({
        normalized_name: { $regex: regex }
      });

      // Bước 3: Tìm kiếm các sản phẩm gần giống nếu không có sản phẩm chính xác
      let similarProducts = [];
      if (exactProducts.length === 0) {
        console.log("No exact products found matching the keyword");
        const fuzzyRegex = new RegExp(keyword.split(" ").map(removeDiacritics).join(".*"), "i");
        similarProducts = await Product.find({
          normalized_name: { $regex: fuzzyRegex }
        }).limit(10); // Giới hạn số lượng sản phẩm gần giống trả về
      } else {
        // Nếu tìm thấy sản phẩm chính xác, tiếp tục tìm các sản phẩm gần giống nhưng không trùng với sản phẩm chính xác
        const fuzzyRegex = new RegExp(keyword.split(" ").map(removeDiacritics).join(".*"), "i");
        similarProducts = await Product.find({
          normalized_name: { $regex: fuzzyRegex },
          _id: { $nin: exactProducts.map((product) => product._id) },
        }).limit(10);
      }
      const productsWithDetails = [...exactProducts, ...similarProducts].map((product) => product.toObject());

      res.status(200).json(productsWithDetails);
    } catch (error) {
      console.error("Error during searchSimilarProducts:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

};

module.exports = productController;
