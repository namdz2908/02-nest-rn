import { IsEmail, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateRestaurantDto {
    @IsNotEmpty({ message: 'Tên nhà hàng không được để trống' })
    name: string;

    @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
    phone: string;

    @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
    address: string;

    @IsNotEmpty({ message: 'Email không được để trống' })
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    email: string;

    @IsOptional()
    @IsNumber({}, { message: 'Rating phải là số' })
    rating?: number;

    @IsOptional()
    hours?: string;
}

