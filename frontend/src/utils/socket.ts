import { io, Socket } from 'socket.io-client';
import { logger } from './logger';

let socket: Socket | null = null;

export const initSocket = (): Socket => {
  if (socket) return socket;

  socket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001', {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    logger.log('WebSocket connected');
  });

  socket.on('disconnect', () => {
    logger.log('WebSocket disconnected');
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const subscribeToPrice = (symbol: string, callback: (data: any) => void): void => {
  const s = getSocket();
  if (s) {
    s.emit('subscribe-price', symbol);
    s.on(`price:${symbol}`, callback);
  }
};

export const unsubscribeFromPrice = (symbol: string): void => {
  const s = getSocket();
  if (s) {
    s.emit('unsubscribe-price', symbol);
    s.off(`price:${symbol}`);
  }
};
