const sendEmail = require("../config/sendEmailVerifi");
const VerificationCode = require("../models/VerificationCode");


const sendVerifiController = {
    sendVerifiEmail: async (req, res) => {
        const { email } = req.body;

        // Kiểm tra email đã tồn tại mã xác thực hay chưa
        const existingCode = await VerificationCode.findOne({ email });
        if (existingCode) {
            return res.status(400).json({ message: 'Mã xác thực đã được gửi trước đó.' });
        }

        // Tạo mã xác thực và thời gian hết hạn
        const code = Math.floor(100000 + Math.random() * 900000); // Mã xác thực 6 chữ số
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // Mã hết hạn sau 10 phút

        // Lưu mã xác thực vào CSDL
        const verificationEntry = new VerificationCode({
            email,
            code,
            expiry,
        });

        try {
            await verificationEntry.save();
            await sendEmail(email, code); // Gửi email với mã xác thực
            res.status(200).json({ message: 'Mã xác thực đã được gửi vào email của bạn.' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi lưu mã xác thực' });
        }
    },

    verifiCode: async (req, res) => {
        const { email, code } = req.body;

        // Kiểm tra mã xác thực
        const entry = await VerificationCode.findOne({ email });
      
        if (!entry) {
          return res.status(400).json({ message: 'Mã xác thực không tồn tại' });
        }
      
        if (entry.code !== code) {
          return res.status(400).json({ message: 'Mã xác thực không đúng' });
        }
      
        if (entry.expiry < Date.now()) {
          return res.status(400).json({ message: 'Mã xác thực đã hết hạn' });
        }
      
        // Xóa mã xác thực sau khi xác minh
        await VerificationCode.deleteOne({ email });
      
        res.status(200).json({ message: 'Xác thực thành công!' });


    }


}

module.exports = sendVerifiController;