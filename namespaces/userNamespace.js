module.exports = (io) => {
  const userNamespace = io.of('/user');

  // Lưu trữ các kết nối người dùng
  const connectedUsers = {};

  userNamespace.on('connection', (socket) => {
    console.log('User connected to /user namespace:', socket.id);

    // Đăng ký userId với socket.id
    socket.on('registerUser', (userId) => {
      connectedUsers[userId] = socket.id;
      console.log(`User ${userId} registered with socket ID: ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      for (const userId in connectedUsers) {
        if (connectedUsers[userId] === socket.id) {
          delete connectedUsers[userId];
          break;
        }
      }
    });
  });

  // Hàm gửi thông báo
  const sendNotification = (userId, message) => {
    const socketId = connectedUsers[userId];
    if (socketId) {
      userNamespace.to(socketId).emit('orderSuccess', message);
    }
  };

  // Xuất hàm gửi thông báo để sử dụng trong các phần khác của ứng dụng
  module.exports.sendNotification = sendNotification;
};
