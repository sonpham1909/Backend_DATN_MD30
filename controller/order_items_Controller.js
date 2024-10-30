const Order_items = require("../models/Order_items")



const order_items_controller = {
    //get all orderItems
    getAllOrderItems: async(req, res) => {
        try {
            const orderItems = await Order_items.find();
            res.status(200).json(orderItems);
        } catch (error) {
            console.error('Error while fetching order items',error);
            res.status(500).json({message:'Error while fetching order items', error });

            
        }
    },

    getOrderItemsByOrderId: async(req, res) => {

        const { orderId } = req.params;
        try {

            const orderItems = await Order_items.findById(orderId);
            if(!orderItems){
                res.status(404).json({message:'Order items not found!'});
            }

            res.status(200).json(orderItems);
            
        } catch (error) {
            console.error('Error getting order item:', error);
            res.status(500).json({ message: 'Error getting order item', error: error.message });
        }
    },

    create_order_item : async(req, res) => {
        const { order_id, product_id, size, color, quantity, price, total_amount } = req.body;

        try {
            const newOrderItems = new Order_items({
                order_id,
                product_id,
                size,
                color,
                quantity,
                price,
                total_amount

            });

            const savedOrderItem = await newOrderItems.save();
            res.status(201).json(savedOrderItem);
        } catch (error) {
            console.error('Error creating order item:', error);
            res.status(500).json({ message: 'Error creating order item', error: error.message });
            
        }
    },
    getTopSellingProducts: async (req, res) => {
        const { limit = 5 } = req.query; // Số lượng sản phẩm cần lấy, mặc định là 5
        try {
            const topSellingProducts = await Order_items.aggregate([
                {
                    $lookup: {
                        from: "orders",
                        localField: "order_id",
                        foreignField: "_id",
                        as: "order_info"
                    }
                },
                { $unwind: "$order_info" },
                { $match: { "order_info.status": "delivered" } }, // Lọc chỉ các đơn hàng đã giao
                { 
                    $group: { 
                        _id: "$product_id", 
                        totalQuantity: { $sum: "$quantity" },
                        totalAmount: {$sum: '$total_amount'}
                    } 
                },
                { $sort: { totalQuantity: -1 } }, // Sắp xếp theo số lượng giảm dần
                { $limit: parseInt(limit, 10) },
            ]);
    
            res.status(200).json(topSellingProducts);
        } catch (error) {
            console.error("Error fetching top selling products:", error);
            res.status(500).json({ message: "Error fetching top selling products", error: error.message });
        }
    },
}
module.exports = order_items_controller;