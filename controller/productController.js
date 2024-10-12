const { log } = require("debug/src/browser");
const Category = require("../models/Category");
const Product = require("../models/Product");


const productController = {

    //get all product
    get_all_product: async (req, res) => {
        try {

            const products = await Product.find().populate('category','namecategory'); // Lấy tất cả sản phẩm
            const productsWithTotalQuantity = products.map(product => {
                // Tính tổng số lượng từ các biến thể
                const totalQuantity = product.variants.reduce((sum, variant) => sum + variant.quantity, 0);
                return {
                    ...product._doc, // Sao chép toàn bộ thông tin sản phẩm
                    totalQuantity // Thêm tổng số lượng vào sản phẩm
                };
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
            const { name, category, variants,material, description } = req.body;

            // Kiểm tra xem danh mục có tồn tại không
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(404).json({ message: 'Category not found' });
            }

            // Kiểm tra các biến thể có đúng định dạng không
            if (!variants || !Array.isArray(variants) || variants.length === 0) {
                console.log('Variants must be an array and cannot be empty');
                return res.status(400).json({ message: 'Variants must be an array and cannot be empty' });
               
                
            }

            // Kiểm tra xem có hình ảnh nào được upload không
            if (!req.imageUrls || req.imageUrls.length === 0) {
                console.log('VNo images uploaded');
                return res.status(400).json({ message: 'No images uploaded' });
            }

            // Tạo sản phẩm mới
            const newProduct = new Product({
                name,
                category, // Tham chiếu đến ID danh mục
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
        const { id } = req.params; // Lấy ID từ tham số trong URL

        try {
            const product = await Product.findById(id).populate('category', 'namecategory'); // Tìm sản phẩm theo ID và populate danh mục
            
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.status(200).json(product);
        } catch (error) {
            console.error('Error while getting product by ID:', error);
            res.status(500).json({ message: 'Error while getting product by ID', error: error.message });
        }
    },

};

module.exports = productController;



