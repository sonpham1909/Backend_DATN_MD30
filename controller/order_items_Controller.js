const Order_items = require("../models/Order_items")



const order_items_controller = {
    //get all orderItems
    getAllOrderItems: async(res, req) => {
        try {
            const orderItems = await Order_items.find();
            res.status(200).json(orderItems);
        } catch (error) {
            console.error('Error while fetching order items',error);
            res.status(500).json({message:'Error while fetching order items', error: error.message });

            
        }
    },

    getOrderItemsByOrderId: async(res, req) => {

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

    create_order_item : async(res, req) => {
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
    }
}