const mongoose = require("mongoose"); // Thêm dòng này để import mongoose
const Review = require("../models/Review");
const Variant = require("../models/Variants");
const OrderItem = require("../models/Order_items"); // Giả sử bạn có bảng OrderItem
const Order = require("../models/order");

const ReviewController = {
  // Thêm đánh giá mới

  addReview: async (req, res) => {
    try {
      const userId = req.user.id; // Lấy user_id từ xác thực của người dùng
      const { product_id, rating, comment, color, size, image_variant } = req.body;

      console.log("Thiếu thông tin cần thiết:",product_id +" "+rating+" "+comment+" "+color+" "+size+" "+image_variant);
  
      // Kiểm tra nếu thông tin rating hoặc product_id không tồn tại
      if (!product_id || !rating) {
        console.log("Thiếu thông tin cần thiết.");
        
        return res.status(400).json({ message: "Thiếu thông tin cần thiết." });
      }
  
      // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
      const existingReview = await Review.findOne({ user_id: userId, product_id });
      if (existingReview) {
        console.log("Bạn đã đánh giá sản phẩm này.");
        
        return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này." });
      }
  
      // Tạo một review mới
      const newReview = new Review({
        user_id: userId,
        product_id,
        rating,
        comment,
        color,
        size,
        image_variant,
        img: req.imageUrls || [], // Lưu ảnh do người dùng tải lên (nếu có)
      });
  
      // Lưu review vào cơ sở dữ liệu
      await newReview.save();
  
      res.status(201).json({
        message: "Đánh giá đã được thêm thành công",
        review: newReview,
      });
    } catch (error) {
      console.error("Error while adding review:", error);
      res.status(500).json({ message: "Lỗi khi thêm đánh giá", error: error.message });
    }
  },
  
  
  

  getUserReviews: async (req, res) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Lấy tất cả đánh giá của một người dùng
      const userReviews = await Review.find({ user_id: userId });

      if (userReviews.length === 0) {
        return res
          .status(404)
          .json({ message: "No reviews found for this user" });
      }

      res.status(200).json(userReviews);
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      res.status(500).json({
        message: "Error fetching user reviews",
        error: error.message,
      });
    }
  },

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
      res.status(500).json({
        message: "Error fetching product reviews with responses",
        error: error.message,
      });
    }
  },

  create_review: async (req, res) => {
    try {
      const variant = await Variant.findOne({
        color: req.body.color,
        product_id: req.body.product_id,
      });
      if (!variant) {
        return res.status(404).json({ message: "Variant not found" });
      }

      const newReview = new Review({
        product_id: req.body.product_id,
        user_id: req.body.user_id,
        rating: req.body.rating,
        comment: req.body.comment,
        color: req.body.color, // Tùy chọn
        size: req.body.size, // Tùy chọn
        img: req.body.img, // Thêm trường img
        image_variant: variant.image,
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
      res.status(200).json({
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

      res.status(200).json({
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