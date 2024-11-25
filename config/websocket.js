const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const configureWebSocket = (server) => {
  // Khởi tạo WebSocket server từ HTTP server và chỉ định đường dẫn
  const wss = new WebSocket.Server({ server, path: '/ws' });

  console.log('WebSocket server is listening on path /ws');

  // Lắng nghe sự kiện khi một client kết nối
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    ws.send(JSON.stringify({
      type: 'CONNECTED',
      message: 'WebSocket connection established successfully'
    }));

    ws.on('message', async (message) => {
      console.log('Received message from client:', message);
      const data = JSON.parse(message);

      if (data.type === 'REGISTER') {
        const { token } = data;

        try {
          // Giải mã token để lấy thông tin người dùng
          const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
          ws.user = decoded;

          console.log('Decoded token:', decoded);

          // Cập nhật trạng thái WebSocket của người dùng
          await User.findOneAndUpdate(
            { email: decoded.email },
            { isConnected: true, socketId: ws._socket.remotePort },
            { upsert: true, new: true }
          );
          console.log(`User ${decoded.email} registered for WebSocket notifications`);
          ws.send(JSON.stringify({ type: 'REGISTER_SUCCESS', message: 'User registered successfully' }));
        } catch (err) {
          console.error('Error verifying token:', err);
          ws.send(JSON.stringify({ type: 'REGISTER_FAILED', message: 'Invalid token' }));
        }
      }
    });

    ws.on('close', async () => {
      if (ws.user) {
        console.log(`Client disconnected: ${ws.user.email}`);
        try {
          await User.updateOne({ email: ws.user.email }, { isConnected: false });
          console.log(`User ${ws.user.email} status updated to disconnected`);
        } catch (err) {
          console.error('Error updating user on disconnect:', err);
        }
      } else {
        console.log('Client disconnected without registering');
      }
    });
  });
};

module.exports = configureWebSocket;
