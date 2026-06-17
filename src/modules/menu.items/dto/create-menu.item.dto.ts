import { IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateMenuItemDto {
    @IsNotEmpty({ message: 'menu ID không được để trống' })
    menu: string;

    @IsNotEmpty({ message: 'category ID không được để trống' })
    category: string;

    @IsNotEmpty({ message: 'title không được để trống' })
    title: string;

    @IsOptional()
    description?: string;

    @IsNotEmpty({ message: 'basePrice không được để trống' })
    @IsNumber({}, { message: 'basePrice phải là số' })
    basePrice: number;

    @IsOptional()
    image?: string;

    @IsOptional()
    @IsBoolean({ message: 'enabled phải là kiểu boolean' })
    enabled?: boolean;
}

