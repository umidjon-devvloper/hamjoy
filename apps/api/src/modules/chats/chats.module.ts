import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { ChatGateway } from './chats.gateway';
import { ModerationModule } from '../moderation/moderation.module';

@Module({
  imports: [AuthModule, ModerationModule],
  controllers: [ChatsController],
  providers: [ChatsService, ChatGateway],
})
export class ChatsModule {}
