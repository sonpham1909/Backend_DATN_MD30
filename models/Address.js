const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    recipientName: { 
        type: String,
        required: true,
    },
    recipientPhone: { 
        type: String,
        required: true,
    },
    addressDetail: {
        street: { 
            type: String,
            required: true,
        },
        ward: { 
            type: String,
            required: true,
        },
        district: { 
            type: String,
            required: true,
        },
        city: { 
            type: String,
            required: true,
        },
    },
    notes: { 
        type: String,
        default: '',
    },
    isDefault: { 
        type: Boolean,
        default: false,
    },
    id_user: { // Thêm thuộc tính id_user
        type: mongoose.Schema.Types.ObjectId, // Kiểu ObjectId để tham chiếu đến User
        required: true,
        ref: 'User' // Tham chiếu đến model User
    },
}, { timestamps: true });

module.exports = mongoose.model('Address', AddressSchema);
