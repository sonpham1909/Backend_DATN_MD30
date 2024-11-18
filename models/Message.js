const mongoose = require('mongoose');

// Schema cho tin nhắn
const MessageSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // Liên kết với User
        required: true 
    },
    content: { 
        type: String, 
       
    },
    attachments: [{
        type: String, // Đường dẫn URL tới file đính kèm (ảnh, video, v.v.)
    }],
}, { timestamps: true }); // Tự động thêm createdAt và updatedAt

// Schema cho phản hồi
const ReplySchema = new mongoose.Schema({
    message_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Message', // Liên kết với Message
        required: true 
    },
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // Liên kết với User
        required: true 
    },
    content: { 
        type: String, 
        
    },
    attachments: [{
        type: String, // Đường dẫn URL tới file đính kèm
    }],
}, { timestamps: true }); // Tự động thêm createdAt và updatedAt

// Tạo model từ schema
const Message = mongoose.model('Message', MessageSchema);
const Reply = mongoose.model('Reply', ReplySchema);

module.exports = { Message, Reply };
