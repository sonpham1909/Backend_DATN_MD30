const express = require('express');
const middlewareController = require('../controller/middlewareController');
const {
    uploadphoto,
    resizeAndUploadImage,
  } = require("../controller/imageUploadMiddleware");
const notificationCotroller = require('../controller/notificationCotroller');
const router = express.Router();

router.post('/genaral',
    middlewareController.verifyToken,
    middlewareController.verifyAdminToken,
    uploadphoto.array('imageUrls',4),
    resizeAndUploadImage,
    notificationCotroller.sendGenaralNotifi
);

router.get('/getNotificationUser',
    middlewareController.verifyToken,
    notificationCotroller.getUserNotifications
);
router.get('/getAllNotifi',
    middlewareController.verifyToken,
    notificationCotroller.getAllNotifi
);


module.exports = router;