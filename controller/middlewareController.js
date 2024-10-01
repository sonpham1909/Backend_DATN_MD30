const jwt = require('jsonwebtoken'); // Thêm dòng này
const middlewareController = {
    verifyToken: async (req, res, next) => {
        const authHeader = req.headers.authorization; // Thay đổi ở đây
        if (authHeader) {
            const token = authHeader.split(" ")[1]; // Lấy token từ header
            jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, user) => {
                if (err) {
                    return res.status(403).json("Token is not valid");
                }
                req.user = user; // Lưu thông tin người dùng vào req
                next();
            });
        } else {
            res.status(401).json("you're not authenticated");
        }
    },
    
    verifyAdminToken: async (req, res, next) => {
        middlewareController.verifyToken(req, res, () => {
            if (req.user.id == req.params.id || req.user.admin) {
                next();
            } else {
                res.status(403).json("you're not allowed");
            }
        });
    }
}

module.exports = middlewareController;
