// websocket/server.ts
import { WebSocketServer } from 'ws';
import { db } from '../models';

const initWebSocket = () => {
  const wss = new WebSocketServer({ port: 8080 });

  wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
      try {
        const { synthId } = JSON.parse(message.toString());
        
        // Récupérer l'enchère
        const auction = await db.AuctionPrice.findOne({
          where: { synthetiserId: synthId },
          order: [['createdAt', 'DESC']]
        });

        // Broadcast
        wss.clients.forEach(client => {
          client.send(JSON.stringify(auction));
        });
      } catch (error) {
        console.error('WebSocket error:', error);
      }
    });
  });
};

export default initWebSocket;