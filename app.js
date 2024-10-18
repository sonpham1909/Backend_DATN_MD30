var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");
var database = require('./config/db');
require('dotenv').config(); // Load biến môi trường từ .env


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var CategoryRouter=require('./routes/category');
var AddressRouter=require('./routes/address');
var ShippingMethodRouter=require('./routes/shipping_method');

var Sub_CategoryRouter=require('./routes/sub_categorys');
var Product_sub_CategoryRouter=require('./routes/product_sub_categories');

var ProductRouter = require('./routes/product');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/v1/users', usersRouter);
app.use('/v1/auth',authRouter);
app.use('/v1/categorys',CategoryRouter);
app.use('/v1/address',AddressRouter);

app.use('/v1/subcategorys',Sub_CategoryRouter);
app.use('/v1/ProductsubCategorys',Product_sub_CategoryRouter);

app.use('/v1/products',ProductRouter);
app.use('/v1/shippingMethods', ShippingMethodRouter)

database().then(() => {
  console.log('Connected to the database');
  console.log('http://localhost:3000/');
}).catch(error => {
  console.log('Error connecting to the database');
  console.log(error);
})


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
