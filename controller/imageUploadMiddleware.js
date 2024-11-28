const multer = require('multer');
const cloudinary = require('../config/cloudinaryConfig');

// cấu hình multer để lưu file trong bộ nhớ tạm
const uploadphoto = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20_000_000 }, //giới hạn file 20MB
    fileFilter: (req, file, cb)=>{
        //Chỉ cho phép upload file ảnh 
        if(file.mimetype.startsWith('image/')) cb(null,true);
        else cb(new Error('Not an image! Please upload only images.'), false);
    },
});


const uploadToCloudinary = (buffer, options = {}) => {
    return new Promise((resolve, reject)=>{

        cloudinary.uploader.upload_stream(options, (error, result) =>{
            if(error) reject(error);
            else resolve(result);

        }).end(buffer);
       
    });
};


//Middleware resize and upload image to cloudinary
const resizeAndUploadImage = async(req,res,next) => {
    // neu ko co file, tiep tuc middleware ke tiep
    if(!req.files || req.files.length === 0) return next();

    try{
        // upload tung file va resize anh truoac khi upload
        const uploadePromises = req.files.map(file =>
            uploadToCloudinary(file.buffer,{
                tranformation: [{with: 200, height: 200, crop: 'limit', quality:'auto'}]
            })
        );

        //cho tat ca anh duoc upload
        const result = await Promise.all(uploadePromises);

        //luu URLs của ảnh đã upload vào request để sử dụng sau đó
        req.imageUrls = result.map(result => result.url);

        next();//
    }catch(error){
        next(error);
    }
}

module.exports = {uploadphoto, resizeAndUploadImage};