const { Message, Reply } = require("../models/Message");

const MessageController = {
    // Tạo tin nhắn mới
    createMessage: async (req, res) => {
        try {
            const { user_id, content, attachments } = req.body;

            const newMessage = new Message({
                user_id,
                content,
                attachments, // Lưu các file đính kèm
            });

            const savedMessage = await newMessage.save();
            res.status(201).json(savedMessage);
        } catch (error) {
            console.error('Error while creating message:', error);
            res.status(500).json({ message: 'Error while creating message', error: error.message });
        }
    },

    // Tạo phản hồi mới cho tin nhắn
    createReply: async (req, res) => {
        try {
            const { message_id, user_id, content, attachments } = req.body;

            const newReply = new Reply({
                message_id,
                user_id,
                content,
                attachments, // Lưu các file đính kèm
            });

            const savedReply = await newReply.save();
            res.status(201).json(savedReply);
        } catch (error) {
            console.error('Error while creating reply:', error);
            res.status(500).json({ message: 'Error while creating reply', error: error.message });
        }
    },

    // Lấy tất cả tin nhắn và phản hồi
    getAllMessagesWithReplies: async (req, res) => {
        try {
            const messages = await Message.aggregate([
                {
                    $lookup: {
                        from: "replies", // Tên collection của phản hồi
                        localField: "_id",
                        foreignField: "message_id",
                        as: "replies" // Mảng chứa các phản hồi
                    }
                }
            ]);

            res.status(200).json(messages);
        } catch (error) {
            console.error('Error while fetching messages with replies:', error);
            res.status(500).json({ message: 'Error while fetching messages with replies', error: error.message });
        }
    },

    // Xóa tin nhắn và phản hồi liên quan
    deleteMessage: async (req, res) => {
        const messageId = req.params.id;

        try {
            // Xóa tất cả phản hồi liên quan
            

            // Xóa tin nhắn
            const deletedMessage = await Message.findByIdAndDelete(messageId);
            if (!deletedMessage) {
                return res.status(404).json({ message: 'Message not found' });
            }

            res.status(200).json({ message: 'Message and related replies deleted successfully' });
        } catch (error) {
            console.error('Error while deleting message:', error);
            res.status(500).json({ message: 'Error while deleting message', error: error.message });
        }
    },


};

module.exports = MessageController;
