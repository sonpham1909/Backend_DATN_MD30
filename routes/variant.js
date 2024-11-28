var express = require("express");
const middlewareController = require("../controller/middlewareController");
const variantsController = require("../controller/variantsController");
const {
  uploadphoto,
  resizeAndUploadImage,
} = require("../controller/imageUploadMiddleware");
var router = express.Router();

router.get("/", variantsController.getAllVariants);
router.get(
    "/colorsAndSizesBySubCategoryId/:subCategoryId",
    middlewareController.verifyToken,
  variantsController.GetColorsAndSizesBySubCategoryId
);

router.get(
  "/:productId/getVariantByProductId",
  middlewareController.verifyToken,
  variantsController.getVariantsByProductId
);

router.post(
  "/create_variant",
  uploadphoto.array("imageUrls", 2),
  resizeAndUploadImage,
  variantsController.createVariantVer2
);

router.put('/:product_id/update-quantity', 
  middlewareController.verifyToken,
  variantsController.updateVariantQuantity);


module.exports = router;
