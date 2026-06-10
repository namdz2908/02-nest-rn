
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '@/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { comparePasswordHelper } from '@/helpers/utils';
import { CreateAuthDto, CodeAuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService
  ) { }

  // logic xác thực mật khẩu viết chay
  async signIn(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(username);
    const isValidPassword = await comparePasswordHelper(pass, user?.password);
    if (!isValidPassword) {
      throw new UnauthorizedException("Username/Password không hợp lệ!");
    }

    const payload = { sub: user._id, username: user.email };
    return {
      // 💡 Here the JWT secret key that's used for signing the payload 
      // is the key that was passed in the JwtModule
      access_token: await this.jwtService.signAsync(payload),
    };

  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(username);
    if (!user) return null;
    const isValidPassword = await comparePasswordHelper(pass, user?.password);

    if (!isValidPassword) return null;

    return user;

    // const payload = { sub: user._id, username: user.email };
    // return {
    //   // 💡 Here the JWT secret key that's used for signing the payload 
    //   // is the key that was passed in the JwtModule
    //   access_token: await this.jwtService.signAsync(payload),
    // };

  }

  async login(user: any) {
    const payload = { username: user.email, sub: user._id, accountRole: user.role };
    return {
      user: {
        email: user.email,
        _id: user._id,
        name: user.name
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  // Tái sử dụng CreateAuthDto làm luồng đăng ký tài khoản
  handleRegister = async (registerDto: CreateAuthDto) => {
    return await this.usersService.handleRegister(registerDto);
  }

  checkCode = async (data: CodeAuthDto) => {
    return await this.usersService.handleActive(data);
  }
}
