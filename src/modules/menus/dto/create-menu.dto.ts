import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMenuDto {
    @IsNotEmpty({ message: 'restaurant ID không được để trống' })
    restaurant: string;

    @IsNotEmpty({ message: 'title không được để trống' })
    title: string;

    @IsOptional()
    description?: string;

    @IsOptional()
    image?: string;
}

