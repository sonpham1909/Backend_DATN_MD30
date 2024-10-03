const User = require('../models/User');
const bcrypt = require('bcrypt')

const userController = {
    //getAlluser
    getAllUser: async (req, res) =>{
        try {
            const users = await User.find();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json(error);
            
        }
    },
     AddUser: async (req, res) =>{
        try {

            const salt = await bcrypt.genSalt(10);
            const hashed =  await bcrypt.hash(req.body.password, salt);
         

            //create new user
            const newUser = await new User({
                username: req.body.username,
                password: hashed,
                email: req.body.email,
                
                
                phone_number: req.body.phone_number,
                full_name: req.body.full_name,
                admin:req.body.admin
            });

            const user = await newUser.save();
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

        try {

            if (updatedData.password) {
                const salt = await bcrypt.genSalt(10); // Tạo salt
                updatedData.password = await bcrypt.hash(updatedData.password, salt); // Hash mật khẩu
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
    deleteUser: async (req, res) => {
        const userId = req.params.id;

        try {
            // Tìm và xóa người dùng theo ID
            const deletedUser = await User.findByIdAndDelete(userId);

            if (!deletedUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting user', error: error.message });
        }
    },

    searchUser: async(req,res)=>{
        try {
            const { keyword } = req.query;
            const regex = new RegExp(keyword, 'i'); // Tìm kiếm không phân biệt hoa thường
            const users = await User.find({ $or: [{ username: regex }, { email: regex }] });
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi tìm kiếm người dùng' });
        }
        //Check search
    }
}

module.exports = userController;