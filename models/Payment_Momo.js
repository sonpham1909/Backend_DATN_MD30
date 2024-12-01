const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['MoMo', 'CreditCard', 'BankTransfer'],
    default: 'MoMo',
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  transactionId: {
    type: String,
    default: null,
  },
  response: {
    type: Object,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
