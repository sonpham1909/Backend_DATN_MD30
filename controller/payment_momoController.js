const crypto = require('crypto');
const axios = require('axios');
const Order = require('../models/order');
const Payment = require('../models/Payment_Momo'); // Bảng thanh toán mới
const Cart = require('../models/Cart'); // Đảm bảo đường dẫn đến file Cart là chính xác

const config = {
  accessKey: 'F8BBA842ECF85',
  secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
  partnerCode: 'MOMO',
  redirectUrl: 'yourapp://payment-success', // Sử dụng deep link để điều hướng về app của bạn
  ipnUrl: 'https://52c7-58-187-157-170.ngrok-free.app/v1/Payment_Momo/callback', // URL để MoMo gửi callback
  requestType: 'payWithATM',
  lang: 'vi',
};

const paymentController = {
  // Khởi tạo thanh toán MoMo
  initiateMoMoPayment: async (req, res) => {
    try {
      const { orderId, amount } = req.body;  // Nhận `amount` từ request body
      const userId = req.user.id; // Lấy user từ xác thực
  
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      // Kiểm tra nếu `amount` không hợp lệ
      if (!amount) {
        return res.status(400).json({ message: 'Amount is required' });
      }
  
      // Tạo thông tin thanh toán mới trong cơ sở dữ liệu
      const payment = new Payment({
        orderId,
        userId,
        amount,  // Sử dụng `amount` từ request body
        paymentMethod: 'MoMo',
        status: 'pending',
      });
      await payment.save();
  
      const {
        accessKey, secretKey, partnerCode, redirectUrl, ipnUrl, requestType, lang,
      } = config;
  
      const requestId = `${partnerCode}_${Date.now()}`;
      const orderInfo = `Thanh toán đơn hàng #${orderId} qua MoMo`;
      const partnerName = 'Shop Bán Đồ Nam Stylife'; // Tên đối tác
      const storeId = 'Stylife'; // Id của cửa hàng (nếu có)
      const autoCapture = true; // Tự động thực hiện thu tiền
      const extraData = ''; // Dữ liệu bổ sung (nếu có)
  
      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  
      // Tạo chữ ký
      const signature = crypto.createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');
  
      // Gửi yêu cầu đến MoMo
      const requestBody = {
        partnerCode,
        partnerName,
        storeId,
        requestId,
        amount,  // Sử dụng `amount` từ request body
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        requestType,
        signature,
        lang,
        extraData,
        autoCapture,
      };
  
      console.log('Sending request to MoMo:', requestBody);
      const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      // Kiểm tra phản hồi từ MoMo
      console.log('MoMo Response:', response.data);
  
      // Cập nhật thông tin thanh toán với URL thanh toán MoMo
      payment.response = response.data;
      await payment.save();
  
      // Trả về URL thanh toán cho phía client
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error initiating MoMo payment:', error.response?.data || error.message || error);
      res.status(500).json({ message: 'Failed to initiate MoMo payment', error: error.message });
    }
  },
  handleMoMoCallback: async (req, res) => {
    try {
      const { orderId, resultCode, transId, message } = req.body;

      const payment = await Payment.findOne({ orderId });
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      // Cập nhật trạng thái thanh toán dựa trên `resultCode`
      switch (resultCode) {
        case 0: // Thanh toán thành công
          payment.status = 'paid';
          payment.transactionId = transId;
          break;
        case 9000: // Thanh toán bị hủy
          payment.status = 'cancelled';
          break;
        default: // Thanh toán thất bại hoặc lỗi khác
          payment.status = 'failed';
          break;
      }

      // Cập nhật phản hồi từ MoMo
      payment.response = req.body;
      await payment.save();

      // Trả về phản hồi dựa trên `resultCode`
      res.status(200).json({ message: message || 'Payment status updated successfully.' });
    } catch (error) {
      console.error('MoMo callback handling error:', error);
      res.status(500).json({ message: 'Failed to handle MoMo callback', error: error.message });
    }
  },

  

};

module.exports = paymentController;