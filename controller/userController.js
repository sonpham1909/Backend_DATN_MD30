const User = require('../models/User');
const bcrypt = require('bcrypt');
const UserRole = require('../models/UserRole');
const Role = require('../models/Role');

const userController = {

     getUserByUserVs1 :async (req, res) => {
        // Lấy userId từ request (có thể lấy từ token hoặc từ params)
        const userId = req.user?.id || req.params.id;
      
        try {
          // Tìm thông tin người dùng từ bảng User
          const user = await User.findById(userId);
      
          // Kiểm tra nếu không tìm thấy người dùng
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
      
          // Trả về thông tin của người dùng
          return res.status(200).json({ user });
        } catch (error) {
          console.error("Error fetching user:", error.message);
          return res.status(500).json({ error: "Internal Server Error" });
        }
      },

    getUserInfoById: async (req, res) => {
        try {
            const userId = req.params.id;
            const user = await User.findById(userId); // Lấy tất cả thông tin người dùng
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user information', error: error.message });
        }
    },
    
    //getAlluser
    getAllUser: async (req, res) => {
        try {
            // Lấy danh sách tất cả người dùng
            const users = await User.find();
    
            // Lấy vai trò cho từng người dùng
            const usersWithRoles = await Promise.all(users.map(async (user) => {
                // Truy vấn vai trò của người dùng từ bảng UserRole
                const userRoles = await UserRole.find({ userId: user._id }).populate('roleId'); // Giả sử roleId là tham chiếu tới Role
    
                // Lấy tên vai trò
                const roles = userRoles.map(role => role.roleId.name); // Giả định rằng tên vai trò lưu trong trường 'name'
    
                // Trả về thông tin người dùng kèm theo danh sách vai trò
                return {
                    ...user._doc, // Sử dụng ._doc để lấy tất cả thông tin từ user
                    roles, // Thêm danh sách vai trò
                };
            }));
    
            // Trả về danh sách người dùng kèm theo vai trò
            res.status(200).json(usersWithRoles);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching users', error: error.message });
        }
    },
     AddUser: async (req, res) =>{
        try {

            const salt = await bcrypt.genSalt(10);
            const hashed =  await bcrypt.hash(req.body.password, salt);
            const userRole = await Role.findOne({ name: 'user' });
            if (!userRole) {
                return res.status(400).json({ message: 'Role not found' });
            }
         

            //create new user
            const newUser = await new User({
                username: req.body.username,
                password: hashed,
                email: req.body.email,
                phone_number: req.body.phone_number,
                full_name: req.body.full_name,
              
            });
            const user = await newUser.save();

            const userRoleEntry = new UserRole({
                userId: user._id,
                roleId: userRole._id
            });

            await userRoleEntry.save();


           
            res.status(200).json(user);
        } catch (error) {
            console.error('Error while adding user:', error); // Log lỗi
            res.status(500).json(error);
        }
    },


    //update Avatar
    updateAvatar: async (req, res) =>{
        try{
            const {id} = req.params;
            if(!req.imageUrls || req.imageUrls.length === 0){
                return res.status(400).json({message: 'No image uploaded'});

            }
            const updateAvatarUser = await User.findByIdAndUpdate(
                id,
                {avatar: req.imageUrls[0]},
                {new: true}
            );

            if (!updateAvatarUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json(updateAvatarUser);


        }catch(error){
            res.status(500).json({ message: error.message });
        }
    },
    updateUser: async (req, res) => {
        const userId = req.params.id; // Lấy ID người dùng từ params
        const updatedData = req.body; // Lấy dữ liệu cập nhật từ body
        const { oldPassword, password: newPassword } = updatedData; // Lấy mật khẩu cũ và mật khẩu mới từ dữ liệu gửi lên
    
        try {
            // Lấy thông tin người dùng hiện tại
            const user = await User.findById(userId);
    
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            // Kiểm tra nếu có mật khẩu mới và yêu cầu mật khẩu cũ
            if (newPassword) {
                if (!oldPassword) {
                    return res.status(400).json({ message: 'Old password is required' });
                }
    
                // So sánh mật khẩu cũ với mật khẩu trong cơ sở dữ liệu
                const isMatch = await bcrypt.compare(oldPassword, user.password);
                if (!isMatch) {
                    return res.status(400).json({ message: 'Incorrect old password' });
                }
    
                // Băm mật khẩu mới
                const salt = await bcrypt.genSalt(10);
                updatedData.password = await bcrypt.hash(newPassword, salt); // Cập nhật mật khẩu mới đã băm
            }
    
            // Kiểm tra xem có cập nhật username không
            if (updatedData.username) {
                const existingUser = await User.findOne({ username: updatedData.username });

                // Nếu username đã tồn tại và không phải của người dùng này
                if (existingUser && existingUser._id.toString() !== userId) {
                    return res.status(400).json({ message: 'Username already taken' });
                }
            }

            // Cập nhật người dùng
            const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });

            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Trả về thông tin người dùng đã được cập nhật
            res.status(200).json({ message: 'User updated successfully', user: updatedUser });
        } catch (error) {
            // Xử lý lỗi
            res.status(500).json({ message: 'Error updating user', error: error.message });
        }
    },
    //delete user
    blockUser: async (req, res) => {
        const userId = req.params.id;
        const currentUserId = req.user.id; // ID của người dùng đang đăng nhập
    
        try {
            // Kiểm tra xem người dùng có đang cố gắng chặn chính mình không
            if (userId === currentUserId) {
                return res.status(403).json({ message: 'Bạn không thể chặn chính mình' });
            }
    
            // Tìm người dùng để chặn theo ID
            const blockUser = await User.findById(userId);
    
            if (!blockUser) {
                return res.status(404).json({ message: 'Người dùng không tồn tại' });
            }
    
            // Cập nhật trạng thái chặn
            blockUser.block = !blockUser.block; // Đảo ngược trạng thái chặn
            await blockUser.save();
    
            res.status(200).json({ message: 'Đã thay đổi trạng thái chặn người dùng thành công', user: blockUser });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi chặn người dùng', error: error.message });
        }
    },

    searchUser: async (req, res) => {
        try {
            const { keyword, roleName } = req.query; // Lấy từ query params
            const regex = new RegExp(keyword, 'i'); // Tìm kiếm không phân biệt hoa thường
    
            // Tìm tất cả người dùng
            const users = await User.find({ $or: [{ username: regex }, { email: regex }] });
    
            // Lấy vai trò cho từng người dùng
            const usersWithRoles = await Promise.all(users.map(async (user) => {
                // Truy vấn vai trò của người dùng từ bảng UserRole
                const userRoles = await UserRole.find({ userId: user._id }).populate('roleId'); // Giả sử roleId là tham chiếu tới Role
    
                // Lấy tên vai trò
                const roles = userRoles.map(role => role.roleId.name); // Giả định rằng tên vai trò lưu trong trường 'name'
    
                // Trả về thông tin người dùng kèm theo danh sách vai trò
                return {
                    ...user._doc, // Sử dụng ._doc để lấy tất cả thông tin từ user
                    roles, // Thêm danh sách vai trò
                };
            }));
    
            // Nếu có vai trò được chỉ định trong query, lọc người dùng theo vai trò
            if (roleName) {
                const filteredUsers = usersWithRoles.filter(user => user.roles.includes(roleName));
                return res.status(200).json(filteredUsers);
            }
    
            // Trả về danh sách người dùng kèm theo vai trò
            res.status(200).json(usersWithRoles);
    
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi tìm kiếm người dùng' });
        }
    },
    addRoleToUser: async (req, res) => {
        try {
            const userId = req.params.id; // Lấy ID người dùng từ tham số URL
            console.log('Role from DB:', req.body.roles);
            const roleToAdd = await Role.findOne({ name: new RegExp(`^${req.body.role}$`, 'i') });
            // const roleToAdd = await Role.findOne({ name: "admin"});
            console.log('Role from DB:', roleToAdd);
    
            if (!roleToAdd) {
                console.log('Role not found');
                
                return res.status(400).json({ message: 'Role not found' });
            }
    
            // Kiểm tra xem vai trò đã tồn tại cho người dùng chưa
            const existingUserRole = await UserRole.findOne({
                userId: userId,
                roleId: roleToAdd._id
            });
    
            if (existingUserRole) {
                console.log('Role already assigned to user');
                return res.status(400).json({ message: 'Role already assigned to user' });
            }
    
            // Tạo bản ghi mới trong bảng user_roles
            const newUserRole = new UserRole({
                userId: userId,
                roleId: roleToAdd._id
            });
    
            await newUserRole.save();
    
            res.status(200).json({ message: 'Role added to user successfully' });
        } catch (error) {
            console.error('Error adding role:', error); // Ghi log lỗi để dễ dàng gỡ lỗi
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    removeRoleFromUser: async (req, res) => {
        try {
            console.log('Request Body:', req.body); // Log để xem req.body
            console.log('Request Params:', req.params); // Log để xem req.params
            console.log('Request Query:', req.query); // Log để xem req.query
            
            const userId = req.params.id; // Lấy ID người dùng từ tham số URL
            console.log('Role from DB:', req.body.role);
           
            const roleToRemove = await Role.findOne({ name: new RegExp(`^${req.body.role}$`, 'i') }); // Tìm vai trò
            const roleByUser = await UserRole.find({userId: userId});
    
            if (!roleToRemove) {
                console.log('Role not found');
                
                return res.status(400).json({ message: 'Role not found' });
            }

            if(roleByUser.length < 2){
                console.log('User must have a role');
                return res.status(400).json({message: 'User must have a role'});
            }
    
            // Xóa bản ghi khỏi bảng user_roles
            await UserRole.deleteOne({
                userId: userId,
                roleId: roleToRemove._id
            });
    
            res.status(200).json({ message: 'Role removed from user successfully' });
        } catch (error) {
            res.status(500).json(error);
        }
    },

    getUserRoleById: async (req,res) => {
        const userId = req.params.id
        try {
            // Lấy các vai trò từ bảng UserRole dựa vào userId
            const userRoles = await UserRole.find({ userId: userId });
    
            // Lấy tên các vai trò từ bảng Role dựa vào roleId
            const roles = await Promise.all(userRoles.map(async (userRole) => {
                const role = await Role.findById(userRole.roleId);
                return role ? role.name : null; // Trả về tên của vai trò
            }));
    
            // Lọc các vai trò hợp lệ (loại bỏ các giá trị null)
            return roles.filter(role => role !== null);
        } catch (error) {
            console.error('Error fetching user roles:', error);
            throw new Error('Could not fetch user roles');
        }
    }
    
    
}

module.exports = userController;