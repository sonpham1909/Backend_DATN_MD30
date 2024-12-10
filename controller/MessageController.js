const Message = require('../models/Message');

// Tạo tin nhắn mới
const createMessage = async (req, res) => {
  try {
    const { user_id, content, img, status } = req.body;

    const newMessage = new Message({
      user_id,
      content,
      img,
      status,
    });

    const savedMessage = await newMessage.save();

    // Phát sự kiện qua Socket.IO
    const io = req.app.get('io'); // Lấy đối tượng io từ app
    io.emit('newMessage', savedMessage); // Phát sự kiện "newMessage" tới tất cả client

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
    const message = await Message.findById(messageId);
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
      return res.status(404).json({ message: 'Message not found' });
    }

    // Phát sự kiện qua Socket.IO
    const io = req.app.get('io'); // Lấy đối tượng io từ app
    io.emit('updateMessage', updatedMessage); // Phát sự kiện "updateMessage" tới tất cả client

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

    // Phát sự kiện qua Socket.IO
    const io = req.app.get('io'); // Lấy đối tượng io từ app
    io.emit('deleteMessage', { id: messageId }); // Phát sự kiện "deleteMessage" tới tất cả client

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error while deleting message:', error);
    res.status(500).json({ message: 'Error while deleting message', error: error.message });
  }
};

module.exports = { createMessage, getAllMessages, getMessageById, updateMessage, deleteMessage };
