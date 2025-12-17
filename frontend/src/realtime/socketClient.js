import { io } from 'socket.io-client';

let socket;

const getWsUrl = () => {
  // Ưu tiên WS URL riêng (nếu deploy BE/WS khác domain)
  return (
    process.env.REACT_APP_WS_URL ||
    process.env.REACT_APP_API_URL ||
    'http://localhost:5001'
  );
};

export const getSocket = () => {
  if (!socket) {
    socket = io(getWsUrl(), {
      transports: ['websocket'],
      autoConnect: false,
      auth: {
        token: localStorage.getItem('token') || '',
      },
    });

    // Optional logs (bạn có thể tắt nếu không cần)
    socket.on('connect_error', (err) => {
      // eslint-disable-next-line no-console
      console.warn('[socket] connect_error:', err?.message || err);
    });
  }

  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  // Cập nhật token mới nhất mỗi lần connect
  s.auth = {
    token: localStorage.getItem('token') || '',
  };

  if (!s.connected) {
    s.connect();
  }

  return s;
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};
