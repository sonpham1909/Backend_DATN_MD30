const express = require('express');
const router = express.Router();
const shippingMethodController = require('../controller/shippingController');


//getall shipping method
router.get('/', shippingMethodController.getAllShippingMethods);

//get Shipping method by Id
router.get('/:id', shippingMethodController.getShippingMethodById);

//create Shipping method
router.post('/create_shipping_method', shippingMethodController.createShippingMethod);

//update Shipping method
router.put('/update_shipping_method', shippingMethodController.updateShippingMethod);

//delete shipping method
router.delete('/remove_shipping_method', shippingMethodController.deleteShippingMethod);
router.get('/:id/cost', shippingMethodController.getShippingCostById);

module.exports = router;

