const express = require("express");
const router = express.Router();
const orderController = require("../controller/ordersController");
const middlewareController = require("../controller/middlewareController");

//get all order;

router.post( "/create_order_ByApp",
    middlewareController.verifyToken,
    orderController.createOrderByApp
  );

router.get("/", orderController.getAllOrders);
router.get("/status/:status", middlewareController.verifyToken, orderController.getOrdersByStatus);
router.get('/:orderId/byOrder', middlewareController.verifyToken, orderController.getOrderItemById);

//create order
router.post("/create_order", orderController.createOrder);

//cancle order
router.patch("/cancel", orderController.cancelOrder);

router.patch("/:orderId/change_status", orderController.changeStatusOrder);



module.exports = router;
