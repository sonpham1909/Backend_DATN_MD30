var express = require('express');
const { uploadphoto, resizeAndUploadImage } = require('../controller/imageUploadMiddleware');
const productController = require('../controller/productController');
var router = express.Router();


//getAll Product
router.get('/',productController.get_all_product);

//get product by Id
router.get('/:id', productController.getProductById);

//Create product
router.post("/create_product",
    uploadphoto.array('imageUrls',10),
    resizeAndUploadImage,
    productController.create_product
);


//Add variants
router.post("/create_variant",
    productController.addVariant
);

//Delete variants
router.delete('/:productId/variants/:variantId', productController.deleteVariant);

router.put('/update_product/:id',uploadphoto.array('imageUrls',10),resizeAndUploadImage, productController.updateProduct);

//deleteProduct
router.delete('/:id/delete_product',productController.deleteProduct);


module.exports = router;
