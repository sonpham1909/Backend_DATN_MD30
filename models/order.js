const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    total_amount: {
      type: Number,
      required: true,
    },
    
    total_products: {
      type: Number,
      required: true,
    },
    recipientName: {
      type: String,
      required: true,
    },
    recipientPhone: {
      type: String,
      required: true,
    },
    addressDetail: {
      street: String,
      ward: String,
      district: String,
      city: String,
    },
    payment_method_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentMethod",
      required: true,
    },
    shipping_method_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShippingMethod",
      required: true,
    },
    status: {
      type: String,
      default: "pending",
    },
    payment_status: {  // Trạng thái thanh toán
      type: String,
      default: "pending",  // Mặc định là chờ thanh toán
      enum: ["pending", "paid", "failed", "cancelled","unpaid"],  // Các giá trị có thể có
    },
    cancelReason: {
      type: String,
      default: "", // Trường lý do hủy
      
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
