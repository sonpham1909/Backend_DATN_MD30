const PaymentMethod = require("../models/Payment_method");

const PaymentMethodController = {
    // Thêm phương thức thanh toán
    createPaymentMethod: async (req, res) => {
        try {
            const newPaymentMethod = new PaymentMethod({
                name: req.body.name,
                description: req.body.description,
                image: req.body.image || '', // Thêm trường ảnh vào
            });
            const savedPaymentMethod = await newPaymentMethod.save();
            res.status(201).json(savedPaymentMethod);
        } catch (error) {
            console.error('Error while adding payment method:', error);
            res.status(500).json({ message: 'Error while adding payment method', error: error.message });
        }
    },

    // Lấy tất cả phương thức thanh toán
    getAllPaymentMethods: async (req, res) => {
        try {
            const paymentMethods = await PaymentMethod.find();
            res.status(200).json(paymentMethods);
        } catch (error) {
            console.error("Error fetching payment methods:", error);
            res.status(500).json({ message: 'Error fetching payment methods', error: error.message });
        }
    },

    // Cập nhật phương thức thanh toán
    updatePaymentMethod: async (req, res) => {
        const paymentMethodId = req.params.id;
        const updatedData = {};

        try {
            const paymentMethod = await PaymentMethod.findById(paymentMethodId);
            if (!paymentMethod) {
                return res.status(404).json({ message: 'Payment method not found' });
            }

            // Cập nhật các trường
            updatedData.name = req.body.name || paymentMethod.name;
            updatedData.description = req.body.description || paymentMethod.description;
            updatedData.is_active = req.body.is_active !== undefined ? req.body.is_active : paymentMethod.is_active;
            updatedData.image = req.body.image || paymentMethod.image; // Cập nhật trường ảnh nếu có

            // Cập nhật phương thức thanh toán
            Object.assign(paymentMethod, updatedData);
            const updatedPaymentMethod = await paymentMethod.save();
            res.status(200).json({ message: 'Payment method updated successfully', paymentMethod: updatedPaymentMethod });
        } catch (error) {
            console.error("Error updating payment method:", error);
            res.status(500).json({ message: 'Error updating payment method', error: error.message });
        }
    },

    // Xóa phương thức thanh toán
    deletePaymentMethod: async (req, res) => {
        const paymentMethodId = req.params.id;

        try {
            const deletedPaymentMethod = await PaymentMethod.findByIdAndDelete(paymentMethodId);
            if (!deletedPaymentMethod) {
                return res.status(404).json({ message: 'Payment method not found' });
            }

            res.status(200).json({ message: 'Payment method deleted successfully', paymentMethodId: deletedPaymentMethod._id });
        } catch (error) {
            console.error("Error deleting payment method:", error);
            res.status(500).json({ message: 'Error deleting payment method', error: error.message });
        }
    },

    // Tìm kiếm phương thức thanh toán
    searchPaymentMethod: async (req, res) => {
        try {
            const { keyword } = req.query;
            const regex = new RegExp(keyword, 'i');
            const paymentMethods = await PaymentMethod.find({ $or: [{ name: regex }, { description: regex }] });
            res.status(200).json(paymentMethods);
        } catch (error) {
            console.error("Error searching payment methods:", error);
            res.status(500).json({ message: 'Error searching payment methods', error: error.message });
        }
    }
}

module.exports = PaymentMethodController;
