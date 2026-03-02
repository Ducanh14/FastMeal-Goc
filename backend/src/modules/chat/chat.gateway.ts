import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3001',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, { userId: string; role: string; name: string }>();

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('register')
  async handleRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; role: string; name: string },
  ) {
    this.connectedUsers.set(client.id, data);

    if (data.role === 'staff') {
      client.join('staff-room');
    }
    if (data.role === 'admin') {
      client.join('admin-room');
    }

    return { status: 'ok' };
  }

  // Customer starts chat with staff
  @SubscribeMessage('customer:startChat')
  async handleCustomerStartChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; userName: string },
  ) {
    const conversation = await this.chatService.getOrCreateConversation(
      'customer-staff',
      data.userId,
      data.userName,
      'customer',
    );

    client.join(`conversation:${conversation._id}`);
    const messages = await this.chatService.getMessages(String(conversation._id));

    this.server.to('staff-room').emit('conversations:updated');

    return { conversationId: conversation._id, messages };
  }

  // Staff starts chat with admin
  @SubscribeMessage('staff:startAdminChat')
  async handleStaffStartAdminChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; userName: string },
  ) {
    const conversation = await this.chatService.getOrCreateConversation(
      'staff-admin',
      data.userId,
      data.userName,
      'staff',
    );

    client.join(`conversation:${conversation._id}`);
    const messages = await this.chatService.getMessages(String(conversation._id));

    this.server.to('admin-room').emit('conversations:updated');

    return { conversationId: conversation._id, messages };
  }

  // Send message (generic for all conversation types)
  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: string;
      senderId: string;
      senderName: string;
      senderRole: string;
      content: string;
    },
  ) {
    const message = await this.chatService.saveMessage(data);

    this.server
      .to(`conversation:${data.conversationId}`)
      .emit('message:received', message);

    this.server.to('staff-room').emit('conversations:updated');
    this.server.to('admin-room').emit('conversations:updated');

    return message;
  }

  // Responder joins a conversation (staff joins customer chat, or admin joins staff chat)
  @SubscribeMessage('responder:joinConversation')
  async handleResponderJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      conversationId: string;
      responderId: string;
      responderName: string;
      responderRole: string;
    },
  ) {
    client.join(`conversation:${data.conversationId}`);

    await this.chatService.assignResponder(
      data.conversationId,
      data.responderId,
      data.responderName,
      data.responderRole,
    );

    const messages = await this.chatService.getMessages(data.conversationId);
    await this.chatService.markAsRead(data.conversationId, data.responderId);

    return { messages };
  }

  // Get conversations by type
  @SubscribeMessage('getConversations')
  async handleGetConversations(
    @MessageBody() data: { type: 'customer-staff' | 'staff-admin' },
  ) {
    return this.chatService.getConversationsByType(data.type);
  }

  // Mark messages as read
  @SubscribeMessage('messages:markRead')
  async handleMarkRead(
    @MessageBody() data: { conversationId: string; userId: string },
  ) {
    await this.chatService.markAsRead(data.conversationId, data.userId);
    this.server.to('staff-room').emit('conversations:updated');
    this.server.to('admin-room').emit('conversations:updated');
    return { status: 'ok' };
  }
}
