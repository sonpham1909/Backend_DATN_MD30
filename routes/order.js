const express = require("express");
const router = express.Router();
const orderController = require("../controller/ordersController");
const middlewareController = require("../controller/middlewareController");

//App
router.post(
  "/create_order_ByApp",
  middlewareController.verifyToken,
  orderController.createOrderByApp
);

router.get(
  "/status/:status",
  middlewareController.verifyToken,
  orderController.getOrdersByStatus
);
router.get(
  "/:orderId/byOrder",
  middlewareController.verifyToken,
  orderController.getOrderItemById
);
router.get(
  "/purchased",
  middlewareController.verifyToken,
  orderController.getPurchasedProducts
);
router.post(
  "/cancelByApp/:orderId",
  middlewareController.verifyToken,
  orderController.cancelOrderByApp
);

router.get(
  "/:orderId/statusPayment",
  middlewareController.verifyToken,
  orderController.getStatusPayment
);

router.get(
  "/get_oder_byuser",
  middlewareController.verifyToken,
  orderController.getOrdersByUser
);

//Web
router.post("/create_order", orderController.createOrder);
router.patch("/cancel", orderController.cancelOrder);
router.patch("/:orderId/change_status", orderController.changeStatusOrder);
router.get("/", orderController.getAllOrders);

module.exports = router;
