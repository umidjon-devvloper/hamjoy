import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { ChatGateway } from './chats.gateway';
import { ChatsService } from './chats.service';
import {
  ListMessagesQuerySchema,
  SendMessageSchema,
  StartChatSchema,
  type ListMessagesQuery,
  type SendMessageDto,
  type StartChatDto,
} from './dto';

@ApiTags('chats')
@ApiBearerAuth()
@Controller('chats')
export class ChatsController {
  constructor(private readonly svc: ChatsService, private readonly gateway: ChatGateway) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.svc.listMine(user.id);
  }

  @Post()
  start(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(StartChatSchema)) dto: StartChatDto,
  ) {
    return this.svc.startOrGet(user.id, dto.listingId);
  }

  @Get(':id/messages')
  messages(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query(new ZodValidationPipe(ListMessagesQuerySchema)) q: ListMessagesQuery,
  ) {
    return this.svc.listMessages(user.id, id, q.cursor, q.limit);
  }

  @Post(':id/messages')
  async send(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(SendMessageSchema)) dto: SendMessageDto,
  ) {
    const { message, recipientId } = await this.svc.send(user.id, id, dto.body, dto.mediaUrl ?? null);
    this.gateway.notifyNewMessage(recipientId, user.id, message);
    return message;
  }

  @Post(':id/read')
  read(@CurrentUser() user: AuthUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.markRead(user.id, id);
  }
}
