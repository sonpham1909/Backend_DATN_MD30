const mongoose = require("mongoose"); // Thêm dòng này để import mongoose

const Review = require("../models/Review");
const ReviewController = {
  // Thêm đánh giá mới

  getProductReviewsWithResponses: async (req, res) => {
    try {
      const productId = req.params.product_id;

      // Sử dụng aggregate để lấy đánh giá và phản hồi của sản phẩm
      const reviews = await Review.aggregate([
        {
          $match: { product_id: new mongoose.Types.ObjectId(productId) }, // Lọc các đánh giá có product_id khớp
        },
        {
          $lookup: {
            from: "responsereviews", // Tên collection của phản hồi
            localField: "_id",
            foreignField: "review_id",
            as: "responses", // Tạo một mảng chứa các phản hồi
          },
        },
      ]);

      res.status(200).json(reviews);
    } catch (error) {
      console.error("Error fetching product reviews with responses:", error);
      res
        .status(500)
        .json({
          message: "Error fetching product reviews with responses",
          error: error.message,
        });
    }
  },

  create_review: async (req, res) => {
    try {
      const newReview = new Review({
        product_id: req.body.product_id,
        user_id: req.body.user_id,
        rating: req.body.rating,
        comment: req.body.comment,
        color: req.body.color, // Tùy chọn
        size: req.body.size, // Tùy chọn
        img: req.body.img, // Thêm trường img
      });
      const savedReview = await newReview.save();
      res.status(201).json(savedReview);
    } catch (error) {
      console.error("Error while adding review:", error);
      res
        .status(500)
        .json({ message: "Error while adding review", error: error.message });
    }
  },

  // Lấy tất cả đánh giá
  getAllReviews: async (req, res) => {
    try {
      const reviews = await Review.find();
      res.status(200).json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res
        .status(500)
        .json({ message: "Error fetching reviews", error: error.message });
    }
  },

  // Cập nhật đánh giá
  updateReview: async (req, res) => {
    const reviewId = req.params.id;
    const updatedData = {};

    try {
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      // Cập nhật các trường
      updatedData.rating = req.body.rating || review.rating;
      updatedData.comment = req.body.comment || review.comment;
      updatedData.color = req.body.color || review.color;
      updatedData.size = req.body.size || review.size;
      updatedData.img = req.body.img || review.img; // Cập nhật trường img

      // Cập nhật đánh giá
      Object.assign(review, updatedData);
      const updatedReview = await review.save();
      res
        .status(200)
        .json({
          message: "Review updated successfully",
          review: updatedReview,
        });
    } catch (error) {
      console.error("Error updating review:", error);
      res
        .status(500)
        .json({ message: "Error updating review", error: error.message });
    }
  },

  // Xóa đánh giá
  deleteReview: async (req, res) => {
    const reviewId = req.params.id;

    try {
      const deletedReview = await Review.findByIdAndDelete(reviewId);
      if (!deletedReview) {
        return res.status(404).json({ message: "Review not found" });
      }

      res
        .status(200)
        .json({
          message: "Review deleted successfully",
          reviewId: deletedReview._id,
        });
    } catch (error) {
      console.error("Error deleting review:", error);
      res
        .status(500)
        .json({ message: "Error deleting review", error: error.message });
    }
  },

  // Tìm kiếm đánh giá
  searchReviews: async (req, res) => {
    try {
      const { keyword } = req.query;
      const regex = new RegExp(keyword, "i");
      const reviews = await Review.find({ $or: [{ comment: regex }] });
      res.status(200).json(reviews);
    } catch (error) {
      console.error("Error searching reviews:", error);
      res
        .status(500)
        .json({ message: "Error searching reviews", error: error.message });
    }
  },
};

module.exports = ReviewController;
