var express = require('express');
const middlewareController = require('../controller/middlewareController');
const userController = require('../controller/userController');
const { uploadphoto, resizeAndUploadImage } = require('../controller/imageUploadMiddleware');
var router = express.Router();

/* GET users listing. */
router.get('/',middlewareController.verifyToken,userController.getAllUser);

//update avatar
router.put('/:id/avatar',middlewareController.verifyToken,uploadphoto.array('avatar', 1),resizeAndUploadImage,userController.updateAvatar);

//update user
router.put('/:id/update_user',middlewareController.verifyToken,userController.updateUser);

//delete user
router.delete('/:id/delete_user',middlewareController.verifyAdminToken,middlewareController.verifyToken,userController.deleteUser)

module.exports = router;
