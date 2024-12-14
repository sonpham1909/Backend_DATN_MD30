var express = require('express');
const middlewareController = require('../controller/middlewareController');
const userController = require('../controller/userController');
const { uploadphoto, resizeAndUploadImage } = require('../controller/imageUploadMiddleware');
var router = express.Router();
const {
    resetPassword,
    verifyOtp,
    sendResetPasswordEmail
} = require('../controller/userController');
/* GET users listing. */
router.get('/', middlewareController.verifyToken, userController.getAllUser);

//searchUser
router.get('/search', middlewareController.verifyToken, userController.searchUser);

//Add user
router.post('/add_user', middlewareController.verifyAdminToken, middlewareController.verifyToken, userController.AddUser);

//update avatar
router.put('/:id/avatar', middlewareController.verifyToken, middlewareController.checkUserBlock, uploadphoto.array('avatar', 1), resizeAndUploadImage, userController.updateAvatar);

//update user
router.put('/:id/update_user', middlewareController.verifyToken, middlewareController.checkUserBlock, userController.updateUser);

//delete user
router.put('/:id/block_user',
    middlewareController.verifyAdminToken,
    middlewareController.verifyToken,
    middlewareController.checkUserBlock,
    userController.blockUser);

//add_role
router.post('/:id/add_role',
    // middlewareController.verifyToken,
    // middlewareController.verifyAdminToken,
    // middlewareController.checkUserBlock,
    userController.addRoleToUser);

//delete role user
router.delete('/:id/delete_role', middlewareController.verifyToken, middlewareController.verifyAdminToken, middlewareController.checkUserBlock, userController.removeRoleFromUser);

//get role user
router.get('/:id/get_role_user', userController.getUserRoleById);

//lấy thông tin dựa trên id 
router.get('/:id/get_user_info', middlewareController.verifyToken, userController.getUserInfoById);

router.get('/getuserVersion1', middlewareController.verifyToken, userController.getUserByUserVs1);

// Reset password (token xác thực trước)
router.post('/reset-password', resetPassword);
// Gửi email đặt lại mật khẩu
router.post('/sendresetpasswordemail', sendResetPasswordEmail);
router.post('/verify-otp', verifyOtp);

module.exports = router;
