const mongoose = require('mongoose');

const ResponseReviewSchema = new mongoose.Schema({
    review_id: { 
        type: String, 
        required: true 
    },
    user_id: { 
        type: String, 
        required: true 
    },
    comment: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('ResponseReview', ResponseReviewSchema);
