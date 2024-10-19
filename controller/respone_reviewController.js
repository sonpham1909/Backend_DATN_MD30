const ResponseReview = require("../models/Respone_review");

const ResponseReviewController = {
    // Thêm phản hồi mới
    create_response: async (req, res) => {
        try {
            const newResponse = new ResponseReview({
                review_id: req.body.review_id, // ID của đánh giá mà phản hồi này liên kết tới
                user_id: req.body.user_id,     // ID của người dùng đã tạo phản hồi
                comment: req.body.comment        // Nội dung phản hồi
            });
            const savedResponse = await newResponse.save();
            res.status(201).json(savedResponse);
        } catch (error) {
            console.error('Error while adding response:', error);
            res.status(500).json({ message: 'Error while adding response', error: error.message });
        }
    },

    // Lấy tất cả phản hồi
    getAllResponses: async (req, res) => {
        try {
            const responses = await ResponseReview.find();
            res.status(200).json(responses);
        } catch (error) {
            console.error("Error fetching responses:", error);
            res.status(500).json({ message: 'Error fetching responses', error: error.message });
        }
    },

    // Cập nhật phản hồi
    updateResponse: async (req, res) => {
        const responseId = req.params.id; 
        const updatedData = {};

        try {
            const response = await ResponseReview.findById(responseId);
            if (!response) {
                return res.status(404).json({ message: 'Response not found' });
            }

            // Cập nhật các trường
            updatedData.comment = req.body.comment || response.comment;

            // Cập nhật phản hồi
            Object.assign(response, updatedData);
            const updatedResponse = await response.save();
            res.status(200).json({ message: 'Response updated successfully', response: updatedResponse });
        } catch (error) {
            console.error("Error updating response:", error);
            res.status(500).json({ message: 'Error updating response', error: error.message });
        }
    },

    // Xóa phản hồi
    deleteResponse: async (req, res) => {
        const responseId = req.params.id;

        try {
            const deletedResponse = await ResponseReview.findByIdAndDelete(responseId);
            if (!deletedResponse) {
                return res.status(404).json({ message: 'Response not found' });
            }

            res.status(200).json({ message: 'Response deleted successfully', responseId: deletedResponse._id });
        } catch (error) {
            console.error("Error deleting response:", error);
            res.status(500).json({ message: 'Error deleting response', error: error.message });
        }
    },

    // Tìm kiếm phản hồi
    searchResponses: async (req, res) => {
        try {
            const { keyword } = req.query;
            const regex = new RegExp(keyword, 'i');
            const responses = await ResponseReview.find({ $or: [{ comment: regex }] });
            res.status(200).json(responses);
        } catch (error) {
            console.error("Error searching responses:", error);
            res.status(500).json({ message: 'Error searching responses', error: error.message });
        }
    }
}

module.exports = ResponseReviewController;
