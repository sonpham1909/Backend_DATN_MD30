// controllers/ReplyController.js
const Reply = require('../models/Reply');

// Tạo phản hồi mới
const createReply = async (req, res) => {
  try {
    const { message_id, user_id, content, img, status } = req.body;

    const newReply = new Reply({
      message_id,
      user_id,
      content,
      img: img || [],
      status,
    });

    const savedReply = await newReply.save();
    res.status(201).json(savedReply);
  } catch (error) {
    console.error('Error while creating reply:', error);
    res.status(500).json({ message: 'Error while creating reply', error: error.message });
  }
};

// Lấy tất cả phản hồi của một tin nhắn
const getRepliesByMessage = async (req, res) => {
  const messageId = req.params.messageId;

  try {
    const replies = await Reply.find({ message_id: messageId });
    if (!replies) {
      return res.status(404).json({ message: 'No replies found for this message' });
    }
    res.status(200).json(replies);
  } catch (error) {
    console.error('Error while fetching replies:', error);
    res.status(500).json({ message: 'Error while fetching replies', error: error.message });
  }
};

// Sửa phản hồi
const updateReply = async (req, res) => {
  const replyId = req.params.id;
  const { user_id, content, img, status } = req.body;

  try {
    const updatedReply = await Reply.findByIdAndUpdate(
      replyId,
      { user_id, content, img, status },
      { new: true }
    );
    if (!updatedReply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    res.status(200).json(updatedReply);
  } catch (error) {
    console.error('Error while updating reply:', error);
    res.status(500).json({ message: 'Error while updating reply', error: error.message });
  }
};

// Xóa phản hồi
const deleteReply = async (req, res) => {
  const replyId = req.params.id;

  try {
    const deletedReply = await Reply.findByIdAndDelete(replyId);
    if (!deletedReply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    res.status(200).json({ message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('Error while deleting reply:', error);
    res.status(500).json({ message: 'Error while deleting reply', error: error.message });
  }
};

module.exports = { createReply, getRepliesByMessage, updateReply, deleteReply };
