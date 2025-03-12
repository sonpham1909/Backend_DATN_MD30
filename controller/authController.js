const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Role = require('../models/Role');
const UserRole = require('../models/UserRole');
const VerificationCode = require('../models/VerificationCode');

const authController = {
    //register
    registerUser: async (req, res) => {
        try {
            const { email, code } = req.body;
    
            // Kiểm tra mã xác thực
            const verification = await VerificationCode.findOne({ email, code });
            if (!verification || verification.expiry < Date.now()) {
                console.log('Bạn chưa xác thực mã hoặc mã đã hết hạn!');
                
                return res.status(400).json({ message: 'Bạn chưa xác thực mã hoặc mã đã hết hạn!' });
            }

            await verification.deleteOne();
    
            // Tạo salt và hash mật khẩu
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);
    
            // Tìm role "user"
            const userRole = await Role.findOne({ name: 'user' });
            if (!userRole) {
                return res.status(400).json({ message: 'Role không tìm thấy!' });
            }
    
            // Tạo người dùng mới
            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: hashed,
                phone_number: req.body.phone_number,
                full_name: req.body.full_name,
            });
    
            const user = await newUser.save();
    
            // Liên kết user với role
            const userRoleEntry = new UserRole({
                userId: user._id,
                roleId: userRole._id,
            });
            await userRoleEntry.save();
    
            // Xóa mã xác thực sau khi hoàn thành
            await VerificationCode.deleteOne({ email, code });
    
            res.status(200).json(user);
        } catch (error) {
            console.error('Lỗi khi đăng ký:', error);
            res.status(500).json(error);
        }
    }
    ,

    generateAccessToken: async (user) => {

        // Lấy các vai trò của người dùng từ bảng user_role
        const userRoles = await UserRole.find({ userId: user.id });

        const roles = await userRoles.map(role => role.roleId); // Giả định rằng roleId lưu trữ tên vai trò
        const rolesName = await Promise.all(userRoles.map(async role => {
            const roleData = await Role.findById(role.roleId); // Tìm thông tin vai trò
            return roleData ? roleData.name : null; // Giả định rằng tên vai trò được lưu trong trường 'name'
        }));
        return jwt.sign(
            {
                id: user.id,
                roles: rolesName
            },
            process.env.ACCESS_TOKEN_KEY,
            { expiresIn: "3h" }
        );
    },
    generateRefreshToken: async (user) => {
        // Lấy các vai trò của người dùng từ bảng user_role
        const userRoles = await UserRole.find({ userId: user.id });
        const rolesName = await Promise.all(userRoles.map(async role => {
            const roleData = await Role.findById(role.roleId); // Tìm thông tin vai trò
            return roleData ? roleData.name : null; // Giả định rằng tên vai trò được lưu trong trường 'name'
        }));
        const roles = await userRoles.map(role => role.roleId); // Giả định rằng roleId lưu trữ tên vai trò
        return jwt.sign(
            {
                id: user.id,
                roles: rolesName
            },
            process.env.REFRESH_TOKEN_KEY,
            { expiresIn: "300d" }
        );
    },

    //login
    loginUser: async (req, res) => {
        try {
            const user = await User.findOne({ username: req.body.username });
            if (!req.body.username || !req.body.password) {
                return res.status(400).json({ message: "Tên đăng nhập và mật khẩu không được để trống." });
            }
            if (!user) {
                console.log("wrong username or password");
                return res.status(401).json({ message: "wrong username or password!" });

            }
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) {
                console.log('Wrong username or password');

                return res.status(401).json({ message: "wrong username or password11" });

            }

            //Correct
            if (user && validPassword) {
                const accessToken = await authController.generateAccessToken(user);

                //refreshToken
                const refreshToken = await authController.generateRefreshToken(user);

                //save refreshToken in database 
                user.refreshToken = refreshToken;
                await user.save();

                //set cookie with refreshtoken
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: false,
                    path: '/',
                    sameSite: "strict",

                });

                if (user.block === true) {
                    return res.status(400).json({ message: 'Tài khoản bị khóa' });
                }

                const { password, ...others } = user._doc;
                console.log('Login successfully');
                res.status(200).json({ ...others, accessToken });


            }
        } catch (error) {
            console.error("Internal Server Error:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },
    //REDIS
    requestRefreshToken: async (req, res) => {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json("You're not authenticated");
        }

        // Tìm người dùng có refresh token tương ứng
        const user = await User.findOne({ refreshToken });


        if (!user) {
            return res.status(403).json("Refresh token is not valid");
        }

        // Xác thực refresh token
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, (err, decoded) => {
            if (err || user.id !== decoded.id) {
                return res.status(403).json("Refresh token is not valid");
            }

            // Tạo mới access token và refresh token
            const newAccessToken = authController.generateAccessToken(user);
            const newRefreshToken = authController.generateRefreshToken(user);


            // Cập nhật refresh token trong cơ sở dữ liệu
            user.refreshToken = newRefreshToken;
            user.save();

            // Lưu refresh token mới vào cookie
            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                path: "/",
                sameSite: "strict",
            });

            // Trả về access token mới
            res.status(200).json({ accessToken: newAccessToken });
        });
    },
    logoutUser: async (req, res) => {
        try {
            // Lấy refresh token từ cookie
            const refreshToken = req.cookies.refreshToken;

            // Nếu không có refresh token trong cookie, trả về lỗi
            if (!refreshToken) {
                return res.status(401).json("You're not authenticated");
            }

            // Tìm người dùng dựa trên refresh token trong cơ sở dữ liệu
            const user = await User.findOne({ refreshToken });

            if (!user) {
                return res.status(403).json("Refresh token is not valid");
            }

            // Xóa refresh token khỏi cơ sở dữ liệu
            user.refreshToken = null;
            await user.save();

            // Xóa refresh token khỏi cookie
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict",
            });

            // Phản hồi thành công
            return res.status(200).json("Logout successful");
        } catch (error) {
            console.error('Error in logout:', error); // Ghi log lỗi
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },
    loginAdmin: async (req, res) => {
        try {
            const user = await User.findOne({ username: req.body.username });


            if (!req.body.username || !req.body.password) {
                return res.status(400).json({ message: "Tên đăng nhập và mật khẩu không được để trống." });
            }
            if (!user) {
                console.log("wrong username or password");
                return res.status(401).json({ message: "wrong username or password!" });

            }

            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) {
                console.log('Wrong username or password');

                return res.status(401).json({ message: "wrong username or password11" });

            }



            //Correct
            if (user && validPassword) {
                const userRoles = await UserRole.find({ userId: user._id });


                // Kiểm tra xem có vai trò admin hay không
                let isAdmin = false;

                for (let userRole of userRoles) {
                    const role = await Role.findById(userRole.roleId);
                    if (role && role.name === 'admin') {
                        isAdmin = true;
                        break;
                    }
                }

                if (!isAdmin) {
                    return res.status(403).json({ message: 'Bạn không phải là admin' });
                }





                const accessToken = await authController.generateAccessToken(user);

                //refreshToken
                const refreshToken = await authController.generateRefreshToken(user);

                //save refreshToken in database 
                user.refreshToken = refreshToken;
                await user.save();

                //set cookie with refreshtoken
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: false,
                    path: '/',
                    sameSite: "strict",

                });

                if (user.block === true) {
                    return res.status(400).json({ message: 'Tài khoản bị khóa' });
                }

                const { password, ...others } = user._doc;
                console.log('Login successfully');
                res.status(200).json({ ...others, accessToken });



            }
        } catch (error) {
            console.error("Internal Server Error:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },


}

module.exports = authController;