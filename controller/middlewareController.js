const jwt = require('jsonwebtoken'); // Thêm dòng này
const User = require('../models/User');
const Role = require('../models/Role');
const UserRole = require('../models/UserRole');
const middlewareController = {
    verifyToken: async (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(" ")[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_KEY, async (err, user) => {
                if (err) {
                    return res.status(403).json("Token is not valid");
                }
    
                // Tìm người dùng trong cơ sở dữ liệu
                const foundUser   = await User.findById(user.id);
                if (!foundUser  ) {
                    return res.status(404).json({ message: 'User  not found' });
                }
    
                const roles = await UserRole.find({ userId: foundUser ._id });
                const rolesNames = await Promise.all(roles.map(role => Role.findById(role.roleId)));
    
                // Chỉ lấy tên vai trò
                const roleNames = rolesNames.map(role => role.name); // Lấy tên vai trò
    
                // Gán thông tin người dùng và danh sách tên vai trò vào req.user
                req.user = { id: foundUser ._id, ...foundUser .toObject(), roles: roleNames }; // Thay đổi _id thành id
                console.log(req.user);
                
                next();
            });
        } else {
            res.status(401).json("You're not authenticated");
        }
    },
    verifyAdminToken: async (req, res, next) => {
        
        middlewareController.verifyToken(req, res, () => {
            // Lấy thông tin vai trò từ req.user
            const roles = req.user.roles;
            
           

            if (!roles || !roles.includes('admin')) { // Kiểm tra xem có vai trò admin không
                console.log('Access denied. Admins only.');
                
                return res.status(403).json({ message: 'Access denied. Admins only.' });
            }
            next();
        });
    },
    checkUserBlock: async (req,res,next) => {
        const userId = req.user.id; // Lấy ID người dùng từ req.user (được xác thực)

        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            if (user.block) {
                return res.status(403).json({ message: 'User account is blocked' }); // Nếu bị khóa
            }
    
            next(); // Nếu không bị khóa, tiếp tục tới route tiếp theo
        } catch (error) {
            res.status(500).json({ message: 'Error checking user status', error: error.message });
        }
    }
}

module.exports = middlewareController;
