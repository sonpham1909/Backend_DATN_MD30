// models/Reply.js
const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    message_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message', // Tham chiếu đến Message
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // Tham chiếu đến User
      required: true,
    },
    content: {
      type: String,
    },
    img: {
      type: [String], // Đảm bảo img là mảng các chuỗi
    default: [],   
    },
    status: {
      type: Boolean, // Trạng thái đã xem
      default: false,
    },
  },
  { timestamps: true } // Thêm thời gian tạo và cập nhật
);

const Reply = mongoose.model('Reply', replySchema);

module.exports = Reply;
