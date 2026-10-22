import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { DevicesController } from './devices.controller';
import { PushService } from './push.service';

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController, DevicesController],
  providers: [NotificationsService, NotificationsGateway, PushService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
