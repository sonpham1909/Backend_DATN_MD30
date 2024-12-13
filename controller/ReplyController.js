// controllers/ReplyController.js
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const NotificationUser = require('../models/NotificationUser');
const Reply = require('../models/Reply');
const User = require('../models/User');
// Tạo phản hồi mới
const createReply = async (req, res) => {
  try {
    const { message_id, user_id, content, status } = req.body;
  
    const newReply = new Reply({
      message_id,
      user_id,
      content,
      img:req.imageUrls||[],// neu khong co anh thi de rong
      status,
    });
    const savedReply = await newReply.save();

    const message = await Message.findById(message_id);
    if(!message){
      return res.status(404).json({ message: "Message not found" });
    }
    const userTo = await User.findById(message.user_id);
    if(!userTo){
      return res.status(404).json({ message: "User not found" });
    }

    let title= 'Bạn có tin nhắn từ StyleLife nhé!'
  
    

    const notification = new Notification({
      title,
      message:'xem ngay nhé',
      type: 'personal',

    });
    await notification.save();

    const io  = req.app.locals.io;
    if (io) {

      const user = await User.findById(user_id);

      if (user && userTo.socketId) {
        const socketId = userTo.socketId;
        console.log('Socket ID:', socketId); // Log socket ID để kiểm tra

        io.to(socketId).emit('sendMessageToUsers', {
          _id:savedReply._id,
          user_id:user._id,
          content,
          img: req.imageUrls || [], // Đảm bảo img là mảng, nếu không có thì gán mảng rỗng
          status,
          createdAt:savedReply.createdAt,
          message_id
        });
        const notificationUser = new NotificationUser({
          notification_id: notification._id,
          user_id: userTo._id,
          status: 'unread',
        });
        await notificationUser.save();

       
        io.to(socketId).emit('pushnotification', {
          ...notification._doc,
          ...notificationUser._doc
        });

        console.log(`Notification sent to admin`);
      } else {
        console.error(`Socket ID not found fo`);
      }
    }




    
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
