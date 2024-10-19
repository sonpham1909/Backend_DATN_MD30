const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    product_id: { 
        type: String, 
        required: true 
    },
    user_id: { 
        type: String, 
        required: true 
    },
    rating: { 
        type: String, 
        required: true 
    },
    comment: { 
        type: String, 
        required: true 
    },
    color: { 
        type: String 
    },
    size: { 
        type: String 
    },
    img: {
        type: String 
    },
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
