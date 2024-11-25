// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // Tham chiếu đến User
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    img: {
      type: String, // URL ảnh
      required: false,
    },
    status: {
      type: Boolean, // Trạng thái đã xem
      default: false,
    },
  },
  { timestamps: true } // Thêm thời gian tạo và cập nhật
);

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
