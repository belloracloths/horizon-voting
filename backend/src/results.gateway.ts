// backend/src/results.gateway.ts
import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' }, 
})
export class ResultsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server; // 

  afterInit(server: Server) {
    console.log('🚀 Socket.io Gateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(` Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(` Client disconnected: ${client.id}`);
  }

  notifyVoteUpdate(societyId: number) {
    console.log(`📢 Broadcasting vote update for Society ID: ${societyId}`);
    this.server.emit('voteUpdated', { 
      societyId,
      timestamp: new Date().toISOString(),
    });
  }
}