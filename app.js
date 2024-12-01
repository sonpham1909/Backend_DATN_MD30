var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");
const { Server } = require("socket.io"); // Import Socket.IO Server class
const http = require('http');
require('dotenv').config(); // Load biến môi trường từ .env

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var CategoryRouter = require('./routes/category');
var AddressRouter = require('./routes/address');
var ShippingMethodRouter = require('./routes/shipping_method');
var ResponeRouter = require('./routes/respone_review');
var ReviewRouter = require('./routes/review');
var PaymentMethodRouter = require('./routes/payment_method');
var FavoriteMethodRouter = require('./routes/favorite');
var Sub_CategoryRouter = require('./routes/sub_categorys');
var Product_sub_CategoryRouter = require('./routes/product_sub_categories');
var ProductRouter = require('./routes/product');
var OrderRouter = require('./routes/order');
var VariantRouter = require('./routes/variant');
var OrderItemRouter = require('./routes/order_item');
var CartRouter = require('./routes/cart');

var SearchRouter  = require('./routes/search');


var ReplyRouter = require('./routes/reply'); 
var MessageRouter = require('./routes/message');

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Cấu hình CORS để cho phép kết nối từ tất cả các nguồn

const allowedOrigins = [
  'http://localhost:3001', // Web app trên localhost
  'http://localhost:19006', // React Native khi chạy trên trình duyệt (Expo)
  'http://192.168.1.x:3000', // Địa chỉ IP cục bộ khi kết nối qua mạng LAN (thay x bằng đúng giá trị)
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
  credentials: true,
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/v1/users', usersRouter);
app.use('/v1/auth', authRouter);
app.use('/v1/categorys', CategoryRouter);
app.use('/v1/address', AddressRouter);
app.use('/v1/PaymentMethod', PaymentMethodRouter);
app.use('/v1/subcategorys', Sub_CategoryRouter);
app.use('/v1/ProductsubCategorys', Product_sub_CategoryRouter);
app.use('/v1/Review', ReviewRouter);
app.use('/v1/favorite', FavoriteMethodRouter);
app.use('/v1/products', ProductRouter);
app.use('/v1/shippingMethods', ShippingMethodRouter);
app.use('/v1/orders', OrderRouter);
app.use('/v1/variants', VariantRouter);
app.use('/v1/orderItems', OrderItemRouter);
app.use('/v1/Cart', CartRouter);

app.use('/v1/respone', ResponeRouter);
app.use('/v1/search',SearchRouter);

// Tạo HTTP server từ ứng dụng Express

app.use('/v1/message',MessageRouter);
app.use('/v1/reply',ReplyRouter);
app.use('/v1/respone', ResponeRouter);// Tạo HTTP server từ ứng dụng Express

const server = http.createServer(app);

// Khởi tạo một instance của Socket.IO với HTTP server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
});

server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

// Lắng nghe kết nối từ client

const User = require('./models/User'); // Import model User

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Lắng nghe sự kiện 'registerUser' từ client để lưu socket ID
  socket.on('registerUser', async (userId) => {
    try {
      // Tìm user trong MongoDB và cập nhật socketId, isConnected
      await User.findByIdAndUpdate(userId, {
        socketId: socket.id,
        isConnected: true,
      });

      console.log(`User ${userId} registered with socket ID: ${socket.id}`);
    } catch (error) {
      console.error('Error updating user socket ID:', error);
    }
  });

  // Khi client ngắt kết nối
  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);

    try {
      // Tìm user dựa trên socketId và cập nhật trạng thái
      const user = await User.findOneAndUpdate(
        { socketId: socket.id },
        {
          $set: {
            isConnected: false,
            socketId: null,
          },
        }
      );

      if (user) {
        console.log(`User ${user._id} disconnected and socket ID removed.`);
      }
    } catch (error) {
      console.error('Error updating user disconnect status:', error);
    }
  });
});

// API để gửi thông báo tới tất cả các client
app.post('/send', (req, res) => {
  const message = req.body.message;
  
  if (!message) {
    return res.status(400).send({
      error: 'Message content is required'
    });
  }

  console.log('Sending push notification:', message);

  io.emit('pushnotification', { message });  // Phát sự kiện với đúng tên

  res.status(200).send({
    message: 'Send Successfully'
  });
});

app.locals.io = io;



// Kết nối với cơ sở dữ liệu
const database = require('./config/db');
database().then(() => {
  console.log('Connected to the database');
  console.log('http://localhost:3000/');
}).catch(error => {
  console.log('Error connecting to the database');
  console.log(error);
});

// Xử lý lỗi không tìm thấy trang
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render trang lỗi
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;