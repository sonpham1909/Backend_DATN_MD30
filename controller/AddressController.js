const Address = require("../models/Address"); // Import mô hình địa chỉ
const User = require("../models/User");

const AddressController = {
  // Thêm địa chỉ giao hàng
  createAddress: async (req, res) => {
    try {
      const newAddress = new Address(req.body);
      const savedAddress = await newAddress.save();
      res.status(201).json(savedAddress);
    } catch (error) {
      console.error("Error while adding address:", error);
      res
        .status(500)
        .json({ message: "Error while adding address", error: error.message });
    }
  },

  // Lấy tất cả địa chỉ
  getAllAddresses: async (req, res) => {
    try {
      const addresses = await Address.find();
      res.status(200).json(addresses);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      res
        .status(500)
        .json({ message: "Error fetching addresses", error: error.message });
    }
  },
  //lất địa chỉ qua id user

  getAllAddressesByUserId: async (req, res) => {
    const { userId } = req.body; // Lấy userId từ body của yêu cầu
    try {
      const user = await User.findById(userId);
      if (!user) {
        console.log("Không tìm thấy người dùng này");
        return res
          .status(404)
          .json({ message: "Không tìm thấy người dùng này" });
      }

      // Tìm tất cả địa chỉ của người dùng
      const addresses = await Address.find({ id_user: userId }); // Sử dụng cú pháp đúng để tìm kiếm

      // Kiểm tra xem có địa chỉ nào không
      if (addresses.length === 0) {
        console.log("Người dùng chưa nhập địa chỉ nào");

        return res
          .status(404)
          .json({ message: "Người dùng chưa nhập địa chỉ nào" });
      }

      res.status(200).json(addresses); // Trả về danh sách địa chỉ
    } catch (error) {
      console.error("Error fetching addresses:", error);
      res
        .status(500)
        .json({ message: "Error fetching addresses", error: error.message }); // Trả về thông báo lỗi nếu có
    }
  },

  // Cập nhật địa chỉ
  updateAddress: async (req, res) => {
    const addressId = req.params.id;

    try {
      const address = await Address.findById(addressId);
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }

      Object.assign(address, req.body);
      const updatedAddress = await address.save();
      res.status(200).json({
        message: "Address updated successfully",
        address: updatedAddress,
      });
    } catch (error) {
      console.error("Error updating address:", error);
      res
        .status(500)
        .json({ message: "Error updating address", error: error.message });
    }
  },

  // Xóa địa chỉ
  deleteAddress: async (req, res) => {
    const addressId = req.params.id;

    try {
      const deletedAddress = await Address.findByIdAndDelete(addressId);
      if (!deletedAddress) {
        return res.status(404).json({ message: "Address not found" });
      }

      res.status(200).json({
        message: "Address deleted successfully",
        addressId: deletedAddress._id,
      });
    } catch (error) {
      console.error("Error deleting address:", error);
      res
        .status(500)
        .json({ message: "Error deleting address", error: error.message });
    }
  },
  getDefaultAddress: async (req, res) => {
    const userId = req.user.id; // Lấy user ID từ thông tin xác thực

    try {
        const address = await Address.findOne({ id_user: userId, isDefault: true });
        if (!address) {
            return res.status(404).json({ message: 'Không tìm thấy địa chỉ mặc định' });
        }
        res.status(200).json(address);
    } catch (error) {
        console.error('Error fetching default address:', error);
        res.status(500).json({ message: 'Error fetching default address', error: error.message });
    }
},



  // Hàm lấy địa chỉ của người dùng app
  getAllAddressesByUserApp: async (req, res) => {
    const userId = req.user.id; // Lấy userId từ req.user đã được xác thực từ middleware

    try {
      const userData = await User.findById(userId);
      if (!userData) {
        return res.status(404).json({ message: "User not found" });
      }

      // Lấy tất cả địa chỉ của người dùng
      const addresses = await Address.find({ id_user: userId });

      // Kiểm tra nếu không có địa chỉ nào
      if (addresses.length === 0) {
        return res
          .status(200)
          .json({ message: "User has no addresses", addresses: [] });
      }

      res.status(200).json(addresses); // Trả về danh sách địa chỉ
    } catch (error) {
      console.error("Error fetching addresses:", error.message);
      res
        .status(500)
        .json({ message: "Error fetching addresses", error: error.message });
    }
  },

  updateDefaultAddressByApp: async (req, res) => {
    const userId = req.user.id; // Lấy ID người dùng từ token (được thêm từ middleware xác thực)
    const { addressId } = req.params;

    try {
      // Kiểm tra xem địa chỉ có tồn tại và thuộc về người dùng hay không
      const address = await Address.findOne({
        _id: addressId,
        id_user: userId,
      });
      if (!address) {
        return res
          .status(404)
          .json({ message: "Address not found or does not belong to user" });
      }

      // Đặt tất cả địa chỉ của người dùng thành không mặc định
      await Address.updateMany(
        { id_user: userId, isDefault: true },
        { $set: { isDefault: false } }
      );

      // Đặt địa chỉ hiện tại thành mặc định
      address.isDefault = true;
      await address.save();

      res.status(200).json(address);
    } catch (error) {
      console.error("Error updating default address:", error);
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  },
  deleteAddressByApp: async (req, res) => {
    const userId = req.user.id; // Lấy ID người dùng từ token đã xác thực
    const { addressId } = req.params;

    try {
      // Kiểm tra xem địa chỉ có tồn tại và thuộc về người dùng hay không
      const address = await Address.findOne({
        _id: addressId,
        id_user: userId,
      });
      if (!address) {
        return res
          .status(404)
          .json({ message: "Address not found or does not belong to user" });
      }

      // Không cho phép xóa địa chỉ mặc định
      if (address.isDefault) {
        return res
          .status(400)
          .json({ message: "Cannot delete default address" });
      }

      // Thực hiện xóa địa chỉ
      await Address.findByIdAndDelete(addressId);

      res
        .status(200)
        .json({ message: "Address deleted successfully", addressId });
    } catch (error) {
      console.error("Error deleting address:", error);
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  },
  // Hàm controller để thêm địa chỉ

  addAddressByApp: async (req, res) => {
    const userId = req.user.id; // Giả sử userId được lấy từ JWT token đã được xác thực thông qua middleware

    const {
      recipientName,
      recipientPhone,
      street,
      ward,
      district,
      city,
      notes,
    } = req.body;

    // Kiểm tra xem tất cả các trường bắt buộc đã được cung cấp hay chưa
    if (!recipientName || !recipientPhone || !street || !ward || !district || !city) {
      return res.status(400).json({ message: "Tất cả các trường đều là bắt buộc" });
    }

    try {
      // Tạo đối tượng addressDetail chứa các thông tin chi tiết của địa chỉ
      const addressDetail = {
        street,
        ward,
        district,
        city,
      };

      // Tạo mới địa chỉ
      const newAddress = new Address({
        recipientName,
        recipientPhone,
        addressDetail,
        notes,
        id_user: userId,
        isDefault: false, // Mặc định địa chỉ mới không phải là địa chỉ mặc định
      });

      // Kiểm tra nếu đây là địa chỉ đầu tiên của người dùng, thì đặt là mặc định
      const userAddresses = await Address.find({ id_user: userId });
      if (userAddresses.length === 0) {
        newAddress.isDefault = true;
      }

      // Lưu địa chỉ mới vào cơ sở dữ liệu
      await newAddress.save();

      // Gửi phản hồi với địa chỉ vừa được tạo
      return res.status(201).json({ message: "Địa chỉ đã được thêm thành công", address: newAddress });
    } catch (error) {
      console.error("Lỗi khi thêm địa chỉ:", error.message);
      res
        .status(500)
        .json({ message: "Lỗi khi thêm địa chỉ", error: error.message });
    }
  }

};

module.exports = AddressController;
