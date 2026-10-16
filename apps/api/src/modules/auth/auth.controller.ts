import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { AuthService } from './auth.service';
import { OtpSendSchema, OtpVerifySchema, RefreshSchema, type OtpSendDto, type OtpVerifyDto, type RefreshDto } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('otp/send')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(OtpSendSchema))
  send(@Body() dto: OtpSendDto) {
    return this.auth.otpSend(dto.phone);
  }

  @Public()
  @Post('otp/verify')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(OtpVerifySchema))
  verify(@Body() dto: OtpVerifyDto) {
    return this.auth.otpVerify(dto.phone, dto.code, dto.device);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(RefreshSchema))
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refresh);
  }

  @Post('logout')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(RefreshSchema))
  logout(@Body() dto: RefreshDto) {
    return this.auth.logout(dto.refresh);
  }
}
