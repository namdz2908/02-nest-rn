import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, IsEmail, IsMongoId, IsOptional } from 'class-validator';

export class UpdateUserDto {
    @IsMongoId({message: '_id không hợp lệ'})
    @IsNotEmpty({message: '_Id không được để trống'})
    _id: string;

    // Trong main.ts, đã set whitelist: true nên hệ thống sẽ bỏ qua những object của properties không có decorator
    // Nếu không có decorator nào phù hợp thì sử dụng @Allow
    @IsOptional() // truyền lên hay không cũng được
    name: string;

    @IsOptional()
    phone: string;
    
    @IsOptional()
    address: string;
    
    @IsOptional()
    image: string;
}
