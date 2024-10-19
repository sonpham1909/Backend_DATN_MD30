
const Address = require('../models/Address');
const Order = require('../models/order');
const Order_items = require('../models/Order_items');
const Product = require('../models/Product');
const User = require('../models/User');

const ordersController = {
    getAllOrders: async (req, res) => {
        try {
            const orders = await Order.find()
            .populate('user_id', 'full_name email') // Lấy first_name và last_name từ User
            .populate('address_id', 'recipientPhone')
            .exec();

        // Thêm full_name vào từng đơn hàng
        const ordersWithFullName = orders.map(order => ({
            ...order._doc, // Lấy tất cả thông tin của order
            full_name: order.user_id?.full_name, // Kiểm tra user_id tồn tại
            email: order.user_id?.email, // Kiểm tra email tồn tại
            recipientPhone: order.address_id?.recipientPhone // Kiểm tra address_id và recipientPhone
        }));

        res.status(200).json(ordersWithFullName);
        } catch (error) {
            console.error('Error while fetching orders:', error);
            res.status(500).json({ message: 'Error while fetching orders', error: error.message });
        }

    },


    createOrder : async (req, res) => {
        try {
            const { user_id, shipping_method_id,payment_method_id,address_id, items } = req.body;

            // Tính tổng số tiền
            let totalAmount = 0;
            let total_Products = 0;

            // Tạo đơn hàng trước để lấy orderId
            const order = new Order({
                user_id,
                address_id,
                total_products: total_Products,
                shipping_method_id,
                payment_method_id,
                total_amount: totalAmount // Tạm thời thiết lập tổng số tiền là 0
            });

            // Lưu đơn hàng vào DB
            await order.save();

            // Tạo các mục đơn hàng và cập nhật order_id
            await Promise.all(items.map(async item => {
                const orderItem = new Order_items({
                    order_id: order._id, // Thiết lập order_id cho mỗi mục đơn hàng
                    product_id: item.product_id,
                    size: item.size,
                    color: item.color,
                    quantity: item.quantity,
                    price: item.price,
                    total_amount: item.quantity * item.price // Tính total_amount
                });

                totalAmount += orderItem.total_amount; // Cộng dồn vào tổng số tiền
                total_Products += item.quantity; 

                  // Cập nhật số lượng sản phẩm theo biến thể
                  
                await orderItem.save(); // Lưu vào DB

                await Product.findOneAndUpdate(
                    { _id: item.product_id, 'variants.size': item.size, 'variants.color': item.color },
                    { $inc: { 'variants.$.quantity': -item.quantity } } // Giảm số lượng biến thể
                );
            }));

            // Cập nhật tổng số tiền cho đơn hàng
            order.total_amount = totalAmount;
            order.total_products = total_Products;
            await order.save();

            res.status(201).json({ message: 'Order created successfully!', order });
        } catch (error) {
            res.status(500).json({ message: 'Error creating order', error: error.message });
        }
    },

    //Cancel order 

    cancelOrder: async (req, res) => {
        const { orderId, reason } = req.body; // Lấy thông tin orderId và lý do từ request

        try {
            const order = await Order.findById(orderId);

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            if(order.status === 'canceled'){
                return res.status(400).json({ message: 'Order is already with status "canceled"' });
            }
            const orderItems = await Order_items.find({ order_id: orderId });
            if(!orderItems){
                return res.status(404).json({ message: 'Order items not found' });
            }

            order.status = 'canceled'; // Cập nhật trạng thái đơn hàng
            order.cancelReason = reason || ''; // Lưu lý do hủy nếu có
            await order.save();

            await Promise.all(orderItems.map(async item => {
                await Product.findOneAndUpdate(
                    { _id: item.product_id, 'variants.size': item.size, 'variants.color': item.color },
                    { $inc: { 'variants.$.quantity': item.quantity } } // Tăng số lượng biến thể
                );
            }));

            res.status(200).json({ message: 'Order canceled successfully', order });
        } catch (error) {
            res.status(500).json({ message: 'Error canceling order', error: error.message });
        }
    },


}

module.exports = ordersController;