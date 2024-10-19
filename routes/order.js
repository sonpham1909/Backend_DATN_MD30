const express = require('express');
const router = express.Router();
const orderController = require('../controller/ordersController');

//get all order;

router.get('/', orderController.getAllOrders);

//create order
router.post('/create_order', orderController.createOrder);

//cancle order
router.patch('/cancel', orderController.cancelOrder);




module.exports = router;