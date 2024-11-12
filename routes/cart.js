const express = require('express');
const CartItemController = require('../controller/CartItemController');
const middleWareController = require('../controller/middlewareController');

const router = express.Router();


router.get('/:userId/cart_by_user',middleWareController.verifyToken,CartItemController.getCartItems);

router.post('/add_to_cart',CartItemController.addToCart);

router.put('/update_quantity',CartItemController.updateCartItemQuantity);

router.delete('/:cartItemId/delete',CartItemController.deleteCartItem);

module.exports = router;