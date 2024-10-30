var express = require('express');
const middlewareController = require('../controller/middlewareController');
const variantsController = require('../controller/variantsController');
const { uploadphoto, resizeAndUploadImage } = require('../controller/imageUploadMiddleware');
var router = express.Router();


router.get('/', variantsController.getAllVariants);

router.get('/:productId/getVariantByProductId', variantsController.getVariantsByProductId);

router.post('/create_variant', uploadphoto.array('imageUrls', 2),
    resizeAndUploadImage,
    variantsController.createVariantVer2);

module.exports = router;