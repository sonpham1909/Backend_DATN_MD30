
const Message = require('../models/Message');
const User = require('../models/User');
const Reply = require('../models/Reply'); // Nhập mô hình Reply


// Tạo tin nhắn mới
const createMessage = async (req, res) => {
  try {
    const { content, status } = req.body;

    // Kiểm tra xem req.user có tồn tại không
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    const userId = req.user._id;

    // Kiểm tra xem đây có phải là tin nhắn đầu tiên của người dùng không
    const firstMessageCheck = await Message.findOne({ user_id: userId });

    const newMessage = new Message({
      user_id: userId,
      content,
      img: req.imageUrls || [], // Đảm bảo img là mảng
      status,
    });

    const savedMessage = await newMessage.save();
    const io = req.app.locals.io;

    // Nếu đây là tin nhắn đầu tiên, gửi phản hồi tự động
    if (!firstMessageCheck) {
      const autoReply = new Reply({
        message_id: savedMessage._id, // Liên kết phản hồi với tin nhắn vừa gửi
        user_id: userId, // Sử dụng ID của người dùng đang đăng nhập
        content: 'Xin chào! Chúng tôi rất vui khi nhận được tin nhắn của bạn. Vui lòng chờ một chút để chúng tôi có thể hỗ trợ bạn tốt nhất', // Nội dung phản hồi tự động
        img: [],
        status, // Đặt trạng thái phù hợp cho phản hồi
      });

      // Lưu phản hồi tự động
      await autoReply.save();

      // Phát sự kiện phản hồi tự động
      if (io) {
        const user = await User.findById(userId);

      if (user && user.socketId) {
        const socketId = user.socketId;
        console.log('Socket ID:', socketId); // Log socket ID để kiểm tra

        io.to(socketId).emit('sendMessageToUsers', {
          _id:autoReply._id,
          user_id:user._id,
          content:autoReply.content,
          img: [], // Đảm bảo img là mảng, nếu không có thì gán mảng rỗng
          status:autoReply.status,
          createdAt:autoReply.createdAt,
          message_id: autoReply.message_id
        });
        console.log('Tin nhanws tuj dong:', autoReply.content);

       
       
        

      }
    }}

    // Phát sự kiện cho tin nhắn mới
    if (io) {
      const user = await User.findById(userId);
      if (user && user.socketId) {
        io.emit('sendMessageToAdmins', {
          _id: savedMessage._id,
          user_id: userId,
          content,
          img: req.imageUrls || [],
          status,
          createdAt: savedMessage.createdAt,
        });
      }
    }

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Lỗi khi tạo tin nhắn:', error);
    res.status(500).json({ message: 'Lỗi khi tạo tin nhắn', error: error.message });
  }
};


// Lấy tất cả tin nhắn
const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find();
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error while fetching messages:', error);
    res.status(500).json({ message: 'Error while fetching messages', error: error.message });
  }
};

// Lấy tin nhắn theo ID
const getMessageById = async (req, res) => {
  const messageId = req.params.id;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }
    const message = await Message.find({ user_id: req.user.id })

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.status(200).json(message);
  } catch (error) {
    console.error('Error while fetching message:', error);
    res.status(500).json({ message: 'Error while fetching message', error: error.message });
  }
};

// Sửa tin nhắn
const updateMessage = async (req, res) => {
  const messageId = req.params.id;
  const { user_id, content, img, status } = req.body;

  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { user_id, content, img, status },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: 'Message not found or no changes made' });
    }


    // Phát sự kiện qua Socket.IO nếu io đã được khởi tạo
    const io = req.app.get('io');
    if (io) {
      io.emit('updateMessage', updatedMessage);
    } else {
      console.error('Socket.IO is not initialized');
    }


    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error('Error while updating message:', error);
    res.status(500).json({ message: 'Error while updating message', error: error.message });
  }
};

// Xóa tin nhắn
const deleteMessage = async (req, res) => {
  const messageId = req.params.id;

  try {
    const deletedMessage = await Message.findByIdAndDelete(messageId);
    if (!deletedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Phát sự kiện qua Socket.IO nếu io đã được khởi tạo
    const io = req.app.get('io');
    if (io) {
      io.emit('deleteMessage', { id: messageId });
    } else {
      console.error('Socket.IO is not initialized');
    }

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error while deleting message:', error);
    res.status(500).json({ message: 'Error while deleting message', error: error.message });
  }
};

module.exports = { createMessage, getAllMessages, getMessageById, updateMessage, deleteMessage };
