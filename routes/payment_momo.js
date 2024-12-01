const express = require("express");
const router = express.Router();
const payment_momo_Controller = require("../controller/payment_momoController");
const middlewareController = require("../controller/middlewareController");


router.post(
  "/CreateMomo_Byapp",
  middlewareController.verifyToken,
  payment_momo_Controller.initiateMoMoPayment
);

// router.post(
//   "/CheckStatus_Byapp",
//   middlewareController.verifyToken,
//   payment_momo_Controller.checkMoMoTransactionStatus
// );

router.post(
    "/callback",
    payment_momo_Controller.handleMoMoCallback
  );

module.exports = router;
