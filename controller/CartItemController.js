const Cart = require("../models/Cart");
const Cart_item = require("../models/Cart_item");
const Product = require("../models/Product");
const Variant = require("../models/Variants");

const CartItemController = {
    getCartItems: async (req, res) => {
        const userId = req.user.id; // Lấy userId từ req.user sau khi đã xác thực
        try {
            // Tìm giỏ hàng của người dùng
            const cart = await Cart.findOne({ user_id: userId, status: 'isActive' });
            if (!cart) {
                // Nếu giỏ hàng không tồn tại, trả về mảng rỗng
                return res.status(200).json([]);
            }
    
            // Tìm các mục trong giỏ hàng
            const cartItems = await Cart_item.find({ cart_id: cart._id }).populate('product_id', 'name');
            if (!cartItems || cartItems.length === 0) {
                // Nếu không có mục nào trong giỏ hàng, trả về mảng rỗng
                return res.status(200).json([]);
            }
    
            const cartWithName = cartItems.map(item => ({
                ...item._doc,
                name: item.product_id?.name,
            }));
    
            return res.status(200).json(cartWithName);
        } catch (error) {
            console.error('Error fetching cart items:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },
    

    addToCart: async (req, res) => {
        const userId = req.user.id; // Lấy userId từ req.user
        const { productId, size, color, quantity, variantId } = req.body;

        try {
            // Tìm giỏ hàng của người dùng
            let cart = await Cart.findOne({ user_id: userId, status: 'isActive' });

            // Tìm variant của sản phẩm
            const variant = await Variant.findById(variantId);

            // Tìm sản phẩm
            const product = await Product.findOne({ _id: productId });

            // Kiểm tra sản phẩm và variant có tồn tại không
            if (!product) {
                console.log('Product not found');
                return res.status(404).json({ message: 'Product not found' });
            }

            if (!variant) {
                console.log('Variant not found');
                return res.status(404).json({ message: 'Variant not found' });
            }

            // Kiểm tra kích thước và số lượng
            const variantSize = variant.sizes.find((item) => item.size === size);
            if (!variantSize) {
                console.log('Size not found');
                return res.status(404).json({ message: 'Size not found' });
            }

            if (variantSize.quantity < quantity) {
                return res.status(400).json({ message: 'Not enough quantity available' });
            }

            // Nếu giỏ hàng không tồn tại, tạo mới
            if (!cart) {
                cart = new Cart({ user_id: userId, status: 'isActive' });
                await cart.save();
            }

            const cartItems = await Cart_item.findOne({ cart_id: cart._id, product_id: productId, color: color, size: size });

            if (cartItems) {
                cartItems.quantity = Number(cartItems.quantity) + Number(quantity);
                await cartItems.save();
                return res.status(201).json(cartItems);
            }

            // Tạo mới Cart_item và thêm vào giỏ hàng
            const newItem = new Cart_item({
                cart_id: cart._id,
                product_id: productId,
                size,
                color,
                quantity,
                price: product.price,
                image_variant: variant.image,
            });

            await newItem.save();

            return res.status(201).json(newItem);
        } catch (error) {
            console.error('Error adding to cart:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    updateCartItemQuantity: async (req, res) => {
        const { cartItemId, quantity } = req.body;

        try {
            // Tìm mục giỏ hàng theo cartItemId
            const cartItem = await Cart_item.findById(cartItemId);

            if (!cartItem) {
                return res.status(404).json({ message: 'Cart item not found' });
            }

            const variant = await Variant.findOne({ color: cartItem.color, product_id: cartItem.product_id });

            if (!variant) {
                console.log('Variant item not found');
                return res.status(404).json({ message: 'Variant item not found' });
            }

            const variantSize = variant.sizes.find((item) => item.size === cartItem.size);
            if (!variantSize) {
                console.log('Size not found');
                return res.status(404).json({ message: 'Size not found' });
            }

            if (variantSize.quantity < quantity || quantity <= 0) {
                console.log('Quantity not available');
                return res.status(400).json({ message: 'Quantity not available' });
              }
              

            // Cập nhật số lượng
            cartItem.quantity = quantity;
            await cartItem.save();

            return res.status(200).json(cartItem);
        } catch (error) {
            console.error('Error updating cart item quantity:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    deleteCartItem: async (req, res) => {
        const { cartItemId } = req.params;

        try {
            // Tìm và xóa mục giỏ hàng
            const cartItem = await Cart_item.findByIdAndDelete(cartItemId);

            if (!cartItem) {
                return res.status(404).json({ message: 'Cart item not found' });
            }

            return res.status(200).json({ message: 'Cart item deleted successfully' });
        } catch (error) {
            console.error('Error deleting cart item:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },


    // Xóa toàn bộ các mục trong giỏ hàng
    clearCart: async (req, res) => {
        const userId = req.user.id; // Lấy userId từ req.user sau khi đã xác thực
        try {
            // Tìm giỏ hàng của người dùng
            const cart = await Cart.findOne({ user_id: userId, status: 'isActive' });

            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            // Xóa toàn bộ các mục trong giỏ hàng
            await Cart_item.deleteMany({ cart_id: cart._id });

            return res.status(200).json({ message: 'All cart items deleted successfully' });
        } catch (error) {
            console.error('Error deleting all cart items:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },
};



module.exports = CartItemController;
