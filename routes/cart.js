const express = require('express');
const CartItemController = require('../controller/CartItemController');
const middleWareController = require('../controller/middlewareController');

const router = express.Router();

// Sử dụng middleware verifyToken để đảm bảo tất cả các route này đều yêu cầu xác thực
router.get('/cart_by_user', middleWareController.verifyToken, CartItemController.getCartItems);
router.post('/add_to_cart', middleWareController.verifyToken, CartItemController.addToCart);
router.put('/update_quantity', middleWareController.verifyToken, CartItemController.updateCartItemQuantity);
router.delete('/:cartItemId/delete', middleWareController.verifyToken, CartItemController.deleteCartItem);
router.delete('/clearCart', middleWareController.verifyToken, CartItemController.clearCart);

module.exports = router;
