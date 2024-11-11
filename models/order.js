const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    address_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
      required: true
    },
    total_products: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      default: 'pending'
    },
    shipping_method_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShippingMethod',
      required: true
    },
    payment_method_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentMethod',
      required: true
    },
    total_amount: {
      type: Number,
      required: true
    },
    cancelReason: {
      type: String,
      default: '' // Trường lý do hủy
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
