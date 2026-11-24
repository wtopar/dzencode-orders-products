import { io, Socket } from 'socket.io-client';

// Same-origin socket (dev proxy / nginx proxy forward to the Node server)
export const socket: Socket = io('/', { autoConnect: true });
