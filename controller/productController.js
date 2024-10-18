const { log } = require("debug/src/browser");
const Category = require("../models/Category");
const Product = require("../models/Product");


const productController = {

    //get all product
    get_all_product: async (req, res) => {
        try {

            const products = await Product.find().populate('category', 'namecategory'); // Lấy tất cả sản phẩm
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
            const { name, category, variants, material, description } = req.body;

            // Kiểm tra xem danh mục có tồn tại không
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(404).json({ message: 'Category not found' });
            }

            // Kiểm tra các biến thể có đúng định dạng không
            

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
            if (!product) {return res.status(404).json({ message: 'Product not found' });
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
        const product = await Product.findById(id).populate('category', 'namecategory'); // Tìm sản phẩm theo ID
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
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        // Tìm biến thể trong mảng variants và xóa nó
        const variantIndex = product.variants.findIndex(variant => variant._id.toString() === variantId);

        if (variantIndex === -1) {
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
}

};

module.exports = productController;