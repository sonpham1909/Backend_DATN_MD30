const mongoose = require('mongoose');


const orderSchemma = mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            require: true
        },
        adress_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Address',
            require:true
        },
        total_products:{
            type: Number,
        
        },
        status:{
            type: String,
            default:'pending'
        },
        shipping_method_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'ShippingMethod',
            require:true

        },
        payment_method_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'PaymentMethod',
            require:true

        },
        total_amount:{
            type: Number,
            require: true

        },
        cancelReason: {
            type: String,
            default: '' // Trường lý do hủy
        },





    },{timestamps: true}
);


module.exports = mongoose.model('Orders',orderSchemma);