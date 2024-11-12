const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    cart_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
        required: true,
    },
    size: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        default: 1,
    },
    price: {
        type: Number,
        required: true,
    },
    image_variant:{
        type:String,
    
    }
}, { timestamps: true });

module.exports = mongoose.model('CartItem', CartItemSchema);
