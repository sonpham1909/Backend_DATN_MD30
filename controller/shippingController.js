// controllers/shippingMethodController.js

const ShippingMethod = require('../models/shipping_method');

const shippingMethodController = {
    // Lấy tất cả các phương thức giao hàng
    getAllShippingMethods: async (req, res) => {
        try {
            const shippingMethods = await ShippingMethod.find();
            res.status(200).json(shippingMethods);
        } catch (error) {
            console.error('Error while fetching shipping methods:', error);
            res.status(500).json({ message: 'Error while fetching shipping methods', error: error.message });
        }
    },
    // Lấy giá phương thức giao hàng theo ID
    getShippingCostById: async (req, res) => {
        const { id } = req.params;

        try {
            const shippingMethod = await ShippingMethod.findById(id);
            if (!shippingMethod) {
                return res.status(404).json({ message: 'Shipping method not found' });
            }
            res.status(200).json({ cost: shippingMethod.cost });
        } catch (error) {
            console.error('Error while fetching shipping cost by ID:', error);
            res.status(500).json({ message: 'Error while fetching shipping cost by ID', error: error.message });
        }
    },
    // Tạo phương thức giao hàng mới
    createShippingMethod: async (req, res) => {
        const { name, cost, estimatedDeliveryTime, description } = req.body;

        try {
            const newShippingMethod = new ShippingMethod({
                name,
                cost,
                estimatedDeliveryTime,
                description
            });

            const savedShippingMethod = await newShippingMethod.save();
            res.status(201).json(savedShippingMethod);
        } catch (error) {
            console.error('Error while creating shipping method:', error);
            res.status(500).json({ message: 'Error while creating shipping method', error: error.message });
        }
    },

    // Lấy thông tin một phương thức giao hàng theo ID
    getShippingMethodById: async (req, res) => {
        const { id } = req.params;

        try {
            const shippingMethod = await ShippingMethod.findById(id);
            if (!shippingMethod) {
                return res.status(404).json({ message: 'Shipping method not found' });
            }
            res.status(200).json(shippingMethod);
        } catch (error) {
            console.error('Error while fetching shipping method by ID:', error);
            res.status(500).json({ message: 'Error while fetching shipping method by ID', error: error.message });
        }
    },

    // Cập nhật thông tin phương thức giao hàng
    updateShippingMethod: async (req, res) => {
        const { id } = req.params;
        const updatedData = req.body;

        try {
            const shippingMethod = await ShippingMethod.findByIdAndUpdate(id, updatedData, { new: true });
            if (!shippingMethod) {
                return res.status(404).json({ message: 'Shipping method not found' });
            }
            res.status(200).json(shippingMethod);
        } catch (error) {
            console.error('Error while updating shipping method:', error);
            res.status(500).json({ message: 'Error while updating shipping method', error: error.message });
        }
    },

    // Xóa phương thức giao hàng
    deleteShippingMethod: async (req, res) => {
        const { id } = req.params;

        try {
            const deletedShippingMethod = await ShippingMethod.findByIdAndDelete(id);
            if (!deletedShippingMethod) {
                return res.status(404).json({ message: 'Shipping method not found' });
            }
            res.status(200).json({ message: 'Shipping method deleted successfully' });
        } catch (error) {
            console.error('Error while deleting shipping method:', error);
            res.status(500).json({ message: 'Error while deleting shipping method', error: error.message });
        }
    },
};

module.exports = shippingMethodController;
