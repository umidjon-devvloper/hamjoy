import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { env } from '../../env';

interface SocketUser {
  id: string;
  role: 'user' | 'moderator' | 'admin';
}

/**
 * Separate gateway on the same /ws namespace as the chat gateway. Clients
 * sign in with the same JWT; this one only joins the per-user room and
 * emits "notification:new" when something is pushed through push().
 */
@WebSocketGateway({
  namespace: '/ws',
  cors: { origin: env.CORS_ORIGINS, credentials: true },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger('NotificationsGateway');

  constructor(private readonly jwt: JwtService) {}

  private userRoom(userId: string): string {
    return `user:${userId}`;
  }

  async handleConnection(client: Socket) {
    const token =
      (client.handshake.auth as { token?: string } | undefined)?.token ??
      (client.handshake.query.token as string | undefined);
    if (!token) return; // ChatGateway on the same namespace handles the disconnect.
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; role: SocketUser['role'] }>(token, {
        secret: env.JWT_ACCESS_SECRET,
      });
      await client.join(this.userRoom(payload.sub));
    } catch {
      /* Chat gateway on the same namespace already emits + disconnects on bad tokens. */
    }
  }

  handleDisconnect(_client: Socket) {
    // No-op; connection lifetime is owned by the chat gateway.
  }

  push(userId: string, notification: {
    id: string;
    type: string;
    payload: Record<string, unknown>;
    createdAt: Date | string;
  }) {
    const createdAt =
      typeof notification.createdAt === 'string' ? notification.createdAt : notification.createdAt.toISOString();
    this.server.to(this.userRoom(userId)).emit('notification:new', { ...notification, createdAt });
  }
}
