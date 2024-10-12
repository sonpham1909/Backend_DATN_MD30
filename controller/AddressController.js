const Address = require("../models/Address"); // Import mô hình địa chỉ

const AddressController = {
    // Thêm địa chỉ giao hàng
    createAddress: async (req, res) => {
        try {
            const newAddress = new Address(req.body);
            const savedAddress = await newAddress.save();
            res.status(201).json(savedAddress);
        } catch (error) {
            console.error('Error while adding address:', error);
            res.status(500).json({ message: 'Error while adding address', error: error.message });
        }
    },

    // Lấy tất cả địa chỉ
    getAllAddresses: async (req, res) => {
        try {
            const addresses = await Address.find();
            res.status(200).json(addresses);
        } catch (error) {
            console.error("Error fetching addresses:", error);
            res.status(500).json({ message: 'Error fetching addresses', error: error.message });
        }
    },

    // Cập nhật địa chỉ
    updateAddress: async (req, res) => {
        const addressId = req.params.id; 

        try {
            const address = await Address.findById(addressId);
            if (!address) {
                return res.status(404).json({ message: 'Address not found' });
            }

            Object.assign(address, req.body);
            const updatedAddress = await address.save();
            res.status(200).json({ message: 'Address updated successfully', address: updatedAddress });
        } catch (error) {
            console.error("Error updating address:", error);
            res.status(500).json({ message: 'Error updating address', error: error.message });
        }
    },

    // Xóa địa chỉ
    deleteAddress: async (req, res) => {
        const addressId = req.params.id;

        try {
            const deletedAddress = await Address.findByIdAndDelete(addressId);
            if (!deletedAddress) {
                return res.status(404).json({ message: 'Address not found' });
            }

            res.status(200).json({ message: 'Address deleted successfully', addressId: deletedAddress._id });
        } catch (error) {
            console.error("Error deleting address:", error);
            res.status(500).json({ message: 'Error deleting address', error: error.message });
        }
    }
}

module.exports = AddressController;
