import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public } from '@/decorators/customize';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /* 
    Guard là 1 lớp chặn request trước khi vào controller, passport guard = guard + logic xác thực
    Ý tưởng: Khi nhận request từ user, passport guard sẽ gọi đến strategy để thực hiện xác thực người đùng, nếu pass sẽ gán user vào request
  */
  @Post("login")
  @Public() // <-- custom decorator
  @UseGuards(LocalAuthGuard) // gọi đến strategy local ở đây 
  handleLogin(@Request() req) {
    return this.authService.login(req.user); 
  }

  @Get('profile')
  // @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user;
  }
}
