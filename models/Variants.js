const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    color_code:{
        type:String,
        require:true

    },
    image: {
        type: String,
        required: true,
    },
    sizes: [
        {
            size: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
        },
    ],
}, { timestamps: true });

// Tạo ràng buộc duy nhất trên product_id, size, và color


const Variant = mongoose.model('Variant', variantSchema);

module.exports = Variant;
