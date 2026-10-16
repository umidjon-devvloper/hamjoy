import { Injectable, Logger } from '@nestjs/common';
import { env } from '../../env';

@Injectable()
export class SmsService {
  private readonly logger = new Logger('Sms');

  async send(phone: string, text: string): Promise<void> {
    if (!env.ESKIZ_EMAIL || !env.ESKIZ_PASSWORD) {
      // Dev mode — log the code to console so developer can read it.
      this.logger.log(`[DEV SMS] → ${phone}  :  ${text}`);
      return;
    }
    // TODO (Faza 1.5): real Eskiz.uz integration.
    this.logger.warn('Eskiz integration not implemented yet — logging instead.');
    this.logger.log(`[SMS] → ${phone}  :  ${text}`);
  }
}
