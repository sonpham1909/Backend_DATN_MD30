const express = require('express');
const Order_items = require('../models/Order_items');
const order_items_controller = require('../controller/order_items_Controller');


const router = express.Router();


router.get('/',order_items_controller.getAllOrderItems);

router.get('/top_selling',order_items_controller.getTopSellingProducts);

router.get('/:orderId', order_items_controller.getOrderItemsByOrderId);

module.exports = router;