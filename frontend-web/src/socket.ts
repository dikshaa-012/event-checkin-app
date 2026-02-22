import io from 'socket.io-client';

const socket = io('https://event-checkin-app-qjj9.onrender.com', { transports: ['websocket'] });

export default socket;
