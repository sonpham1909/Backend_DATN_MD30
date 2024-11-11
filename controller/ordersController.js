
const Address = require('../models/Address');
const Order = require('../models/order');
const Order_items = require('../models/Order_items');
const Product = require('../models/Product');
const shipping_method = require('../models/shipping_method');
const User = require('../models/User');
const Variant = require('../models/Variants');

const ordersController = {
    getAllOrders: async (req, res) => {
        try {
            const orders = await Order.find()
                .populate('user_id', 'full_name email') // Lấy first_name và last_name từ User
                .populate('address_id', 'recipientPhone recipientName addressDetail')
                .populate('payment_method_id', 'name')
                .populate('shipping_method_id','name')
                .exec();

            // Thêm full_name vào từng đơn hàng
            const ordersWithFullName = orders.map(order => ({
                ...order._doc, // Lấy tất cả thông tin của order
                full_name: order.user_id?.full_name, // Kiểm tra user_id tồn tại
                email: order.user_id?.email, // Kiểm tra email tồn tại
                recipientPhone: order.address_id?.recipientPhone,
                recipientName: order.address_id?.recipientName,
                addressDetail: order.address_id?.addressDetail,
                payment_method: order.payment_method_id?.name,
                shipping_method:order.shipping_method_id?.name

            }));

            res.status(200).json(ordersWithFullName);
        } catch (error) {
            console.error('Error while fetching orders:', error);
            res.status(500).json({ message: 'Error while fetching orders', error: error.message });
        }

    },


    createOrder: async (req, res) => {
        try {
            const { user_id, shipping_method_id, payment_method_id, address_id, items } = req.body;
    
            // Khởi tạo giá trị tổng tiền và tổng số lượng
            let totalAmount = 0;
            let total_Products = 0;
    
            // Tạo đơn hàng trước để lấy orderId
            const order = new Order({
                user_id,
                address_id,
                total_products: total_Products,
                shipping_method_id:shipping_method_id,
                payment_method_id:payment_method_id,
                total_amount: totalAmount // Tạm thời thiết lập tổng số tiền là 0
            });
    
            // Lưu đơn hàng vào DB để lấy orderId
            await order.save();
    
            // Tạo các mục đơn hàng và cập nhật số lượng sản phẩm
            await Promise.all(items.map(async (item) => {
                const variant = await Variant.findOne(
                    { product_id: item.product_id, color: item.color, 'sizes.size': item.size }
                );
    
                if (!variant) {
                    throw new Error(`Variant not found for product ${item.product_id}`);
                }
    
                const product = await Product.findById(item.product_id);
                if (!product) {
                    throw new Error(`Product not found for ID ${item.product_id}`);
                }
    
                // Kiểm tra số lượng tồn kho
                const availableQuantity = variant.sizes.find(size => size.size === item.size).quantity;
                if (item.quantity > availableQuantity) {
                    throw new Error(`Insufficient stock for product ${item.product_id} in size ${item.size}`);
                }
    
                const orderItem = new Order_items({
                    order_id: order._id,
                    product_id: item.product_id,
                    image_variant: variant.image || product.imageUrls[0],
                    size: item.size,
                    color: item.color,
                    quantity: item.quantity,
                    price: item.price,
                    total_amount: item.quantity * item.price
                });
    
                totalAmount += orderItem.total_amount; // Cộng dồn tổng số tiền
                total_Products += item.quantity; // Cộng dồn số lượng sản phẩm
    
                // Lưu mục đơn hàng vào CSDL
                await orderItem.save();
    
                // Cập nhật số lượng tồn kho của biến thể
                await Variant.findOneAndUpdate(
                    { product_id: item.product_id, color: item.color, 'sizes.size': item.size },
                    { $inc: { 'sizes.$.quantity': -item.quantity } }
                );
            }));
    
            // Cập nhật tổng số tiền và tổng sản phẩm vào đơn hàng
            order.total_amount = totalAmount;
            order.total_products = total_Products;
            await order.save();
    
            res.status(201).json({ message: 'Order created successfully!', order });
        } catch (error) {
            console.error('Error creating order:', error);
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

            if (order.status === 'canceled') {
                return res.status(400).json({ message: 'Order is already with status "canceled"' });
            }
            const orderItems = await Order_items.find({ order_id: orderId });
            if (!orderItems) {
                return res.status(404).json({ message: 'Order items not found' });
            }

            order.status = 'canceled'; // Cập nhật trạng thái đơn hàng
            order.cancelReason = reason || ''; // Lưu lý do hủy nếu có
            await order.save();

            await Promise.all(orderItems.map(async item => {
                await Variant.findOneAndUpdate(
                    { product_id: item.product_id, color: item.color, 'sizes.size': item.size },
                    { $inc: { 'sizes.$.quantity': item.quantity } } // Giảm số lượng biến thể
                );
            }));

            res.status(200).json({ message: 'Order canceled successfully', order });
        } catch (error) {
            res.status(500).json({ message: 'Error canceling order', error: error.message });
        }
    },
    changeStatusOrder: async (req, res) => {
        const orderId = req.params.orderId;
        const { status } = req.body; // 'shipping', 'delivered', 'cancelled'
      
        try {
          // Tìm kiếm đơn hàng
          const order = await Order.findById(orderId);
      
          if (!order) {
            return res.status(404).json({ message: 'Order not found' });
          }
      
          // Kiểm tra xem trạng thái hiện tại đã trùng với trạng thái mới chưa
          if (order.status === status) {
            return res.status(400).json({ message: `Order is already with status ${status}` });
          }
      
          // Cập nhật trạng thái đơn hàng
          order.status = status;
      
          // Lưu thay đổi vào cơ sở dữ liệu
          await order.save();
      
          console.log(`Order status changed to ${status}`); // Log để kiểm tra
          res.status(200).json({ message: 'Order changed status successfully', order });
      
        } catch (error) {
          console.error("Error updating order status:", error);
          res.status(500).json({ error: 'Không thể cập nhật trạng thái đơn hàng' });
        }
      }
      


}

module.exports = ordersController;