
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '@/decorators/customize';
import { Reflector } from '@nestjs/core';

// Cấu hình global cho jwtAuthGuard để không cần khai báo ở mỗi endpoint
/* 
    Tuy nhiên, điều này làm cho khi user muốn đăng nhập tài khoản hoặc đăng ký tài khoản mới jwtAuthGuard cũng yêu cầu xác thực trong khi chưa có acess_token nào
    --> Tạo 1 custom decorator sử dụng decorator factory function SetMetadata của nestjs.
    * decorator factory function là 1 hàm trả về 1 decorator với cấu hình tùy biến
*/
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    /*
        reflector.getAllAndOverride(key, [handler, class]);
        Dùng để tìm metadata theo key: tìm ở handler (các function) trước, nếu không có thì tìm trong class, nếu có nhiều
        thì ưu tiên method override class
        --> Flow khi chạy nếu gắn decorator: 
            Nhận request -> Guard chạy -> Reflector đọc metadata có key IS_PUBLIC_KEY -> đọc được true -> isPublic = true -> canActivate trả về true bypass -> Guard không chạy auth
        --> Flow khi chạy không gắn decorator:
            Nhận request -> Guard chạy -> Không có metadata -> isPublic = undefined -> gọi super().canActivate()
            Ở đây super().canActivate() là gọi đến hàm canActivate của AuthGuard('jwt') xử lý auth 
    */
    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) { 
            return true;
        }
        return super.canActivate(context);
    }

    handleRequest(err, user, info) {
        // You can throw an exception based on either "info" or "err" arguments
        if (err || !user) {
            throw err || new UnauthorizedException('access_token không hợp lệ hoặc không có tại header');
        }
        return user;
    }
}

