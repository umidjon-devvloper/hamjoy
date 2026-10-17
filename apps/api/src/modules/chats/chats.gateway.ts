import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { env } from '../../env';
import { ChatsService } from './chats.service';

interface SocketUser {
  id: string;
  role: 'user' | 'moderator' | 'admin';
}

@WebSocketGateway({
  namespace: '/ws',
  cors: { origin: env.CORS_ORIGINS, credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger('ChatGateway');

  constructor(private readonly jwt: JwtService, private readonly chats: ChatsService) {}

  private userRoom(userId: string): string {
    return `user:${userId}`;
  }

  private chatRoom(chatId: string): string {
    return `chat:${chatId}`;
  }

  async handleConnection(client: Socket) {
    const token =
      (client.handshake.auth as { token?: string } | undefined)?.token ??
      (client.handshake.query.token as string | undefined);
    if (!token) {
      client.emit('error', { code: 'no_token' });
      client.disconnect();
      return;
    }
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; role: SocketUser['role'] }>(token, {
        secret: env.JWT_ACCESS_SECRET,
      });
      const user: SocketUser = { id: payload.sub, role: payload.role };
      client.data.user = user;
      await client.join(this.userRoom(user.id));
      this.logger.log(`User ${user.id} connected (${client.id})`);
    } catch {
      client.emit('error', { code: 'invalid_token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user as SocketUser | undefined;
    if (user) this.logger.log(`User ${user.id} disconnected (${client.id})`);
  }

  @SubscribeMessage('chat:subscribe')
  async subscribe(@ConnectedSocket() client: Socket, @MessageBody() chatId: string) {
    const user = client.data.user as SocketUser;
    try {
      await this.chats.getById(user.id, chatId);
    } catch {
      return { ok: false, code: 'forbidden' };
    }
    await client.join(this.chatRoom(chatId));
    return { ok: true };
  }

  @SubscribeMessage('chat:unsubscribe')
  async unsubscribe(@ConnectedSocket() client: Socket, @MessageBody() chatId: string) {
    await client.leave(this.chatRoom(chatId));
    return { ok: true };
  }

  @SubscribeMessage('chat:typing')
  async typing(@ConnectedSocket() client: Socket, @MessageBody() chatId: string) {
    const user = client.data.user as SocketUser;
    client.to(this.chatRoom(chatId)).emit('chat:typing', { chatId, userId: user.id });
    return { ok: true };
  }

  notifyNewMessage(
    recipientId: string,
    senderId: string,
    message: { id: string; chatId: string; senderId: string; body: string; mediaUrl: string | null; createdAt: Date },
  ) {
    const payload = { ...message, createdAt: message.createdAt.toISOString() };
    // Push into both the recipient's user room (for list updates / notifications)
    // and the chat room (for anyone currently viewing the thread, sender included).
    this.server.to(this.userRoom(recipientId)).emit('chat:message', payload);
    this.server.to(this.chatRoom(message.chatId)).emit('chat:message', payload);
    void senderId;
  }
}
