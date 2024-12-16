// const crypto = require('crypto');
// const axios = require('axios');
// const Order = require('../models/order');
// const Payment = require('../models/Payment_Momo'); // Bảng thanh toán mới
// const Cart = require('../models/Cart'); // Đảm bảo đường dẫn đến file Cart là chính xác

// const config = {
//   accessKey: 'F8BBA842ECF85',
//   secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
//   partnerCode: 'MOMO',
//   redirectUrl: 'yourapp://payment-success', // Sử dụng deep link để điều hướng về app của bạn
//   ipnUrl: 'https://efb2-2405-4803-e632-a600-25fb-a23a-764a-eac6.ngrok-free.app/v1/Payment_Momo/callback', // URL để MoMo gửi callback
//   requestType: 'payWithATM',
//   lang: 'vi',
// };

// const paymentController = {
//   // Khởi tạo thanh toán MoMo
//   initiateMoMoPayment: async (req, res) => {
//     try {
//       const { orderId, amount } = req.body;  // Nhận `amount` từ request body
//       const userId = req.user.id; // Lấy user từ xác thực

//       const order = await Order.findById(orderId);
//       if (!order) {
//         return res.status(404).json({ message: 'Order not found' });
//       }

//       // Kiểm tra nếu `amount` không hợp lệ
//       if (!amount) {
//         return res.status(400).json({ message: 'Amount is required' });
//       }

//       // Tạo thông tin thanh toán mới trong cơ sở dữ liệu
//       const payment = new Payment({
//         orderId,
//         userId,
//         amount,  // Sử dụng `amount` từ request body
//         paymentMethod: 'MoMo',
//         status: 'pending',
//       });
//       await payment.save();

//       const {
//         accessKey, secretKey, partnerCode, redirectUrl, ipnUrl, requestType, lang,
//       } = config;

//       const requestId = `${partnerCode}_${Date.now()}`;
//       const orderInfo = `Thanh toán đơn hàng #${orderId} qua MoMo`;
//       const partnerName = 'Shop Bán Đồ Nam Stylife'; // Tên đối tác
//       const storeId = 'Stylife'; // Id của cửa hàng (nếu có)
//       const autoCapture = true; // Tự động thực hiện thu tiền
//       const extraData = ''; // Dữ liệu bổ sung (nếu có)

//       const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

//       // Tạo chữ ký
//       const signature = crypto.createHmac('sha256', secretKey)
//         .update(rawSignature)
//         .digest('hex');

//       // Gửi yêu cầu đến MoMo
//       const requestBody = {
//         partnerCode,
//         partnerName,
//         storeId,
//         requestId,
//         amount,  // Sử dụng `amount` từ request body
//         orderId,
//         orderInfo,
//         redirectUrl,
//         ipnUrl,
//         requestType,
//         signature,
//         lang,
//         extraData,
//         autoCapture,
//       };

//       console.log('Sending request to MoMo:', requestBody);
//       const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       // Kiểm tra phản hồi từ MoMo
//       console.log('MoMo Response:', response.data);

//       // Cập nhật thông tin thanh toán với URL thanh toán MoMo
//       payment.response = response.data;
//       await payment.save();

//       // Trả về URL thanh toán cho phía client
//       res.status(200).json(response.data);
//     } catch (error) {
//       console.error('Error initiating MoMo payment:', error.response?.data || error.message || error);
//       res.status(500).json({ message: 'Failed to initiate MoMo payment', error: error.message });
//     }
//   },
//   handleMoMoCallback: async (req, res) => {
//     try {
//       const { orderId, resultCode, transId, message } = req.body;

//       const payment = await Payment.findOne({ orderId });
//       if (!payment) {
//         return res.status(404).json({ message: 'Payment not found' });
//       }

//       // Cập nhật trạng thái thanh toán dựa trên `resultCode`
//       switch (resultCode) {
//         case 0: // Thanh toán thành công
//           payment.status = 'paid';
//           payment.transactionId = transId;
//           break;
//         case 9000: // Thanh toán bị hủy
//           payment.status = 'cancelled';
//           break;
//         default: // Thanh toán thất bại hoặc lỗi khác
//           payment.status = 'failed';
//           break;
//       }

//       // Cập nhật phản hồi từ MoMo
//       payment.response = req.body;
//       await payment.save();

//       // Trả về phản hồi dựa trên `resultCode`
//       res.status(200).json({ message: message || 'Payment status updated successfully.' });
//     } catch (error) {
//       console.error('MoMo callback handling error:', error);
//       res.status(500).json({ message: 'Failed to handle MoMo callback', error: error.message });
//     }
//   },

//   // Kiểm tra trạng thái thanh toán
//   checkMoMoTransactionStatus: async (req, res) => {
//     try {
//       const { orderId } = req.body;
//       const {
//         accessKey, secretKey, partnerCode,
//       } = config;

//       const requestId = orderId;
//       const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${requestId}`;
//       const signature = crypto.createHmac('sha256', secretKey)
//         .update(rawSignature)
//         .digest('hex');

//       const requestBody = {
//         partnerCode,
//         requestId,
//         orderId,
//         signature,
//         lang: 'vi',
//       };

//       const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/query', requestBody, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       // Lấy trạng thái thanh toán từ phản hồi của MoMo
//       const payment = await Payment.findOne({ orderId });
//       if (!payment) {
//         return res.status(404).json({ message: 'Payment not found' });
//       }

//       if (response.data.resultCode === 0) {
//         payment.status = 'paid';
//         payment.transactionId = response.data.transId;
//       } else {
//         payment.status = 'failed';
//       }

//       payment.response = response.data;
//       await payment.save();

//       res.status(200).json(response.data);
//     } catch (error) {
//       console.error('Error checking MoMo transaction status:', error);
//       res.status(500).json({ message: 'Failed to check MoMo transaction status', error: error.message });
//     }
//   },
// };

// module.exports = paymentController;

// Kiểm tra trạng thái thanh toán

const crypto = require("crypto");
const axios = require("axios");
const Order = require("../models/order");
const Payment = require("../models/Payment_Momo");
const Cart = require("../models/Cart");

const config = {
  accessKey: "F8BBA842ECF85",
  secretKey: "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  partnerCode: "MOMO",
  redirectUrl: "yourapp://payment-success",
  ipnUrl: "https://86ba-42-118-89-117.ngrok-free.app/v1/Payment_Momo/callback",
  requestType: "payWithATM",
  lang: "vi",
};

const paymentController = {
  initiateMoMoPayment: async (req, res) => {
    try {
      const { orderId, amount } = req.body;
      const userId = req.user.id;

      console.log(`Khởi tạo thanh toán cho đơn hàng: ${orderId}, số tiền: ${amount}`);

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (!amount) {
        return res.status(400).json({ message: "Amount is required" });
      }

      const payment = new Payment({
        orderId,
        userId,
        amount,
        paymentMethod: "MoMo",
        status: "pending",
      });
      await payment.save();

      const { accessKey, secretKey, partnerCode, redirectUrl, ipnUrl, requestType, lang } = config;
      const requestId = `${partnerCode}_${Date.now()}`;
      const orderInfo = `Thanh toán đơn hàng #${orderId} qua MoMo`;
      const partnerName = "Shop Bán Đồ Nam Stylife";
      const storeId = "Stylife";
      const autoCapture = true;
      const extraData = "";

      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
      const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

      const requestBody = {
        partnerCode,
        partnerName,
        storeId,
        requestId,
        amount,
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

      console.log("Thông tin gửi đi đến MoMo:", requestBody);

      const response = await axios.post(
        "https://test-payment.momo.vn/v2/gateway/api/create",
        requestBody,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Phản hồi từ MoMo:", response.data);

      payment.response = response.data;
      await payment.save();

      res.status(200).json(response.data);
    } catch (error) {
      console.error("Error initiating MoMo payment:", error);
      res.status(500).json({
        message: "Failed to initiate MoMo payment",
        error: error.message,
      });
    }
  },

   handleMoMoCallback: async (req, res) => {
    try {
      console.log("Callback từ MoMo:", req.body);
  
      const { orderId, resultCode, transId, message } = req.body;
  
      // Tìm thanh toán và đơn hàng tương ứng
      const payment = await Payment.findOne({ orderId });
      const order = await Order.findOne({ _id: orderId });
  
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      // Mặc định trạng thái là "pending" cho cả thanh toán và đơn hàng
      let paymentStatus = "pending"; // Mặc định trạng thái thanh toán là "pending"
      let orderStatus = "pending"; // Mặc định trạng thái đơn hàng là "pending"
      let transactionId = null;
  
      // Xử lý các mã kết quả từ MoMo sử dụng switch-case
      switch (resultCode) {
        case 0: // Thành công
          paymentStatus = "paid";
          orderStatus = "ready_for_shipment"; // Đơn hàng thành công, xác nhận
          transactionId = transId;
          break;
        case 9000: // Hủy
          paymentStatus = "cancelled";
          orderStatus = "canceled"; // Đơn hàng bị hủy
          break;
        case 1006: // Thất bại
          paymentStatus = "failed";
          orderStatus = "canceled"; // Đơn hàng bị hủy
          break;
        case 1030: // Hết hạn
          paymentStatus = "expired";
          orderStatus = "canceled"; // Đơn hàng bị hủy
          break;
        default:
          paymentStatus = "failed"; // Nếu không có mã nào khớp, mặc định là thất bại
          orderStatus = "canceled"; // Đơn hàng bị hủy
          break;
      }
  
      // Cập nhật trạng thái thanh toán trong bảng Payment
      payment.status = paymentStatus;
      if (transactionId) payment.transactionId = transactionId;
      payment.response = req.body;
      await payment.save();
  
      console.log("Cập nhật trạng thái thanh toán:", payment.status, "Thông tin giao dịch:", payment.transactionId);
  
      // Cập nhật trạng thái thanh toán trong bảng Order
      order.payment_status = paymentStatus;
      await order.save();
  
      console.log("Cập nhật trạng thái thanh toán trong đơn hàng:", order.payment_status);
  
      // Cập nhật trạng thái đơn hàng trong bảng Order
      if (orderStatus === "ready_for_shipment") {
        order.status = "ready_for_shipment";  // Trạng thái đơn hàng thành công
      } else if (orderStatus === "canceled") {
        order.status = "canceled";  // Trạng thái đơn hàng bị hủy
      }
      await order.save();
  
      console.log("Cập nhật trạng thái đơn hàng:", order.status);
  
      // Nếu thanh toán thành công (status = "paid"), xóa giỏ hàng của người dùng
      if (resultCode === 0) {
        const cartDeleted = await Cart.deleteMany({ user_id: payment.userId });
  
        if (cartDeleted.deletedCount > 0) {
          console.log("Giỏ hàng đã được xóa");
        } else {
          console.log("Không tìm thấy giỏ hàng để xóa");
        }
      } else {
        console.log("Thanh toán không thành công, không xóa giỏ hàng");
      }
  
      res.status(200).json({
        message: message || "Payment status updated successfully.",
        payment_status: payment.status,
        order_status: order.status,
      });
    } catch (error) {
      console.error("MoMo callback handling error:", error);
      res.status(500).json({
        message: "Failed to handle MoMo callback",
        error: error.message,
      });
    }
  },
  
};

module.exports = paymentController;

