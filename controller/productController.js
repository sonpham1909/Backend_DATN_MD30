const { log } = require("debug/src/browser");
const Category = require("../models/Category");
const Product = require("../models/Product");
const cloudinary = require('../config/cloudinaryConfig');
const Product_sub_categories = require("../models/Product_sub_categories");
const removeAccents = require('remove-accents');

const productController = {

    //get all product
    get_all_product: async (req, res) => {
        try {

            const products = await Product.find();
            const productsWithTotalQuantity = products.map(product => {
                // Tính tổng số lượng từ các biến thể
                const totalQuantity = product.variants.reduce((sum, variant) => sum + variant.quantity, 0);

                if (product.variants.length > 0) {

                    // Lấy tất cả giá của các variant
                    const prices = product.variants.map(variant => variant.price);

                    // Tìm giá thấp nhất
                    const lowestPrice = Math.min(...prices);

                    return {
                        ...product._doc, // Sao chép toàn bộ thông tin sản phẩm
                        totalQuantity, // Thêm tổng số lượng vào sản phẩm
                        lowestPrice
                    };

                } else {
                    return {
                        ...product._doc, // Sao chép toàn bộ thông tin sản phẩm
                        totalQuantity,
                        lowestPrice: null // Thêm tổng số lượng vào sản phẩm
                    };



                }

            });
            res.status(200).json(productsWithTotalQuantity);

        } catch (error) {
            console.error('Error while getting product:', error);
            res.status(500).json({ message: 'Error while getting product', error: error.message });
        }

    },

    // Thêm sản phẩm
    create_product: async (req, res) => {
        try {
            // Kiểm tra dữ liệu đầu vào
            const { name, variants, material, description } = req.body;



            // Kiểm tra các biến thể có đúng định dạng không


            // Kiểm tra xem có hình ảnh nào được upload không
            if (!req.imageUrls || req.imageUrls.length === 0) {
                console.log('VNo images uploaded');
                return res.status(400).json({ message: 'No images uploaded' });
            }

            // Tạo sản phẩm mới
            const newProduct = new Product({
                name,
                // Tham chiếu đến ID danh mục
                variants,
                material,
                description,
                imageUrls: req.imageUrls, // Lưu trữ các URL hình ảnh
            });

            // Lưu sản phẩm vào cơ sở dữ liệu
            const savedProduct = await newProduct.save();
            res.status(201).json(savedProduct);
        } catch (error) {
            console.error('Error while adding product:', error);
            res.status(500).json({ message: 'Error while adding product', error: error.message });
        }
    },

    addVariant: async (req, res) => {
        const { productId, variant } = req.body; // productId là ID của sản phẩm, variant là thông tin biến thể mới

        try {
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            product.variants.push(variant); // Thêm biến thể mới vào mảng variants
            await product.save(); // Lưu lại thay đổi
            res.status(200).json(product);
        } catch (error) {
            console.error('Error while adding variant:', error);
            res.status(500).json({ message: 'Error while adding variant', error: error.message });
        }
    },
    getProductById: async (req, res) => {
        const { id } = req.params;

        try {
            const product = await Product.findById(id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Trả về toàn bộ thông tin sản phẩm, bao gồm cả danh sách biến thể
            res.status(200).json({
                ...product._doc, // Sao chép toàn bộ thông tin sản phẩm
                variants: product.variants // Thêm danh sách biến thể vào phản hồi
            });
        } catch (error) {
            console.error('Error while getting product by ID:', error);
            res.status(500).json({ message: 'Error while getting product by ID', error: error.message });
        }
    },
    deleteVariant: async (req, res) => {
        const { productId, variantId } = req.params;

        try {
            // Tìm sản phẩm theo productId
            const product = await Product.findById(productId);

            if (!product) {
                console.log('Sản phẩm không tồn tại');

                return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
            }

            // Tìm biến thể trong mảng variants và xóa nó
            const variantIndex = product.variants.findIndex(variant => variant._id.toString() === variantId);

            if (variantIndex === -1) {
                console.log('Biến thể ko tồn tại');
                return res.status(404).json({ message: 'Biến thể không tồn tại' });
            }

            // Xóa biến thể
            product.variants.splice(variantIndex, 1);

            // Lưu sản phẩm đã được cập nhật
            await product.save();

            return res.status(200).json({ message: 'Biến thể đã được xóa thành công' });
        } catch (error) {
            console.error('Error deleting variant:', error);
            return res.status(500).json({ message: 'Đã xảy ra lỗi' });
        }
    },
    updateProduct: async (req, res) => {
        const { id } = req.params; // ID sản phẩm từ tham số URL
        const updatedData = {};

        try {
            // Tìm sản phẩm theo ID
            const product = await Product.findById(id);
            if (!product) {
                console.log('Sản phẩm không tồn tại');
                return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
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

            // Cập nhật hình ảnh nếu có

            if (req.imageUrls && req.imageUrls.length > 0) {
                updatedData.imageUrls = [...(product.imageUrls || []), ...req.imageUrls]; // Kết hợp hình ảnh mới và cũ
            } else {
                updatedData.imageUrls = product.imageUrls; // Giữ lại hình ảnh cũ nếu không có hình ảnh mới
            }

            // Xử lý các hình ảnh muốn xóa
            // Xử lý các hình ảnh muốn xóa
            if (req.body.imagesToDelete) {
                const imagesToDelete = JSON.parse(req.body.imagesToDelete); // Lấy danh sách các hình ảnh muốn xóa

                // Lọc các hình ảnh không bị xóa
                updatedData.imageUrls = (updatedData.imageUrls || product.imageUrls || []).filter(url => !imagesToDelete.includes(url));

                // Xóa các hình ảnh không còn cần thiết trên Cloudinary
                for (const imageUrl of imagesToDelete) {
                    console.log('imageUrl:', imageUrl); // Kiểm tra URL

                    // Sử dụng biểu thức chính quy để lấy public ID từ URL
                    const publicIdMatch = imageUrl.match(/\/([^\/]*)\.[^\/]*$/);
                    const publicId = publicIdMatch ? publicIdMatch[1] : null; // public ID sẽ là nhóm thứ nhất nếu có match
                    console.log('publicId:', publicId); // Kiểm tra public ID

                    if (publicId) { // Kiểm tra nếu publicId có giá trị
                        await cloudinary.uploader.destroy(publicId); // Gọi API xóa trên Cloudinary
                    } else {
                        console.error('publicId is undefined for imageUrl:', imageUrl);
                    }
                }
            }


            // Chỉ cập nhật trường nếu nó có giá trị mới
            Object.assign(product, updatedData);
            const updatedProduct = await product.save(); // Lưu sản phẩm đã được cập nhật

            return res.status(200).json({ message: 'Sản phẩm đã được cập nhật thành công', product: updatedProduct });
        } catch (error) {
            console.error('Error updating product:', error);
            return res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật sản phẩm', error: error.message });
        }
    },
    deleteProduct: async (req, res) => {
        const { id } = req.params; // ID của sản phẩm cần xóa
        try {
            const product = await Product.findById(id);
            if (!product) {
                return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
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
            return res.status(200).json({ message: 'Sản phẩm đã được xóa thành công' });

        } catch (error) {
            console.error('Error deleting product:', error);
            return res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa sản phẩm', error: error.message });
        }
    },
    searchProduct: async (req, res) => {
        try {
            const { keyword } = req.query; // Lấy từ query params

            let query = {}; // Tạo query rỗng nếu không có từ khóa

            if (keyword) {
                const regex = new RegExp(keyword, 'i'); // Tìm kiếm không phân biệt hoa thường
                query = {
                    $or: [
                        { name: { $regex: regex } },
                        { description: { $regex: regex } }
                    ]
                };
            }

            // Tìm sản phẩm theo keyword hoặc trả về tất cả sản phẩm
            const products = await Product.find(query);

            const productsWithTotalQuantity = products.map(product => {
                // Kiểm tra biến thể có tồn tại và tính tổng số lượng
                const totalQuantity = product.variants?.reduce((sum, variant) => sum + variant.quantity, 0) || 0;

                if (product.variants?.length > 0) {
                    // Lấy tất cả giá của các biến thể
                    const prices = product.variants.map(variant => variant.price);

                    // Tìm giá thấp nhất
                    const lowestPrice = Math.min(...prices);

                    return {
                        ...product._doc, // Sao chép toàn bộ thông tin sản phẩm
                        totalQuantity,   // Thêm tổng số lượng vào sản phẩm
                        lowestPrice      // Thêm giá thấp nhất
                    };

                } else {
                    return {
                        ...product._doc,  // Sao chép toàn bộ thông tin sản phẩm
                        totalQuantity,    // Thêm tổng số lượng
                        lowestPrice: null // Không có giá nếu không có biến thể
                    };
                }
            });

            // Trả về danh sách sản phẩm kèm theo tổng số lượng và giá thấp nhất
            res.status(200).json(productsWithTotalQuantity);

        } catch (error) {
            console.log(error); // In lỗi ra console để xem chi tiết
            res.status(500).json({ message: 'Lỗi khi tìm kiếm sản phẩm', error: error.message });
        }
    },




};

module.exports = productController;



