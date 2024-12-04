const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // Sử dụng Gmail (hoặc dịch vụ SMTP khác)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (email, code) => {
  console.log(process.env.EMAIL_USER);
  console.log(process.env.EMAIL_PASS);
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Mã xác thực của bạn',
    text: `Mã xác thực của bạn là: ${code}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email đã được gửi!');
  } catch (error) {
    console.error('Lỗi khi gửi email:', error);
    throw new Error('Không thể gửi email');
  }
};

module.exports = sendEmail;
