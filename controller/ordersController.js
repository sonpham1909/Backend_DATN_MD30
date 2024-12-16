// const Order = require("../models/order");
// const Order_items = require("../models/Order_items");
// const Product = require("../models/Product");
// const Variant = require("../models/Variants");
// const Address = require("../models/Address");

// const Payment = require("../models/Payment_Momo");

// const User = require("../models/User");
// const notificationCotroller = require("./notificationCotroller");
// const Notification = require("../models/Notification");
// const NotificationUser = require("../models/NotificationUser");


// const ordersController = {
//   getAllOrders: async (req, res) => {
//     try {
//       const orders = await Order.find()
//         .populate('user_id', 'full_name email') // Lấy first_name và last_name từ User

//         .populate('payment_method_id', 'name')
//         .populate('shipping_method_id', 'name')
//         .exec();

//       // Thêm full_name vào từng đơn hàng
//       const ordersWithFullName = orders.map(order => ({
//         ...order._doc, // Lấy tất cả thông tin của order
//         full_name: order.user_id?.full_name, // Kiểm tra user_id tồn tại
//         email: order.user_id?.email, // Kiểm tra email tồn tại
//         payment_method: order.payment_method_id?.name,
//         shipping_method: order.shipping_method_id?.name,
//         notes: order.address_id?.notes,

//       }));

//       res.status(200).json(ordersWithFullName);
//     } catch (error) {
//       console.error("Error while fetching orders:", error);
//       res
//         .status(500)
//         .json({ message: "Error while fetching orders", error: error.message });
//     }
//   },

//   createOrder: async (req, res) => {
//     try {
//       const {
//         user_id,
//         shipping_method_id,
//         payment_method_id,
//         address_id,
//         items,
//       } = req.body;

//       // Khởi tạo giá trị tổng tiền và tổng số lượng
//       let totalAmount = 0;
//       let total_Products = 0;

//       // Tạo đơn hàng trước để lấy orderId
//       const order = new Order({
//         user_id,
//         address_id,
//         total_products: total_Products,
//         shipping_method_id: shipping_method_id,
//         payment_method_id: payment_method_id,
//         total_amount: totalAmount, // Tạm thời thiết lập tổng số tiền là 0
//       });

//       // Lưu đơn hàng vào DB để lấy orderId
//       await order.save();

//       // Tạo các mục đơn hàng và cập nhật số lượng sản phẩm
//       await Promise.all(
//         items.map(async (item) => {
//           const variant = await Variant.findOne({
//             product_id: item.product_id,
//             color: item.color,
//             "sizes.size": item.size,
//           });

//           if (!variant) {
//             throw new Error(`Variant not found for product ${item.product_id}`);
//           }

//           const product = await Product.findById(item.product_id);
//           if (!product) {
//             throw new Error(`Product not found for ID ${item.product_id}`);
//           }

//           // Kiểm tra số lượng tồn kho
//           const availableQuantity = variant.sizes.find(
//             (size) => size.size === item.size
//           ).quantity;
//           if (item.quantity > availableQuantity) {
//             throw new Error(
//               `Insufficient stock for product ${item.product_id} in size ${item.size}`
//             );
//           }

//           const orderItem = new Order_items({
//             order_id: order._id,
//             product_id: item.product_id,
//             image_variant: variant.image || product.imageUrls[0],
//             size: item.size,
//             color: item.color,
//             quantity: item.quantity,
//             price: item.price,
//             total_amount: item.quantity * item.price,
//           });

//           totalAmount += orderItem.total_amount; // Cộng dồn tổng số tiền
//           total_Products += item.quantity; // Cộng dồn số lượng sản phẩm

//           // Lưu mục đơn hàng vào CSDL
//           await orderItem.save();

//           // Cập nhật số lượng tồn kho của biến thể
//           await Variant.findOneAndUpdate(
//             {
//               product_id: item.product_id,
//               color: item.color,
//               "sizes.size": item.size,
//             },
//             { $inc: { "sizes.$.quantity": -item.quantity } }
//           );
//         })
//       );

//       // Cập nhật tổng số tiền và tổng sản phẩm vào đơn hàng
//       order.total_amount = totalAmount;
//       order.total_products = total_Products;
//       await order.save();

//       res.status(201).json({ message: "Order created successfully!", order });
//     } catch (error) {
//       console.error("Error creating order:", error);
//       res
//         .status(500)
//         .json({ message: "Error creating order", error: error.message });
//     }
//   },

//   cancelOrder: async (req, res) => {
//     const { orderId, cancelReason } = req.body; // Lấy thông tin từ request body

//     // Kiểm tra xem có đủ thông tin không
//     if (!orderId || !cancelReason) {
//       return res.status(400).json({ message: "orderId and cancelReason are required" });
//     }

//     console.log("Canceling order with ID:", orderId); // Log ID đơn hàng
//     console.log("Cancel reason:", cancelReason); // Log lý do hủy

//     try {
//       const order = await Order.findById(orderId); // Tìm đơn hàng theo orderId

//       if (!order) {
//         return res.status(404).json({ message: "Order not found" });
//       }

//       if (order.status === "canceled") {
//         return res.status(400).json({ message: 'Order is already with status "canceled"' });
//       }

//       // Cập nhật trạng thái và lý do hủy
//       order.status = "canceled";
//       order.cancelReason = cancelReason; // Lưu lý do hủy
//       await order.save(); // Lưu thay đổi vào cơ sở dữ liệu

//       // Cập nhật lại số lượng sản phẩm cho các mục đơn hàng liên quan
//       const orderItems = await Order_items.find({ order_id: orderId });
//       await Promise.all(
//         orderItems.map(async (item) => {
//           await Variant.findOneAndUpdate(
//             {
//               product_id: item.product_id,
//               color: item.color,
//               "sizes.size": item.size,
//             },
//             { $inc: { "sizes.$.quantity": item.quantity } } // Tăng số lượng cho biến thể
//           );
//         })
//       );

//       res.status(200).json({ message: "Order canceled successfully", order });
//     } catch (error) {
//       console.error("Error canceling order:", error);
//       res.status(500).json({ message: "Error canceling order", error: error.message });
//     }
//   },
//   changeStatusOrder: async (req, res) => {
//     const orderId = req.params.orderId;
//     const { status } = req.body; // 'shipping', 'delivered', 'cancelled'

//     try {
//       // Tìm kiếm đơn hàng
//       const order = await Order.findById(orderId);

//       if (!order) {
//         return res.status(404).json({ message: "Order not found" });
//       }

//       // Kiểm tra xem trạng thái hiện tại đã trùng với trạng thái mới chưa
//       if (order.status === status) {
//         return res
//           .status(400)
//           .json({ message: `Order is already with status ${status}` });
//       }

//       // Cập nhật trạng thái đơn hàng
//       order.status = status;
//       // Lưu thông báo vào cơ sở dữ liệu
//       const title = 'Thông báo đơn hàng';
//       let message = `Đơn hàng của bạn đã đặt thành công! Mã đơn hàng của bạn là: Order ID ${orderId}`;
//       if (status === 'ready_for_shipment') {
//         message = `Đơn hàng của bạn đã được xác nhận đang chuẩn bị hàng! Mã đơn hàng của bạn là: Order ID ${orderId}`;
//       } else if (status === 'shipping') {
//         message = `Đơn hàng của bạn đã được gửi cho đơn vị và đang giao cho bạn! Mã đơn hàng của bạn là: Order ID ${orderId}`;
//       } else if (status === 'delivered') {
//         message = `Đơn hàng của bạn đã được giao thành công hãy đánh giá giúp shop nhé! Mã đơn hàng của bạn là: Order ID ${orderId}`;
//       }

//       //Theem vào CSDL
//       const notification = new Notification({
//         title,
//         message,
//         type: 'personal',

//       });
//       await notification.save();

//       // Tạo bản ghi thông báo cho người dùng cụ thể trong Notification_User
//       const notificationUser = new NotificationUser({
//         notification_id: notification._id,
//         user_id: order.user_id,
//         status: 'unread',
//       });
//       await notificationUser.save();

//       console.log('Thông báo cá nhân đã được gửi.');



//       // Gửi thông báo realtime cho người dùng liên quan
//       const io = req.app.locals.io;
//       if (io) {
//         const user = await User.findById(order.user_id);
//         if (user && user.socketId) {
//           const socketId = user.socketId;
//           console.log('Socket ID:', socketId); // Log socket ID để kiểm tra

//           io.to(socketId).emit('pushnotification', {
//             ...notification._doc,
//             ...notificationUser._doc
//           });

//           console.log(`Notification sent to user ${order.user_id} with socket ID ${socketId}`);
//         } else {
//           console.error(`Socket ID not found for user ${order.user_id}`);
//         }
//       }


//       // Lưu thay đổi vào cơ sở dữ liệu
//       await order.save();

//       console.log(`Order status changed to ${status}`); // Log để kiểm tra
//       res
//         .status(200)
//         .json({ message: "Order changed status successfully", order });
//     } catch (error) {
//       console.error("Error updating order status:", error);
//       res.status(500).json({ error: "Không thể cập nhật trạng thái đơn hàng" });
//     }
//   },

//   approveCancellation: async (req, res) => {
//     try {
//       const orderId = req.params.orderId; // Lấy orderId từ request params

//       // Tìm đơn hàng dựa trên orderId
//       const order = await Order.findOne({ _id: orderId });

//       if (!order) {
//         return res.status(404).json({ message: "Order not found" });
//       }

//       // Chỉ cho phép phê duyệt nếu trạng thái là "Đang chờ hủy"
//       if (order.status === "waiting_cancel") {
//         order.status = "canceled";
//         await order.save();
//         return res
//           .status(200)
//           .json({ message: "Order has been canceled successfully" });
//       } else {
//         return res
//           .status(400)
//           .json({ message: "Order cannot be canceled in the current status" });
//       }
//     } catch (error) {
//       console.error("Error while approving order cancellation:", error);
//       res
//         .status(500)
//         .json({
//           message: "Error while approving order cancellation",
//           error: error.message,
//         });
//     }
//   },

//   //phía app
//   createOrderByApp: async (req, res) => {
//     console.log("Request reached /create_order_ByApp");
//     console.log("Request body:", req.body);

//     const { address_id, shipping_method_id, payment_method_id, cartItems } = req.body;
//     const userId = req.user ? req.user.id : null;

//     if (!userId) {
//         console.error("Không thể xác thực người dùng. user_id:", userId);
//         return res.status(400).json({ message: "Không thể xác thực người dùng." });
//     }

//     if (!address_id || !shipping_method_id || !payment_method_id || !cartItems || cartItems.length === 0) {
//         console.error("Thiếu thông tin cần thiết hoặc giỏ hàng trống.", {
//             address_id,
//             shipping_method_id,
//             payment_method_id,
//             cartItemsLength: cartItems ? cartItems.length : 0,
//         });
//         return res.status(400).json({ message: "Thiếu thông tin cần thiết hoặc giỏ hàng trống." });
//     }

//     try {
//         // Lấy chi tiết địa chỉ
//         const address = await Address.findById(address_id);
//         if (!address) {
//             return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
//         }

//         // Tính tổng giá trị đơn hàng và tổng số lượng sản phẩm
//         const total_amount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
//         const total_products = cartItems.reduce((total, item) => total + item.quantity, 0);

//         // Kiểm tra phương thức thanh toán
//         const paymentMethod = await PaymentMethod.findById(payment_method_id);
//         if (!paymentMethod) {
//             return res.status(404).json({ message: "Không tìm thấy phương thức thanh toán" });
//         }

//         const paymentStatus = paymentMethod.name === "MoMo" ? "pending" : "unpaid";

//         // Tạo đơn hàng mới
//         const newOrder = new Order({
//             user_id: userId,
//             recipientName: address.recipientName,
//             recipientPhone: address.recipientPhone,
//             addressDetail: {
//                 street: address.addressDetail.street,
//                 ward: address.addressDetail.ward,
//                 district: address.addressDetail.district,
//                 city: address.addressDetail.city,
//             },
//             shipping_method_id,
//             payment_method_id,
//             total_products,
//             total_amount,
//             status: "pending",
//             payment_status: paymentStatus,
//         });

//         await newOrder.save();
//         console.log("Order created successfully:", newOrder);

//         // Tạo các mục đơn hàng và cập nhật số lượng biến thể sản phẩm
//         for (const cartItem of cartItems) {
//             const orderItem = new Order_items({
//                 order_id: newOrder._id,
//                 product_id: cartItem.product_id,
//                 size: cartItem.size,
//                 color: cartItem.color,
//                 quantity: cartItem.quantity,
//                 price: cartItem.price,
//                 total_amount: cartItem.price * cartItem.quantity,
//                 image_variant: cartItem.image_variant,
//             });
//             await orderItem.save();

//             const variant = await Variant.findOne({
//                 product_id: cartItem.product_id,
//                 color: cartItem.color,
//                 "sizes.size": cartItem.size,
//             });

//             if (variant) {
//                 const sizeIndex = variant.sizes.findIndex((s) => s.size === cartItem.size);
//                 if (sizeIndex > -1) {
//                     variant.sizes[sizeIndex].quantity -= cartItem.quantity;
//                 }
//                 await variant.save();
//             }
//         }

//         // Gửi thông báo realtime
//         const io = req.app.locals.io;
//         const title = 'Thông báo đơn hàng';
//         const message = `Đơn hàng của bạn đã đặt thành công! Mã đơn hàng của bạn là: Order ID ${newOrder._id}`;
//         await notificationCotroller.sendPersonalNotification(userId, title, message);

//         if (io) {
//             const user = await User.findById(userId);
//             if (user && user.socketId) {
//                 io.to(user.socketId).emit('pushnotification', {
//                     userId,
//                     message,
//                     title,
//                 });
//             }
//         }

//         res.status(201).json({ message: "Đặt hàng thành công", order: newOrder });
//     } catch (error) {
//         console.error("Error creating order:", error);
//         res.status(500).json({ message: "Lỗi khi tạo đơn hàng", error: error.message });
//     }
// },





//   getOrdersByStatus: async (req, res) => {
//     try {
//       const userId = req.user.id; // Lấy user_id từ xác thực của người dùng
//       const status = req.params.status; // Lấy trạng thái từ request params

//       // Tìm tất cả đơn hàng của người dùng có trạng thái tương ứng
//       const orders = await Order.find({ user_id: userId, status })
//         .populate("user_id", "full_name email")
//         .populate("payment_method_id", "name")
//         .populate("shipping_method_id", "name")
//         .exec();

//       // Thêm thông tin chi tiết vào từng đơn hàng
//       const ordersWithDetails = orders.map((order) => ({
//         ...order._doc,
//         full_name: order.user_id?.full_name,
//         email: order.user_id?.email,
//         recipientPhone: order.recipientPhone,
//         recipientName: order.recipientName,
//         addressDetail: order.addressDetail,
//         payment_method: order.payment_method_id?.name,
//         shipping_method: order.shipping_method_id?.name,
//       }));

//       res.status(200).json(ordersWithDetails);
//     } catch (error) {
//       console.error("Error while fetching orders by status:", error);
//       res
//         .status(500)
//         .json({ message: "Error while fetching orders", error: error.message });
//     }
//   },

//   getOrderItemById: async (req, res) => {
//     const { orderId } = req.params;

//     try {
//       // Tìm kiếm đơn hàng dựa trên orderId
//       const order = await Order.findById(orderId)
//         .populate("user_id", "full_name email phone_number") // Lấy thông tin người dùng
//         .populate("payment_method_id", "name") // Lấy phương thức thanh toán
//         .populate("shipping_method_id", "name"); // Lấy phương thức vận chuyển

//       if (!order) {
//         return res.status(404).json({ message: "Order not found" });
//       }

//       // Lấy các mục đơn hàng liên quan đến đơn hàng này và populate sản phẩm
//       const orderItems = await Order_items.find({ order_id: orderId }).populate(
//         "product_id"
//       ); // Populate các trường của sản phẩm cần thiết

//       res.status(200).json({ order, items: orderItems });
//     } catch (error) {
//       console.error("Error while fetching order:", error);
//       res
//         .status(500)
//         .json({ message: "Error while fetching order", error: error.message });
//     }
//   },

//   getPurchasedProducts: async (req, res) => {
//     try {
//       const userId = req.user.id; // Lấy user_id từ xác thực của người dùng

//       // Lấy tất cả các đơn hàng có trạng thái giao hàng thành công
//       const orders = await Order.find({
//         user_id: userId,
//         status: "delivered",
//       });

//       if (!orders || orders.length === 0) {
//         return res
//           .status(404)
//           .json({ message: "Không có sản phẩm nào đã mua." });
//       }

//       // Lấy danh sách order_ids từ các đơn hàng
//       const orderIds = orders.map((order) => order._id);

//       // Lấy tất cả các mục đơn hàng từ bảng OrderItem với các order_ids đó và populate thông tin sản phẩm
//       const orderItems = await Order_items.find({
//         order_id: { $in: orderIds },
//       }).populate("product_id", "name price imageUrls"); // Lấy thông tin sản phẩm từ bảng Product

//       console.log("Order Items:", orderItems);

//       if (!orderItems || orderItems.length === 0) {
//         return res.status(404).json({ message: "Không có mục đơn hàng nào." });
//       }

//       // Xử lý và định dạng dữ liệu để trả về
//       const purchasedProducts = orderItems.map((item) => ({
//         product_id: item.product_id._id, // Đảm bảo rằng bạn trả về `product_id`
//         productName: item.product_id?.name || "Sản phẩm không xác định",
//         productPrice: item.price
//           ? item.price.toLocaleString("vi-VN") + " Đ"
//           : "N/A",
//         size: item.size,
//         color: item.color,
//         imageVariant:
//           item.image_variant || item.product_id?.imageUrls?.[0] || "N/A",
//         quantity: item.quantity,
//       }));

//       res.status(200).json(purchasedProducts);
//     } catch (error) {
//       console.error("Error while fetching purchased products:", error);
//       res
//         .status(500)
//         .json({ message: "Lỗi khi lấy sản phẩm đã mua", error: error.message });
//     }
//   },

//   cancelOrderByApp: async (req, res) => {
//     try {
//       const userId = req.user.id; // Lấy user_id từ xác thực của người dùng
//       const orderId = req.params.orderId; // Lấy orderId từ request params
//       const { cancelReason } = req.body; // Lấy lý do hủy từ request body

//       // Kiểm tra nếu cancelReason không tồn tại
//       if (!cancelReason && req.body.cancelReason === undefined) {
//         return res
//           .status(400)
//           .json({ message: "Cancel reason is required for cancellation" });
//       }

//       // Tìm đơn hàng dựa trên user_id và orderId
//       const order = await Order.findOne({ _id: orderId, user_id: userId });

//       if (!order) {
//         return res.status(404).json({ message: "Order not found" });
//       }

//       // Nếu đơn hàng ở trạng thái "Đã xác nhận", chuyển sang "Đang chờ hủy"
//       if (order.status === "ready_for_shipment") {
//         order.status = "waiting_cancel";
//         order.cancelReason = cancelReason || ""; // Lưu lý do hủy nếu có
//         await order.save();
//         return res
//           .status(200)
//           .json({ message: "Order cancellation request is pending approval" });
//       }

//       // Nếu đơn hàng ở trạng thái "Chờ xác nhận", cho phép hủy trực tiếp
//       if (order.status === "pending") {
//         if (!cancelReason) {
//           return res
//             .status(400)
//             .json({ message: "Cancel reason is required for cancellation" });
//         }
//         order.status = "canceled";
//         order.cancelReason = cancelReason; // Lưu lý do hủy
//         await order.save();
//         return res
//           .status(200)
//           .json({ message: "Order has been canceled successfully" });
//       } else {
//         return res
//           .status(400)
//           .json({ message: "Order cannot be canceled in the current status" });
//       }
//     } catch (error) {
//       console.error("Error while canceling order:", error);
//       res
//         .status(500)
//         .json({ message: "Error while canceling order", error: error.message });
//     }
//   },

//   getStatusPayment: async (req, res) => {
//     try {
//       const { orderId } = req.params;
//       const order = await Order.findById(orderId);
//       if (!order) {
//         return res.status(404).json({ message: "Order not found" });
//       }

//       const payment = await Payment.findOne({ orderId });

//       // Trả về thông tin đơn hàng kèm theo thông tin thanh toán nếu có
//       res.status(200).json({
//         order,
//         ...(payment && {
//           paymentStatus: payment.status,
//           paymentMethod: payment.paymentMethod,
//           transactionId: payment.transactionId,
//           paymentMessage: payment.response?.message,
//         }),
//       });
//     } catch (error) {
//       console.error("Error fetching order details:", error);
//       res.status(500).json({
//         message: "Failed to fetch order details",
//         error: error.message,
//       });
//     }
//   }

// };

// module.exports = ordersController;
const Order = require("../models/order");
const Order_items = require("../models/Order_items");
const Product = require("../models/Product");
const Variant = require("../models/Variants");
const Address = require("../models/Address");
const PaymentMethod = require("../models/Payment_method");

const Payment = require("../models/Payment_Momo");
const notificationCotroller = require("./notificationCotroller");
const Notification = require("../models/Notification");
const NotificationUser = require("../models/NotificationUser");
const User = require("../models/User");
const { default: mongoose } = require("mongoose");

const ordersController = {
  getAllOrders: async (req, res) => {
    try {
      const orders = await Order.find()
        .populate('user_id', 'full_name email') // Lấy first_name và last_name từ User

        .populate('payment_method_id', 'name')
        .populate('shipping_method_id', 'name')
        .exec();

      // Thêm full_name vào từng đơn hàng
      const ordersWithFullName = orders.map(order => ({
        ...order._doc, // Lấy tất cả thông tin của order
        full_name: order.user_id?.full_name, // Kiểm tra user_id tồn tại
        email: order.user_id?.email, // Kiểm tra email tồn tại
        payment_method: order.payment_method_id?.name,
        shipping_method: order.shipping_method_id?.name,
        notes: order.address_id?.notes,

      }));

      res.status(200).json(ordersWithFullName);
    } catch (error) {
      console.error("Error while fetching orders:", error);
      res
        .status(500)
        .json({ message: "Error while fetching orders", error: error.message });
    }
  },

  createOrder: async (req, res) => {
    try {
      const {
        user_id,
        shipping_method_id,
        payment_method_id,
        address_id,
        items,
      } = req.body;

      // Khởi tạo giá trị tổng tiền và tổng số lượng
      let totalAmount = 0;
      let total_Products = 0;

      const address = await Address.findById(address_id);
      if (!address) {
        return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
      }


      // Tạo đơn hàng trước để lấy orderId
      const order = new Order({
        user_id,

        recipientName: address.recipientName,
        recipientPhone: address.recipientPhone,
        addressDetail: {
          street: address.addressDetail.street,
          ward: address.addressDetail.ward,
          district: address.addressDetail.district,
          city: address.addressDetail.city,
        },
        total_products: total_Products,
        shipping_method_id: shipping_method_id,
        payment_method_id: payment_method_id,
        total_amount: totalAmount, // Tạm thời thiết lập tổng số tiền là 0
      });

      // Lưu đơn hàng vào DB để lấy orderId
      await order.save();

      // Tạo các mục đơn hàng và cập nhật số lượng sản phẩm
      await Promise.all(
        items.map(async (item) => {
          const variant = await Variant.findOne({
            product_id: item.product_id,
            color: item.color,
            "sizes.size": item.size,
          });

          if (!variant) {
            throw new Error(`Variant not found for product ${item.product_id}`);
          }

          const product = await Product.findById(item.product_id);
          if (!product) {
            throw new Error(`Product not found for ID ${item.product_id}`);
          }

          // Kiểm tra số lượng tồn kho
          const availableQuantity = variant.sizes.find(
            (size) => size.size === item.size
          ).quantity;
          if (item.quantity > availableQuantity) {
            throw new Error(
              `Insufficient stock for product ${item.product_id} in size ${item.size}`
            );
          }

          const orderItem = new Order_items({
            order_id: order._id,
            product_id: item.product_id,
            image_variant: variant.image || product.imageUrls[0],
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price: item.price,
            total_amount: item.quantity * item.price,
          });

          totalAmount += orderItem.total_amount; // Cộng dồn tổng số tiền
          total_Products += item.quantity; // Cộng dồn số lượng sản phẩm

          // Lưu mục đơn hàng vào CSDL
          await orderItem.save();

          // Cập nhật số lượng tồn kho của biến thể
          await Variant.findOneAndUpdate(
            {
              product_id: item.product_id,
              color: item.color,
              "sizes.size": item.size,
            },
            { $inc: { "sizes.$.quantity": -item.quantity } }
          );
        })
      );

      // Cập nhật tổng số tiền và tổng sản phẩm vào đơn hàng
      order.total_amount = totalAmount;
      order.total_products = total_Products;
      await order.save();

      res.status(201).json({ message: "Order created successfully!", order });
    } catch (error) {
      console.error("Error creating order:", error);
      res
        .status(500)
        .json({ message: "Error creating order", error: error.message });
    }
  },

  cancelOrder: async (req, res) => {
    const { orderId, reason } = req.body; // Lấy thông tin orderId và lý do từ request

    try {
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.status === "canceled") {
        return res
          .status(400)
          .json({ message: 'Order is already with status "canceled"' });
      }
      const orderItems = await Order_items.find({ order_id: orderId });
      if (!orderItems) {
        return res.status(404).json({ message: "Order items not found" });
      }

      order.status = "canceled"; // Cập nhật trạng thái đơn hàng
      order.cancelReason = reason || ""; // Lưu lý do hủy nếu có
      await order.save();

      await Promise.all(
        orderItems.map(async (item) => {
          await Variant.findOneAndUpdate(
            {
              product_id: item.product_id,
              color: item.color,
              "sizes.size": item.size,
            },
            { $inc: { "sizes.$.quantity": item.quantity } } // Giảm số lượng biến thể
          );
        })
      );

      res.status(200).json({ message: "Order canceled successfully", order });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error canceling order", error: error.message });
    }
  },
  changeStatusOrder: async (req, res) => {
    const orderId = req.params.orderId;
    const { status } = req.body; // 'shipping', 'delivered', 'cancelled'

    try {
      // Tìm kiếm đơn hàng
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Kiểm tra xem trạng thái hiện tại đã trùng với trạng thái mới chưa
      if (order.status === status) {
        return res
          .status(400)
          .json({ message: `Order is already with status ${status}` });
      }

      // Cập nhật trạng thái đơn hàng
      order.status = status;
      // Lưu thông báo vào cơ sở dữ liệu
      const title = 'Thông báo đơn hàng';
      let message = `Đơn hàng của bạn đã đặt thành công! Mã đơn hàng của bạn là: Order ID ${orderId}`;
      if (status === 'ready_for_shipment') {
        message = `Đơn hàng của bạn đã được xác nhận đang chuẩn bị hàng! Mã đơn hàng của bạn là: Order ID ${orderId}`;
      } else if (status === 'shipping') {
        message = `Đơn hàng của bạn đã được gửi cho đơn vị và đang giao cho bạn! Mã đơn hàng của bạn là: Order ID ${orderId}`;
      } else if (status === 'delivered') {
        message = `Đơn hàng của bạn đã được giao thành công hãy đánh giá giúp shop nhé! Mã đơn hàng của bạn là: Order ID ${orderId}`;
      }

      //Theem vào CSDL
      const notification = new Notification({
        title,
        message,
        type: 'personal',

      });
      await notification.save();

      // Tạo bản ghi thông báo cho người dùng cụ thể trong Notification_User
      const notificationUser = new NotificationUser({
        notification_id: notification._id,
        user_id: order.user_id,
        status: 'unread',
      });
      await notificationUser.save();

      console.log('Thông báo cá nhân đã được gửi.');



      // Gửi thông báo realtime cho người dùng liên quan
      const io = req.app.locals.io;
      if (io) {
        const user = await User.findById(order.user_id);
        if (user && user.socketId) {
          const socketId = user.socketId;
          console.log('Socket ID:', socketId); // Log socket ID để kiểm tra

          io.to(socketId).emit('pushnotification', {
            ...notification._doc,
            ...notificationUser._doc
          });

          console.log(`Notification sent to user ${order.user_id} with socket ID ${socketId}`);
        } else {
          console.error(`Socket ID not found for user ${order.user_id}`);
        }
      }


      // Lưu thay đổi vào cơ sở dữ liệu
      await order.save();

      console.log(`Order status changed to ${status}`); // Log để kiểm tra
      res
        .status(200)
        .json({ message: "Order changed status successfully", order });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Không thể cập nhật trạng thái đơn hàng" });
    }
  },

  //phía app

  createOrderByApp: async (req, res) => {
    console.log("Request reached /create_order_ByApp");
    console.log("Request body:", req.body);

    const { address_id, shipping_method_id, payment_method_id, cartItems } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      console.error("Không thể xác thực người dùng. user_id:", userId);
      return res.status(400).json({ message: "Không thể xác thực người dùng." });
    }

    if (!address_id || !shipping_method_id || !payment_method_id || !cartItems || cartItems.length === 0) {
      console.error("Thiếu thông tin cần thiết hoặc giỏ hàng trống.", {
        address_id,
        shipping_method_id,
        payment_method_id,
        cartItemsLength: cartItems ? cartItems.length : 0,
      });
      return res.status(400).json({ message: "Thiếu thông tin cần thiết hoặc giỏ hàng trống." });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Lấy chi tiết địa chỉ
      const address = await Address.findById(address_id);
      if (!address) {
        return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
      }

      // Tính tổng giá trị đơn hàng và tổng số lượng sản phẩm
      const total_amount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
      const total_products = cartItems.reduce((total, item) => total + item.quantity, 0);

      // Kiểm tra phương thức thanh toán
      const paymentMethod = await PaymentMethod.findById(payment_method_id);
      if (!paymentMethod) {
        return res.status(404).json({ message: "Không tìm thấy phương thức thanh toán" });
      }

      const paymentStatus = paymentMethod.name === "MoMo" ? "pending" : "unpaid";

      // Kiểm tra số lượng sản phẩm
      for (const cartItem of cartItems) {
        const variant = await Variant.findOne({
          product_id: cartItem.product_id,
          color: cartItem.color,
          "sizes.size": cartItem.size,
        }).session(session);

        if (variant) {
          const sizeIndex = variant.sizes.findIndex((s) => s.size === cartItem.size);
          if (sizeIndex > -1) {
            if (variant.sizes[sizeIndex].quantity < cartItem.quantity) {
              await session.abortTransaction();
              return res.status(400).json({ message: `Số lượng sản phẩm ${cartItem.product_id} không đủ` });
            }
          }
        }
      }


      // Tạo đơn hàng mới
      const newOrder = new Order({
        user_id: userId,
        recipientName: address.recipientName,
        recipientPhone: address.recipientPhone,
        addressDetail: {
          street: address.addressDetail.street,
          ward: address.addressDetail.ward,
          district: address.addressDetail.district,
          city: address.addressDetail.city,
        },
        shipping_method_id,
        payment_method_id,
        total_products,
        total_amount,
        status: "pending",
        payment_status: paymentStatus,
      });

      await newOrder.save();
      console.log("Order created successfully:", newOrder);

      // Tạo các mục đơn hàng và cập nhật số lượng biến thể sản phẩm
      for (const cartItem of cartItems) {
        const orderItem = new Order_items({
          order_id: newOrder._id,
          product_id: cartItem.product_id,
          size: cartItem.size,
          color: cartItem.color,
          quantity: cartItem.quantity,
          price: cartItem.price,
          total_amount: cartItem.price * cartItem.quantity,
          image_variant: cartItem.image_variant,
        });
        await orderItem.save();

        const variant = await Variant.findOne({
          product_id: cartItem.product_id,
          color: cartItem.color,
          "sizes.size": cartItem.size,
        });

        if (variant) {
          const sizeIndex = variant.sizes.findIndex((s) => s.size === cartItem.size);
          if (sizeIndex > -1) {
            variant.sizes[sizeIndex].quantity -= cartItem.quantity;
          }
          await variant.save();
        }
      }

      // Gửi thông báo realtime

      const title = 'Thông báo đơn hàng';
      const message = `Đơn hàng của bạn đã đặt thành công! Mã đơn hàng của bạn là: Order ID ${newOrder._id}`;


      //Theem vào CSDL
      const notification = new Notification({
        title,
        message,
        type: 'personal',

      });
      await notification.save();

      // Tạo bản ghi thông báo cho người dùng cụ thể trong Notification_User
      const notificationUser = new NotificationUser({
        notification_id: notification._id,
        user_id: newOrder.user_id,
        status: 'unread',
      });
      await notificationUser.save();

      console.log('Thông báo cá nhân đã được gửi.');



      // Gửi thông báo realtime cho người dùng liên quan
      const io = req.app.locals.io;
      if (io) {
        const user = await User.findById(newOrder.user_id);
        if (user && user.socketId) {
          const socketId = user.socketId;
          console.log('Socket ID:', socketId); // Log socket ID để kiểm tra

          io.to(socketId).emit('pushnotification', {
            ...notification._doc,
            ...notificationUser._doc
          });

          console.log(`Notification sent to user ${newOrder.user_id} with socket ID ${socketId}`);
        } else {
          console.error(`Socket ID not found for user ${newOrder.user_id}`);
        }
      }

      res.status(201).json({ message: "Đặt hàng thành công", order: newOrder });
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Lỗi khi tạo đơn hàng", error: error.message });
    } finally {
      session.endSession();
    }
  },



  getOrdersByStatus: async (req, res) => {
    try {
      const userId = req.user.id; // Lấy user_id từ xác thực của người dùng
      const status = req.params.status; // Lấy trạng thái từ request params

      // Tìm tất cả đơn hàng của người dùng có trạng thái tương ứng
      const orders = await Order.find({ user_id: userId, status })
        .populate("user_id", "full_name email")
        .populate("payment_method_id", "name")
        .populate("shipping_method_id", "name")
        .exec();

      // Thêm thông tin chi tiết vào từng đơn hàng
      const ordersWithDetails = orders.map((order) => ({
        ...order._doc,
        full_name: order.user_id?.full_name,
        email: order.user_id?.email,
        recipientPhone: order.recipientPhone,
        recipientName: order.recipientName,
        addressDetail: order.addressDetail,
        payment_method: order.payment_method_id?.name,
        shipping_method: order.shipping_method_id?.name,
      }));

      res.status(200).json(ordersWithDetails);
    } catch (error) {
      console.error("Error while fetching orders by status:", error);
      res
        .status(500)
        .json({ message: "Error while fetching orders", error: error.message });
    }
  },

  getOrderItemById: async (req, res) => {
    const { orderId } = req.params;

    try {
      // Tìm kiếm đơn hàng dựa trên orderId
      const order = await Order.findById(orderId)
        .populate("user_id", "full_name email phone_number") // Lấy thông tin người dùng
        .populate("payment_method_id", "name") // Lấy phương thức thanh toán
        .populate("shipping_method_id", "name"); // Lấy phương thức vận chuyển

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Lấy các mục đơn hàng liên quan đến đơn hàng này và populate sản phẩm
      const orderItems = await Order_items.find({ order_id: orderId }).populate(
        "product_id"
      ); // Populate các trường của sản phẩm cần thiết

      res.status(200).json({ order, items: orderItems });
    } catch (error) {
      console.error("Error while fetching order:", error);
      res
        .status(500)
        .json({ message: "Error while fetching order", error: error.message });
    }
  },
  getPurchasedProducts: async (req, res) => {
    try {
      const userId = req.user.id; // Lấy user_id từ xác thực của người dùng

      // Lấy tất cả các đơn hàng có trạng thái giao hàng thành công
      const orders = await Order.find({
        user_id: userId,
        status: "delivered",
      });

      if (!orders || orders.length === 0) {
        return res
          .status(404)
          .json({ message: "Không có sản phẩm nào đã mua." });
      }

      // Lấy danh sách order_ids từ các đơn hàng
      const orderIds = orders.map((order) => order._id);

      // Lấy tất cả các mục đơn hàng từ bảng OrderItem với các order_ids đó và populate thông tin sản phẩm
      const orderItems = await Order_items.find({
        order_id: { $in: orderIds },
      }).populate("product_id", "name price imageUrls"); // Lấy thông tin sản phẩm từ bảng Product

      console.log("Order Items:", orderItems);

      if (!orderItems || orderItems.length === 0) {
        return res.status(404).json({ message: "Không có mục đơn hàng nào." });
      }

      // Xử lý và định dạng dữ liệu để trả về
      const purchasedProducts = orderItems.map((item) => ({
        product_id: item.product_id, // Đảm bảo rằng bạn trả về `product_id`
        productName: item.product_id?.name || "Sản phẩm không xác định",
        productPrice: item.price
          ? item.price.toLocaleString("vi-VN") + " Đ"
          : "N/A",
        size: item.size,
        color: item.color,
        imageVariant:
          item.image_variant || item.product_id?.imageUrls?.[0] || "N/A",
        quantity: item.quantity,
      }));

      res.status(200).json(purchasedProducts);
    } catch (error) {
      console.error("Error while fetching purchased products:", error);
      res
        .status(500)
        .json({ message: "Lỗi khi lấy sản phẩm đã mua", error: error.message });
    }
  },


  getOrdersByUser: async (req, res) => {
    try {
      const userId = req.user.id; // Lấy user_id từ xác thực của người dùng

      // Tìm tất cả đơn hàng của người dùng mà không cần join với các bảng khác
      const orders = await Order.find({ user_id: userId });

      // Trả về danh sách đơn hàng
      res.status(200).json(orders);
    } catch (error) {
      console.error("Error while fetching orders:", error);
      res.status(500).json({ message: "Error while fetching orders", error: error.message });
    }
  },
  cancelOrderByApp: async (req, res) => {
    try {
      const userId = req.user.id; // Lấy user_id từ xác thực của người dùng
      const orderId = req.params.orderId; // Lấy orderId từ request params
      const { cancelReason } = req.body; // Lấy lý do hủy từ request body

      // Kiểm tra nếu cancelReason không tồn tại
      if (!cancelReason && req.body.cancelReason === undefined) {
        return res.status(400).json({ message: "Cancel reason is required for cancellation" });
      }

      // Tìm đơn hàng dựa trên user_id và orderId
      const order = await Order.findOne({ _id: orderId, user_id: userId });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Nếu đơn hàng ở trạng thái "Đã xác nhận", chuyển sang "Đang chờ hủy"
      if (order.status === "ready_for_shipment") {
        order.status = "waiting_cancel";
        order.cancelReason = cancelReason || ""; // Lưu lý do hủy nếu có
        await order.save();
        return res.status(200).json({ message: "Order cancellation request is pending approval" });
      }


      // Nếu đơn hàng ở trạng thái "Chờ xác nhận", cho phép hủy trực tiếp
      if (order.status === "pending") {
        if (!cancelReason) {
          return res.status(400).json({ message: "Cancel reason is required for cancellation" });
        }
        order.status = "canceled";
        order.cancelReason = cancelReason; // Lưu lý do hủy
        await order.save();
        return res.status(200).json({ message: "Order has been canceled successfully" });
      } else {
        return res.status(400).json({ message: "Order cannot be canceled in the current status" });
      }
    } catch (error) {
      console.error("Error while canceling order:", error);
      res.status(500).json({ message: "Error while canceling order", error: error.message });
    }
  },
  approveCancellation: async (req, res) => {
    try {
      const orderId = req.params.orderId; // Lấy orderId từ request params

      // Tìm đơn hàng dựa trên orderId
      const order = await Order.findOne({ _id: orderId });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Chỉ cho phép phê duyệt nếu trạng thái là "Đang chờ hủy"
      if (order.status === "waiting_cancel") {
        order.status = "canceled";
        await order.save();
        return res.status(200).json({ message: "Order has been canceled successfully" });
      } else {
        return res.status(400).json({ message: "Order cannot be canceled in the current status" });
      }
    } catch (error) {
      console.error("Error while approving order cancellation:", error);
      res.status(500).json({ message: "Error while approving order cancellation", error: error.message });
    }
  },


  getStatusPayment: async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const payment = await Payment.findOne({ orderId });

      // Trả về thông tin đơn hàng kèm theo thông tin thanh toán nếu có
      res.status(200).json({
        order,
        ...(payment && {
          paymentStatus: payment.status,
          paymentMethod: payment.paymentMethod,
          transactionId: payment.transactionId,
          paymentMessage: payment.response?.message,
        }),
      });
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).json({
        message: "Failed to fetch order details",
        error: error.message,
      });
    }
  }



};

module.exports = ordersController;
