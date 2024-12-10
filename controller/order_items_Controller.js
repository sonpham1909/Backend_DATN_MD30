const Order_items = require("../models/Order_items")



const order_items_controller = {
    //get all orderItems
    getAllOrderItems: async (req, res) => {
        try {
            const orderItems = await Order_items.find();
            res.status(200).json(orderItems);
        } catch (error) {
            console.error('Error while fetching order items', error);
            res.status(500).json({ message: 'Error while fetching order items', error });


        }
    },


    getOrderItemsByOrderId: async (req, res) => {
        const { orderId } = req.params;
        try {
            const orderItems = await Order_items.find({ order_id: orderId })
                .populate('product_id', 'name') // Populate để lấy name và price từ product_id
                .exec();

            if (!orderItems) {
                return res.status(404).json({ message: 'Order items not found!' });
            }

            // Kiểm tra kết quả sau khi populate
           
            const orderItemsWithProduct = orderItems.map(orderItem => ({
                ...orderItem._doc, // Lấy tất cả thông tin của order item
                name: orderItem.product_id ? orderItem.product_id.name : null,

            }));

            res.status(200).json(orderItemsWithProduct);

        } catch (error) {
            console.error('Error getting order items:', error);
            res.status(500).json({ message: 'Error getting order items', error: error.message });
        }
    },


    create_order_item: async (req, res) => {
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
        try {
            const { startDate, endDate } = req.query;
    
            // Chuyển đổi ngày từ chuỗi sang định dạng Date
            const start = new Date(startDate);
            const end = new Date(endDate);
    
         
            start.setDate(start.getDate() );
    
            // Kiểm tra tính hợp lệ của ngày
            if (end < start) {
                return res.status(200).json([]);
            }
    
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
                {
                    $match: {
                        "order_info.status": "delivered",
                        "order_info.updatedAt": { 
                            $gte: start, 
                            $lt: new Date(end.getTime() + 24 * 60 * 60 * 1000) 
                        }
                    }
                },
                {
                    $group: {
                        _id: "$product_id",
                        totalQuantity: { $sum: "$quantity" },
                        totalAmount: { $sum: "$total_amount" }
                    }
                },
                { $sort: { totalQuantity: -1 } }
            ]);
    
            res.status(200).json(topSellingProducts);
        } catch (error) {
            console.error("Error fetching top selling products:", error);
            res.status(500).json({ message: "Error fetching top selling products", error: error.message });
        }
    },
    
}
module.exports = order_items_controller;