import { MESSAGES } from "@nestjs/core/constants";
import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty({ message: "name không được để trống!" }) // validate dữ liệu bằng cách set các rule
    name: string;

    @IsNotEmpty({ message: "name không được để trống!" })
    @IsEmail({}, { message: 'email không đúng định dạng' })
    email: string;

    @IsNotEmpty({ message: "Mật khẩu không được để trống" })
    password: string;


    phone: string;


    address: string;


    image: string;


    // codeId: string;


    // codeExpired: Date;

}

