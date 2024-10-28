const mongoose = require('mongoose');

const orderItemsSchemma = mongoose.Schema({
    order_id:{
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    product_id:{
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    size:{
        type: String,
        required: true
    },
    color:{
        type: String,
        required: true
    },
    quantity:{
        type:Number,
        required: true
    },
    price:{
        type:Number,
        required: true
    },
    total_amount:{
        type: Number,
        required: true
    }
},{timesamps: true});

module.exports = mongoose.model('OrderItem', orderItemsSchemma);