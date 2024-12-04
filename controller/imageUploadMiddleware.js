const multer = require('multer');
const cloudinary = require('../config/cloudinaryConfig');

// Cấu hình multer để lưu file trong bộ nhớ tạm
const uploadphoto = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20_000_000 }, // Giới hạn file 20MB
    fileFilter: (req, file, cb) => {
        // Chỉ cho phép upload file ảnh 
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Not an image! Please upload only images.'), false);
    },
});

const uploadToCloudinary = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        }).end(buffer);
    });
};

// Middleware xử lý ảnh base64 và upload lên Cloudinary
const resizeAndUploadImage = async (req, res, next) => {
    // Kiểm tra nếu không có ảnh trong form data hoặc ảnh base64 trong request
    if (!req.files || req.files.length === 0) {
        // Kiểm tra ảnh base64 gửi từ frontend
        if (req.body.images && Array.isArray(req.body.images)) {
            try {
                // Xử lý ảnh base64
                const uploadePromises = req.body.images.map(image => {
                    // Chuyển đổi base64 thành buffer
                    const matches = image.match(/^data:image\/([a-zA-Z]*);base64,([^\"]*)/);
                    const type = matches && matches[1] ? matches[1] : null;
                    const base64Data = matches && matches[2] ? matches[2] : null;

                    if (base64Data) {
                        // Chuyển base64 thành buffer
                        const buffer = Buffer.from(base64Data, 'base64');
                        return uploadToCloudinary(buffer, {
                            transformation: [{ width: 200, height: 200, crop: 'limit', quality: 'auto' }]
                        });
                    }
                    return null;
                });

                // Lọc các promise hợp lệ
                const validPromises = uploadePromises.filter(Boolean);

                // Chờ cho tất cả các ảnh được upload
                const result = await Promise.all(validPromises);

                // Lưu URLs của ảnh đã upload vào request để sử dụng sau đó
                req.imageUrls = result.map(result => result.url);

                return next();
            } catch (error) {
                return next(error);
            }
        } else {
            // Nếu không có ảnh base64 hoặc file, tiếp tục middleware kế tiếp
            return next();
        }
    }

    try {
        // Upload từng file và resize ảnh trước khi upload
        const uploadePromises = req.files.map(file =>
            uploadToCloudinary(file.buffer, {
                transformation: [{ width: 200, height: 200, crop: 'limit', quality: 'auto' }]
            })
        );

        // Chờ cho tất cả ảnh được upload
        const result = await Promise.all(uploadePromises);

        // Lưu URLs của ảnh đã upload vào request để sử dụng sau đó
        req.imageUrls = result.map(result => result.url);

        return next();
    } catch (error) {
        return next(error);
    }
};

module.exports = { uploadphoto, resizeAndUploadImage };
