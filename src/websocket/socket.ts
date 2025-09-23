import { Server } from 'socket.io';
import http from 'http';
import { playerBonusService } from '../services/PlayerBonusService';

export let io: Server;

export function initSocket(server: http.Server) {
  io = new Server(server, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on("joinPlayerRoom", ({ playerId }) => {
      socket.join(playerId);
    });
    socket.on('startActivity', async({playerId}) => {
      const bonus = await playerBonusService.processOnPlay(playerId);
      for(const bonus_ of bonus) {
        io.emit('bonusNotification', bonus_ );
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}
