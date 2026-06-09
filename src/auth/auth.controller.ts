import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public, ResponseMessage } from '@/decorators/customize';
import { CreateAuthDto } from './dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService
  ) { }

  /* 
    Guard là 1 lớp chặn request trước khi vào controller, passport guard = guard + logic xác thực
    Ý tưởng: Khi nhận request từ user, passport guard sẽ gọi đến strategy để thực hiện xác thực người đùng, nếu pass sẽ gán user vào request
  */
  @Post("login")
  @Public() // <-- custom decorator
  @UseGuards(LocalAuthGuard) // gọi đến strategy local ở đây
  @ResponseMessage('Fetch Login') 
  handleLogin(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @Public()
  register(@Body() registerDto: CreateAuthDto) {
    return this.authService.handleRegister(registerDto);
  }

  @Get('mail')
  @Public()
  testMail() {
    this.mailerService.sendMail({
      to: "nam8anht@gmail.com",
      template: "register",
      context: {
        name: 'John Doe',
        activationCode: 123456,
      },
    });
    return "OK!";
  }
}
