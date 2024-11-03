var express = require('express');
const { uploadphoto, resizeAndUploadImage } = require('../controller/imageUploadMiddleware');
const productController = require('../controller/productController');
const middlewareController = require('../controller/middlewareController');
var router = express.Router();


//getAll Product
router.get('/',productController.get_all_product);
router.get('/latest', productController.getLatestProducts);

router.get('/search_products', productController.searchProduct);

//Lấy sản phẩm phổ biến

router.get('/popular',middlewareController.verifyToken,productController.getPopularProducts);


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

//searchProduct

// Lấy thông tin sản phẩm cùng với tổng số đánh giá và điểm trung bình
router.get('/reviews/:id', middlewareController.verifyToken,productController.getProductWithReviews);




// Route để lấy 20 sản phẩm mới nhất


module.exports = router;
