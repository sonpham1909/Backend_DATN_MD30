const mongoose = require('mongoose');

const ResponseReviewSchema = new mongoose.Schema({
    review_id: { 
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến ObjectId của review
        ref: 'Review', // Tên collection mà bạn muốn tham chiếu
        required: true 
    },
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến ObjectId của user
        ref: 'User', // Tên collection mà bạn muốn tham chiếu
        required: true 
    },
    comment: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('ResponseReview', ResponseReviewSchema);
