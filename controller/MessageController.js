const Message = require('../models/Message');
const User = require('../models/User');
// Tạo tin nhắn mới
const createMessage = async (req, res) => {
  try {
    const { content, status } = req.body;

    // Kiểm tra xem req.user có tồn tại không
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    const userId = req.user._id; 
    const newMessage = new Message({
      user_id: userId,
      content,
      img: req.imageUrls || [], // Đảm bảo img là mảng, nếu không có thì gán mảng rỗng
      status,
    });

    const savedMessage = await newMessage.save();

    // Phát sự kiện qua Socket.IO
    

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error while creating message:', error);
    res.status(500).json({ message: 'Error while creating message', error: error.message });
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
    const user=await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }
    const message = await Message.find({user_id:req.user.id})

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
