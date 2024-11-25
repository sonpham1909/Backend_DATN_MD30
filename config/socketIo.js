const userNamespace = require('../namespaces/userNamespace');

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
  });

  // Thiết lập namespace cho người dùng
  userNamespace(io)
};

module.exports = { setupSocket };
