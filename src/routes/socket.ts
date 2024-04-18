import http from 'http';
import { Server } from 'socket.io';

export function useSocket(server: http.Server) {
  const io = new Server(server);
  io.on('connection', () => {
    console.log('connection');
  })
}
